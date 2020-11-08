import { Request, Response } from 'express'
import * as razorpay from '../../payments/razorpay'
import * as settings from '../../models/settings'
import * as user from '../../models/user'
import * as voucher from '../../models/voucher'
import * as saleDiscount from '../../models/saleDiscount'
import * as productType from '../../models/productType'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as order from '../../models/order'
import { OrderType } from '../../models/order/schema'
import { badRequest, missingParam, serverError } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { addVariantToOrder, aggregateData, calculateData, calculateShipping, calculateVoucherDiscount, combineData, createDraft, isDraft } from './helper'
import { uniqueArr } from '../../utils/arrayUtils'
import { isValidAddress } from '../../models/common'
import { setUserBillingAddress, setUserShippingAddress } from '../user/helper'
import { batch } from '../../config/db'

export async function create(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const userData = await user.get(uid)
        const id = await createDraft(userData, data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function calculateDraft(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const now = Date.now()
        const orderData = await order.getOneByCondition([
            { field: 'userId', type: '==', value: uid },
            { field: 'orderStatus', type: '==', value: 'draft' }
        ])
        if (!orderData) {
            return badRequest(res, 'No draft found')
        }
        const { variants, shippingRateId, voucherId } = orderData

        let saleDiscounts = await saleDiscount.getByCondition([
            { field: 'status', type: '==', value: 'active' },
            { field: 'startDate', type: '<=', value: now },
            { field: 'startDate', type: '>', value: 0 }
        ])
        if (saleDiscounts) {
            saleDiscounts = saleDiscounts.filter(sd => sd.endDate < now)
            saleDiscounts = saleDiscounts.length > 0 ? saleDiscounts : null
        }

        const variantIds = variants.map(v => v.variantId)
        const allVariantData = await Promise.all(variantIds.map(async variantId => {
            return await variant.get(variantId)
        }))

        const productIds = uniqueArr(allVariantData.map(v => v.productId))
        const allProductData = await Promise.all(productIds.map(async productId => {
            return await product.get(productId)
        }))

        const productTypeIds = uniqueArr(allProductData.map(p => p.productTypeId))
        const allProductTypeData = await Promise.all(productTypeIds.map(productTypeId => {
            return productType.get(productTypeId)
        }))

        const allData = combineData(variants, allVariantData, allProductData, allProductTypeData, saleDiscounts)
        const allDataCalculated = await calculateData(allData)
        const allDataAggregated = aggregateData(allDataCalculated)
        let shippingCharge = await calculateShipping(shippingRateId, allDataAggregated)
        const voucherCalculated = await calculateVoucherDiscount(uid, voucherId, allProductData, allDataCalculated, allDataAggregated, shippingCharge)
        shippingCharge = voucherCalculated.shippingCharge
        const { voucherDiscount } = voucherCalculated
        const { subTotal, saleDiscount: saleDiscountValue, taxes, total } = allDataAggregated
        const grandTotal = total + shippingCharge - voucherDiscount
        const result = {
            subTotal,
            saleDiscount: saleDiscountValue,
            voucherDiscount,
            taxCharge: taxes,
            shippingCharge,
            total: grandTotal >= 0 ? grandTotal : 0
        }
        allData.forEach(async data => {
            const { orderQuantity, variantId, trackInventory } = data
            if (trackInventory) {
                const variantData = allVariantData.find(v => v.variantId === variantId)!
                variantData.bookedQuantity += orderQuantity
                batch.set(variant.getRef(variantId), variantData)
            }
        })
        const updatedOrderData = { ...orderData, ...result }
        batch.set(order.getRef(orderData.orderId), updatedOrderData)
        await batch.commit()
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addVoucher(req: Request, res: Response, next: Function) {
    try {
        const { id: draftId } = req.params
        const { data }: { data: { code: string } } = req.body
        const { code } = data
        if (!code) {
            return missingParam(res, 'Voucher')
        }
        const voucherData = await voucher.getOneByCondition([{
            field: 'code', type: '==', value: code
        }])
        if (!voucherData) {
            return badRequest(res, 'Invalid code')
        }
        const { voucherId } = voucherData
        const { startDate, endDate, status } = voucherData
        const now = Date.now()
        if (status === 'inactive') {
            return badRequest(res, 'Voucher Expired')
        }
        if (startDate > now) {
            return badRequest(res, 'Invalid code')
        }
        if (endDate > 0 && endDate < now) {
            return badRequest(res, 'Voucher Expired')
        }
        const orderData = await order.get(draftId)
        if (!isDraft(orderData)) {
            return badRequest(res, 'Not a draft')
        }
        if (orderData.voucherId === voucherId) {
            return badRequest(res, 'Voucher already applied')
        }
        orderData.voucherId = voucherId
        await order.set(draftId, orderData)
        return next()
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addVariant(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const { variants, userId } = data
        if (!variants || !Array.isArray(variants) || variants.length <= 0) {
            return missingParam(res, 'Variant')
        }
        let orderData = await order.getOneByCondition([
            { field: 'userId', type: '==', value: userId || uid },
            { field: 'orderStatus', type: '==', value: 'draft' }
        ]);
        if (orderData) {
            const { orderId } = orderData
            orderData = addVariantToOrder(orderData, variants)
            await order.set(orderId, orderData)
            return successUpdated(res)
        } else {
            const userData = await user.get(userId || uid)
            const id = await createDraft(userData, data)
            return successResponse(res, { id })
        }
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeVariant(req: Request, res: Response, next: Function) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: { variantId: string } } = req.body
        const { variantId } = data
        if (!variantId) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(orderId)
        if (!isDraft(orderData)) {
            return badRequest(res, 'Not a draft')
        }
        const { variants } = orderData
        orderData.variants = variants.filter(v => v.variantId !== variantId)
        if (orderData.variants.length === 0) {
            orderData.voucherId = ''
            orderData.giftCardId = ''
        }
        await order.set(orderId, orderData)
        return next()
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function finalize(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const { orderId, shippingAddress, billingAddress } = data
        if (!orderId) {
            return missingParam(res, 'Order ID')
        }

        const orderData = await order.get(orderId)
        if (orderData.orderStatus !== 'draft') {
            return badRequest(res, 'Not a draft')
        }

        let userData = await user.get(uid)
        if (billingAddress && isValidAddress(billingAddress)) {
            orderData.billingAddress = billingAddress
            userData = setUserBillingAddress(userData, billingAddress)
        } else {
            return badRequest(res, 'Invalid Billing Address')
        }
        if (billingAddress && !shippingAddress && isValidAddress(billingAddress)) {
            orderData.shippingAddress = billingAddress
            userData = setUserShippingAddress(userData, billingAddress)
        } else if (shippingAddress && isValidAddress(shippingAddress)) {
            orderData.shippingAddress = shippingAddress
            userData = setUserShippingAddress(userData, billingAddress)
        } else {
            return badRequest(res, 'Invalid Shipping Address')
        }

        const settingsData = await settings.getGeneralSettings()
        const { currency } = settingsData
        if (!currency) {
            return badRequest(res, 'Currency required')
        }

        const { total, notes } = orderData
        const razorpayOrderId = await razorpay.createOrder(total, currency, orderId, notes)
        await order.set(orderId, {
            ...orderData,
            gatewayOrderId: razorpayOrderId.id
        })
        return successResponse(res, razorpayOrderId)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
