import { Request, Response } from 'express'
import * as user from '../../models/user'
import * as voucher from '../../models/voucher'
import * as saleDiscount from '../../models/saleDiscount'
import * as productType from '../../models/productType'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as shipping from '../../models/shipping'
import * as tax from '../../models/tax'
import * as order from '../../models/order'
import { OrderType } from '../../models/order/schema'
import { badRequest, missingParam, serverError } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { addVariantToOrder, AggregateType, createDraft, isDraft } from './helper'
import { mergeDuplicatesArrObj, uniqueArr } from '../../utils/arrayUtils'
import { isDefined } from '../../utils/isDefined'
import { getDiscount, getTax } from '../../utils/calculation'

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
        const { id: draftId } = req.params
        const now = Date.now()
        const orderData = await order.get(draftId)
        const { variants, shippingAddress } = orderData

        const saleDiscounts = await saleDiscount.getByCondition([
            { field: 'status', type: '==', value: 'active' },
            { field: 'startDate', type: '>=', value: now },
            { field: 'endDate', type: '<=', value: now }
        ])

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

        const allData = allVariantData.map(variantData => {
            const { productId, variantId } = variantData
            const orderQuantity = variants.find(v => v.variantId === variantId)!.quantity
            const baseProduct = allProductData.find(p => p.productId === productId)!
            const { productTypeId } = baseProduct
            const baseProductType = allProductTypeData.find(p => p.productTypeId === productTypeId)!
            const { categoryId, allCategoryId, collectionId } = baseProduct
            allCategoryId.push(categoryId)
            const cids = uniqueArr(allCategoryId)
            const productDiscount = saleDiscounts?.find(sd => sd.productId.includes(productId))
            const categoryDiscount = saleDiscounts?.find(sd => sd.categoryId.some(cid => cids.includes(cid)))
            const collectionDiscount = saleDiscounts?.find(sd => sd.collectionId.some(cid => collectionId.includes(cid)))
            const data = {
                ...variantData,
                orderQuantity,
                baseProduct,
                baseProductType
            }
            if (productDiscount) {
                return { ...data, discount: productDiscount }
            } else if (categoryDiscount) {
                return { ...data, discount: categoryDiscount }
            } else if (collectionDiscount) {
                return { ...data, discount: collectionDiscount }
            } else {
                return { ...data, discount: null }
            }
        }).filter(isDefined)

        const aggregate = await Promise.all(allData.map(async data => {
            const { price, orderQuantity, discount, baseProductType, baseProduct } = data
            const { chargeTax } = baseProduct
            const { taxId } = baseProductType
            const subTotal = price * orderQuantity
            let total = subTotal
            let taxes = 0
            if (discount) {
                const { value, valueType } = discount
                if (valueType === 'fixed') {
                    total -= value
                } else {
                    total = getDiscount(price, value)
                }
            }
            if (chargeTax) {
                const taxData = await tax.get(taxId)
                const { value, valueType } = taxData
                if (valueType === 'fixed') {
                    taxes += value
                } else {
                    taxes = getTax(subTotal, value)
                }
            }
            return { subTotal, total, taxes }
        })).then(agg => mergeDuplicatesArrObj(agg) as AggregateType)

        if (shippingAddress) {
            const { country, zip } = shippingAddress
            let shippingData = await shipping.getOneByCondition([{
                field: 'zipCode',
                type: 'array-contains',
                value: zip
            }])
            if (!shippingData) {
                shippingData = await shipping.getOneByCondition([{
                    field: 'countries',
                    type: 'array-contains',
                    value: country
                }])
            }
        }
        return aggregate
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addVoucher(req: Request, res: Response) {
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
        return successUpdated(res)
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

export async function removeVariant(req: Request, res: Response) {
    try {
        const { orderId } = req.params
        const { variantIds }: { variantIds: string[] } = req.body
        if (!variantIds || !Array.isArray(variantIds) || variantIds.length <= 0) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(orderId)
        if (!isDraft(orderData)) {
            return badRequest(res, 'Not a draft')
        }
        const { variants } = orderData
        orderData.variants = variants.filter(v => !variantIds.includes(v.variantId))
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
