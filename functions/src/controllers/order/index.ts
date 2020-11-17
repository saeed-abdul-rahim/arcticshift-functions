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
import { Fullfill, OrderType } from '../../models/order/schema'
import { badRequest, missingParam, serverError } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { addVariantToOrder, aggregateData, calculateData, calculateShipping, calculateVoucherDiscount, combineData, createDraft, getFullfillmentStatus, isDraft } from './helper'
import { uniqueArr } from '../../utils/arrayUtils'
import { isValidAddress } from '../../models/common'
import { setUserBillingAddress, setUserShippingAddress } from '../user/helper'
import { db } from '../../config/db'
import { Role } from '../../models/common/schema'

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

        const allData = await combineData(variants, allVariantData, allProductData, allProductTypeData, saleDiscounts)
        const allDataCalculated = calculateData(allData)
        const allDataAggregated = aggregateData(allDataCalculated)
        
        const shippingCalculated = await calculateShipping(shippingRateId, allDataAggregated)
        let { shippingCharge } = shippingCalculated
        const { shippingRateData } = shippingCalculated

        const voucherCalculated = await calculateVoucherDiscount(uid, voucherId, allProductData, allDataCalculated, allDataAggregated, shippingCharge)
        shippingCharge = voucherCalculated.shippingCharge
        const { voucherDiscount, voucherData } = voucherCalculated
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
        const batch = db.batch()
        const updatedOrderData = {
            ...orderData,
            ...result,
            data: {
                productsData: allData,
                shippingRateData,
                voucherData
            }
        }
        order.batchSet(batch, orderData.orderId, updatedOrderData)
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

export async function updateVariants(req: Request, res: Response, next: Function) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: OrderType } = req.body
        const { variants } = data
        if (!variants) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(orderId)
        if (!isDraft(orderData)) {
            return badRequest(res, 'Not a draft')
        }
        orderData.variants = variants
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

export async function addTrackingCode(req: Request, res: Response) {
    try {
        const { data }: { data: { orderId?: string, warehouseId?: string, trackingCode?: string } } = req.body
        const { orderId, warehouseId, trackingCode } = data
        if (!orderId) {
            return missingParam(res, 'Order ID')
        }
        if (!warehouseId) {
            return missingParam(res, 'Warehouse ID')
        }
        if (!trackingCode) {
            return missingParam(res, 'Tracking Code')
        }
        const orderData = await order.get(orderId)
        const { fullfilled } = orderData
        const otherData = fullfilled.filter(f => f.warehouseId !== warehouseId)
        let warehouseData = fullfilled.filter(f => f.warehouseId === warehouseId)
        warehouseData = warehouseData.map(wData => {
            wData.trackingId = trackingCode
            return wData
        })
        warehouseData = warehouseData.concat(otherData)
        await order.set(orderId, {
            ...orderData,
            fullfilled: warehouseData
        })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function fullfill(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: OrderType } = req.body
        const { fullfilled } = data
        const batch = db.batch()

        if (!orderId) {
            return missingParam(res, 'Order ID')
        }
        if (!fullfilled || !Array.isArray(fullfilled) || fullfilled.length === 0) {
            return missingParam(res, 'Variants')
        }
        const variantIds = fullfilled.map(o => o.variantId)
        if (!variantIds || variantIds.length === 0) {
            return missingParam(res, 'Variants')
        }

        // GET ORDER ID
        const orderData = await order.get(orderId)
        const { variants: variantQty, fullfilled: orderFullfilled } = orderData
        let { orderStatus } = orderData
        if (orderStatus === 'draft') {
            return badRequest(res, 'Not a valid order')
        }
        if (orderStatus === 'cancelled') {
            return badRequest(res, 'Order already cancelled')
        }

        const orderVariantIds = variantQty.map(v => v.variantId)
        const invalidVariant = variantIds.some(v => !orderVariantIds.includes(v))
        if (invalidVariant) {
            return badRequest(res, 'Invalid Variant')
        }
        const fullfilledVariantIds = orderFullfilled.map(v => v.variantId)
        const fullfillmentNew = fullfilled.filter(f => !fullfilledVariantIds.includes(f.variantId))
        const fullfillmentToUpdate = fullfilled.filter(f => fullfilledVariantIds.includes(f.variantId))
        let updatedFullfillment: Fullfill[] = []
        if (fullfillmentNew.length > 0) {
            updatedFullfillment = updatedFullfillment.concat(fullfillmentNew)
        }
        if (fullfillmentToUpdate.length > 0) {
            updatedFullfillment = updatedFullfillment.concat(fullfillmentToUpdate)
        }
        const fullfillmentOld = orderFullfilled.filter(f => !updatedFullfillment.map(uf => uf.variantId).includes(f.variantId))
        if (fullfillmentOld.length > 0) {
            updatedFullfillment = updatedFullfillment.concat(fullfillmentOld)
        }

        const variantsData = await Promise.all(variantIds.map(async variantId => await variant.get(variantId)))
        const variantsToTrackInventory = variantsData.filter(v => v.trackInventory)

        // UPDATE QUANTITY
        variantsToTrackInventory.forEach(variantData => {
            const { warehouseQuantity, variantId } = variantData
            let { bookedQuantity } = variantData
            if (!warehouseQuantity) {
                throw new Error(`Warehouses not found for variant: ${variantId}`)
            }

            const variantFullfillOld = orderFullfilled.filter(f => f.variantId === variantId)
            const variantFullfillNew = fullfilled.filter(f => f.variantId === variantId)
            const totalNewQuantity = variantFullfillNew.map(o => o.quantity).reduce((sum, curr) => sum + curr, 0)

            // REDUCE BOOKED QUANTITY
            if (variantFullfillOld.length > 0 && variantFullfillNew.length > 0) {
                const totalOldQuantity = variantFullfillOld.map(o => o.quantity).reduce((sum, curr) => sum + curr, 0)
                if (totalOldQuantity < totalNewQuantity) {
                    bookedQuantity -= (totalNewQuantity - totalOldQuantity)
                } else if (totalOldQuantity > totalNewQuantity) {
                    bookedQuantity += (totalNewQuantity - totalOldQuantity)
                }
            } else if (variantFullfillNew.length > 0) {
                bookedQuantity -= totalNewQuantity
            }

            // REDUCE WAREHOUSE QUANTITY
            Object.keys(warehouseQuantity).forEach(wId => {
                const newWarehouseQty = variantFullfillNew.find(f => f.warehouseId === wId)
                if (variantFullfillOld.length > 0 && variantFullfillNew.length > 0) {
                    const oldWarehouseQty = variantFullfillOld.find(f => f.warehouseId === wId)
                    if (oldWarehouseQty && newWarehouseQty) {
                        if (oldWarehouseQty.quantity < newWarehouseQty.quantity) {
                            warehouseQuantity[wId] -= newWarehouseQty.quantity - oldWarehouseQty.quantity
                        } else if (oldWarehouseQty.quantity > newWarehouseQty.quantity) {
                            warehouseQuantity[wId] += oldWarehouseQty.quantity - newWarehouseQty.quantity
                        }
                    } else if (newWarehouseQty) {
                        warehouseQuantity[wId] -= newWarehouseQty.quantity
                    }
                } else if (variantFullfillNew.length > 0 && newWarehouseQty) {
                    warehouseQuantity[wId] -= newWarehouseQty.quantity
                }
            })

            variant.batchSet(batch, variantId, {
                ...variantData,
                bookedQuantity,
                warehouseQuantity
            })
            
        })

        orderStatus = getFullfillmentStatus(updatedFullfillment, variantQty)

        order.batchSet(batch, orderId, {
            ...orderData,
            fullfilled: updatedFullfillment,
            orderStatus
        })

        await batch.commit()
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function cancelFullfillment(req: Request, res: Response) {
    try {
        const { orderId } = req.params
        const { data } = req.body
        const { warehouseId }: { warehouseId: string } = data
        const orderData = await order.get(orderId)
        const batch = db.batch()
        const { fullfilled, variants: variantQty } = orderData
        let { orderStatus } = orderData
        const warehouseFiltered = fullfilled.filter(f => f.warehouseId === warehouseId)
        if (warehouseFiltered.length === 0) {
            return badRequest(res, 'No items found')
        }
        const variantIds = warehouseFiltered.map(w => w.variantId)
        const variantsData = await Promise.all(variantIds.map(async variantId => await variant.get(variantId)))
        const variantsToTrackInventory = variantsData.filter(v => v.trackInventory)

        // UPDATE QUANTITY
        variantsToTrackInventory.forEach(variantData => {
            const { warehouseQuantity, variantId } = variantData
            let { bookedQuantity } = variantData
            if (!warehouseQuantity) {
                throw new Error(`Warehouses not found for variant: ${variantId}`)
            }
            const orderedInWarehouse = warehouseFiltered.find(w => w.variantId === variantId)!
            bookedQuantity += orderedInWarehouse.quantity
            warehouseQuantity[warehouseId] += orderedInWarehouse.quantity
            variant.batchSet(batch, variantId, {
                ...variantData,
                bookedQuantity,
                warehouseQuantity
            })
        })

        const updatedFullfilled = fullfilled.filter(f => f.warehouseId !== warehouseId)
        orderStatus = getFullfillmentStatus(updatedFullfilled, variantQty)

        order.batchSet(batch, orderId, {
            ...orderData,
            fullfilled: updatedFullfilled,
            orderStatus
        })

        await batch.commit()
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function cancelOrder(req: Request, res: Response) {
    try {
        const { role }: Record<string, Role> = res.locals
        const { orderId } = req.params
        const batch = db.batch()
        const orderData = await order.get(orderId)
        const { variants, fullfilled } = orderData
        let { orderStatus } = orderData

        if (orderStatus === 'cancelled') {
            return badRequest(res, 'Order already cancelled')
        }
        if (orderStatus === 'draft') {
            return badRequest(res, 'Not a valid order')
        }

        const variantIds = variants.map(v => v.variantId)
        const variantsData = await Promise.all(variantIds.map(async variantId => await variant.get(variantId)))
        const variantsToTrackInventory = variantsData.filter(v => v.trackInventory)

        if (role && (orderStatus === 'fullfilled' || orderStatus === 'partiallyFullfilled')) {
            variantsToTrackInventory.forEach(variantData => {
                const { variantId, warehouseQuantity } = variantData
                if (!warehouseQuantity) {
                    return
                }
                const fullfilledVariant = fullfilled.filter(f => f.variantId === variantId)
                Object.keys(warehouseQuantity).forEach(wId => {
                    const warehouseData = fullfilledVariant.find(f => f.warehouseId === wId)
                    if (warehouseData) {
                        warehouseQuantity[wId] += warehouseData.quantity
                    }
                })
                variant.batchSet(batch, variantId, { ...variantData, warehouseQuantity })
            })
        }

        if (orderStatus === 'unfullfilled') {
            if (variantsToTrackInventory.length > 0) {
                variantsToTrackInventory.forEach(variantData => {
                    const { variantId } = variantData
                    let { bookedQuantity } = variantData
                    const orderedVariant = variants.filter(v => v.variantId === variantId)
                    const totalOrdered = orderedVariant.map(v => v.quantity).reduce((sum, curr) => sum + curr, 0)
                    bookedQuantity -= totalOrdered
                    variant.batchSet(batch, variantId, { ...variantData, bookedQuantity })
                })
            }
        }

        orderStatus = 'cancelled'
        order.batchSet(batch, orderId, { ...orderData, orderStatus})
        await batch.commit()

        return successUpdated(res)

    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}