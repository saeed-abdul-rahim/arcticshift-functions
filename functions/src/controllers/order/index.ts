import { NextFunction, Request, Response } from 'express'
import * as payments from '../../payments'
import * as settings from '../../models/settings'
import * as user from '../../models/user'
import * as voucher from '../../models/voucher'
import * as saleDiscount from '../../models/saleDiscount'
import * as productType from '../../models/productType'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as order from '../../models/order'
import * as shipping from '../../models/shipping'
import * as shippingRate from '../../models/shippingRate'
import { Fullfill, Fullfillment, OrderType } from '../../models/order/schema'
import { badRequest, missingParam, serverError } from '../../responseHandler/errorHandler'
import { successCreated, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { addVariantToOrder, aggregateData, calculateData, calculateShipping, calculateVoucherDiscount, combineData, createDraft, getFullfillmentStatus, placeOrder, sendOrderMail } from './helper'
import { uniqueArr } from '../../utils/arrayUtils'
import { isValidAddress } from '../../models/common'
import { setUserBillingAddress, setUserShippingAddress } from '../user/helper'
import { db } from '../../config/db'
import { Role } from '../../models/common/schema'
import * as voucherHelper from "../voucher/helper"
import { isDefined } from '../../utils/isDefined'
import { CONTROLLERS } from '../../config/constants'
import { callerName } from '../../utils/functionUtils'

const functionPath = `${CONTROLLERS}/order/index`

export async function create(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const userData = await user.get(uid)
        const id = await createDraft(userData, data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function calculateDraft(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const now = Date.now()
        const orderData = await order.getOneByCondition('draft', [
            { field: 'userId', type: '==', value: uid }
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
        order.batchSet(batch, orderData.orderId, updatedOrderData, 'draft')
        await batch.commit()
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function addVoucher(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: draftId } = req.params
        const { data }: { data: { code: string } } = req.body
        const { code } = data
        if (!code) {
            return missingParam(res, 'Voucher')
        }
        const orderData = await order.get(draftId, 'draft')
        const voucherData = await voucher.getOneByCondition([{
            field: 'code', type: '==', value: code
        }])
        if (!voucherData) {
            return badRequest(res, 'Invalid code')
        }
        const { data: orderCalcData, userId } = orderData
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
        if (orderData.voucherId === voucherId) {
            return badRequest(res, 'Voucher already applied')
        }
        if (orderCalcData) {
            const { productsData } = orderCalcData
            const areProductsEligible = productsData.map(p => {
                return voucherHelper.isProductEligible(voucherData, p.baseProduct)
            }).some(p => p)
            if (!areProductsEligible) {
                return badRequest(res, 'Products not eligible')
            }
        }
        if (!await voucherHelper.isValidUse(voucherData, userId)) {
            return badRequest(res, 'Voucher Expired')
        }
        orderData.voucherId = voucherId
        await order.set(draftId, orderData, 'draft')
        next()
        return
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        let orderData = await order.getOneByCondition('draft', [
            { field: 'userId', type: '==', value: userId || uid }
        ]);
        if (orderData) {
            const { orderId } = orderData
            orderData = addVariantToOrder(orderData, variants)
            await order.set(orderId, orderData, 'draft')
            return successUpdated(res)
        } else {
            const userData = await user.get(userId || uid)
            const id = await createDraft(userData, data)
            return successResponse(res, { id })
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function updateShipping(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: OrderType } = req.body
        const { shippingId, shippingRateId, shippingAddress, billingAddress } = data
        const orderData = await order.get(orderId, 'draft')
        if (shippingId) {
            await shipping.get(shippingId)
            orderData.shippingId = shippingId
        } else {
            orderData.shippingId = ''
        }
        if (shippingRateId) {
            await shippingRate.get(shippingRateId)
            orderData.shippingRateId = shippingRateId
        } else {
            orderData.shippingRateId = ''
        }
        if (billingAddress && !isValidAddress(billingAddress)) {
            return badRequest(res, 'Invalid Billing Address')
        } else if (billingAddress) {
            orderData.billingAddress = billingAddress
        }
        if (billingAddress && !shippingAddress && isValidAddress(billingAddress)) {
            orderData.shippingAddress = billingAddress
        } else if (shippingAddress && !isValidAddress(shippingAddress)) {
            return badRequest(res, 'Invalid Shipping Address')
        } else if (shippingAddress) {
            orderData.shippingAddress = shippingAddress
        }
        await order.set(orderId, orderData, 'draft')
        next()
        return
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function removeVariant(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: { variantId: string } } = req.body
        const { variantId } = data
        if (!variantId) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(orderId, 'draft')
        const { variants } = orderData
        orderData.variants = variants.filter(v => v.variantId !== variantId)
        if (orderData.variants.length === 0) {
            orderData.voucherId = ''
            orderData.giftCardId = ''
        }
        await order.set(orderId, orderData, 'draft')
        next()
        return
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function updateVariants(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: OrderType } = req.body
        const { variants } = data
        if (!variants) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(orderId, 'draft')
        orderData.variants = variants
        await order.set(orderId, orderData, 'draft')
        next()
        return
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function finalize(req: Request, res: Response) {
    try {
        const batch = db.batch()
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const { orderId, email, phone, notes, shippingAddress, billingAddress, cod } = data
        if (!orderId) {
            return missingParam(res, 'Order ID')
        }

        const orderData = await order.get(orderId, 'draft')
        const { orderStatus, shippingId } = orderData
        
        if (orderStatus !== 'draft') {
            return badRequest(res, 'Not a draft')
        }
        if (!shippingId) {
            return badRequest(res, 'Shipping Details required')
        }

        let userData = await user.get(uid)
        if (billingAddress && isValidAddress(billingAddress)) {
            billingAddress.email = email || ''
            billingAddress.phone = phone || ''
            orderData.billingAddress = billingAddress
            userData = setUserBillingAddress(userData, billingAddress)
        } else {
            return badRequest(res, 'Invalid Billing Address')
        }
        if (billingAddress && !shippingAddress && isValidAddress(billingAddress)) {
            orderData.shippingAddress = billingAddress
            userData = setUserShippingAddress(userData, billingAddress)
        } else if (shippingAddress && isValidAddress(shippingAddress)) {
            shippingAddress.email = email || ''
            shippingAddress.phone = phone || ''
            orderData.shippingAddress = shippingAddress
            userData = setUserShippingAddress(userData, billingAddress)
        } else {
            return badRequest(res, 'Invalid Shipping Address')
        }
        user.batchSet(batch, uid, userData)

        const shippingData = await shipping.get(shippingId)
        const { zipCode, warehouseId } = shippingData
        const { zip } = orderData.shippingAddress
        if (zipCode.length > 0 && zip && !zipCode.includes(zip)) {
            return badRequest(res, 'Not deliverable to this address')
        }
        if (!orderData.shippingRateId) {
            if (shippingData && shippingData.rates.length > 0) {
                return badRequest(res, 'Select shipping rate')
            }
        }

        const settingsData = await settings.getGeneralSettings()
        const { currency, paymentGateway } = settingsData
        if (!currency) {
            return badRequest(res, 'Currency required')
        }

        const { total, variants } = orderData

        orderData.firstName = orderData.shippingAddress.firstName || ''
        orderData.lastName = orderData.shippingAddress.lastName || ''
        orderData.customerName = orderData.shippingAddress.name || ''

        // Check Stock
        const variantIds = variants.map(v => v.variantId)
        const variantsData = await Promise.all(variantIds.map(async variantId => await variant.get(variantId)))
        variants.forEach(v => {
            const { variantId, quantity } = v
            const variantData = variantsData.find(vd => vd.variantId === variantId)!
            const { trackInventory, bookedQuantity, warehouseQuantity, name } = variantData
            if (trackInventory && warehouseQuantity) {
                const productWarehouses = Object.keys(warehouseQuantity)
                const totalQty = Object.values(warehouseQuantity).reduce((sum, qty) => sum + qty, 0)
                if (quantity > totalQty - bookedQuantity) {
                    throw new Error(`${name} out of stock!`)
                }
                // IS Deliverable ?
                if (warehouseId.length > 0) {
                    if (warehouseId.some(id => !productWarehouses.includes(id))) {
                        throw new Error(`${name} not deliverable to your location`)
                    }
                }
            }
        })

        const setData = {
            ...orderData,
            notes
        }
        setData.email = email ? email : orderData.email
        setData.phone = phone ? phone : orderData.phone

        if (cod) {
            order.batchSet(batch, orderId, {
                ...setData,
                cod
            }, 'draft')
            await batch.commit()
            await placeOrder(orderData)
            return successCreated(res)
        } else {
            const gatewayOrderId = await payments.createOrder(paymentGateway, total, currency, orderId, notes)
            order.batchSet(batch, orderId, {
                ...setData,
                gatewayOrderId: gatewayOrderId.id
            }, 'draft')
            await batch.commit()
            return successResponse(res, gatewayOrderId)
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function orderCOD(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const orderData = await order.get(orderId, 'draft')
        orderData.paymentStatus = 'notCharged'
        await placeOrder(orderData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function capturePayment(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: OrderType } = req.body
        const { capturedAmount } = data
        if (!capturedAmount && capturedAmount !== 0) {
            return missingParam(res, 'Amount Required')
        }
        if (capturedAmount < 0) {
            return badRequest(res, "Amount can't be negative")
        }
        const orderData = await order.get(orderId, 'order')
        orderData.capturedAmount = Number(capturedAmount.toFixed(2))
        if (orderData.capturedAmount > orderData.total) {
            return badRequest(res, "Captured Amount can't be greater than total")
        }
        if (orderData.capturedAmount === 0) {
            orderData.paymentStatus = 'notCharged'
        } else if (orderData.capturedAmount < orderData.total) {
            orderData.paymentStatus = 'partiallyCharged'
        } else {
            orderData.paymentStatus = 'fullyCharged'
        }
        await order.set(orderId, orderData, 'order')
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function addTrackingCode(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: { warehouseId?: string, trackingCode?: string } } = req.body
        const { warehouseId, trackingCode } = data
        if (!warehouseId) {
            return missingParam(res, 'Warehouse ID')
        }
        if (!trackingCode) {
            return missingParam(res, 'Tracking Code')
        }
        const orderData = await order.get(orderId, 'order')
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
        }, 'order')
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function fullfill(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const { data, sendEmail }: { data: OrderType, sendEmail: boolean } = req.body
        const { fullfilled } = data

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
        const orderData = await order.get(orderId, 'order')
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

        // Get old fullfilled values and add up quantity
        let fullfillUpdate = fullfilled.concat(orderFullfilled)
        fullfillUpdate = fullfillUpdate.map(f => new Fullfillment(f).get())
        fullfillUpdate = Object.values(fullfillUpdate.reduce((acc: any, {quantity, ...rest}) => {
            const key = Object.values(rest).join('|');
            acc[key] = acc[key] || {...rest, quantity:0};
            acc[key].quantity +=+ quantity;
            return acc;
          }, {}));

        fullfillUpdate.forEach(f => {
            const { variantId, quantity } = f
            const varQty = variantQty.find(v => v.variantId === variantId)
            if (varQty && quantity > varQty.quantity) {
                throw new Error('Quantity Exceeded')
            } else {
                return
            }
        })

        await db.runTransaction(async transaction => {
            const variantsData = await variant.transactionGetAll(transaction, variantIds)
            const variantsToTrackInventory = variantsData.filter(v => v.trackInventory)
    
            // UPDATE INVENTORY
            variantsToTrackInventory.forEach(variantData => {
                const { warehouseQuantity, variantId } = variantData
                let { bookedQuantity } = variantData
                if (!warehouseQuantity) {
                    throw new Error(`Warehouses not found for variant: ${variantId}`)
                }
    
                const variantFullfillNew = fullfilled.filter(f => f.variantId === variantId)
                const totalNewQuantity = variantFullfillNew.map(o => o.quantity).reduce((sum, curr) => sum + curr, 0)
    
                // REDUCE BOOKED QUANTITY
                if (variantFullfillNew.length > 0) {
                    bookedQuantity -= totalNewQuantity
                }
    
                // REDUCE WAREHOUSE QUANTITY
                Object.keys(warehouseQuantity).forEach(wId => {
                    const newWarehouseQty = variantFullfillNew.find(f => f.warehouseId === wId)
                    if (variantFullfillNew.length > 0 && newWarehouseQty) {
                        warehouseQuantity[wId] -= newWarehouseQty.quantity
                    }
                })
    
                variant.transactionSet(transaction, variantId, {
                    ...variantData,
                    bookedQuantity,
                    warehouseQuantity
                })
                
            })
    
            orderStatus = getFullfillmentStatus(fullfillUpdate, variantQty)
    
            order.transactionSet(transaction, orderId, {
                ...orderData,
                fullfilled: fullfillUpdate,
                orderStatus
            }, 'order')
        })

        if (sendEmail) {
            let partialFullfillment = false
            const fullfilledVariants = variantQty.map(vq => {
                const fullfilledVariant = fullfilled.filter(f => f.variantId === vq.variantId)
                if (!fullfilledVariant || fullfilledVariant.length === 0) {
                    partialFullfillment = true
                    return
                }
                // Add up values in fullfillment for editing orderQuantity below
                const qty = fullfilledVariant.map(f => f.quantity).reduce((sum, curr) => sum + curr, 0)
                const newFullFillData: Fullfill = {
                    variantId: vq.variantId,
                    quantity: qty,
                    warehouseId: ''
                }
                if (qty < vq.quantity) {
                    partialFullfillment = true
                    return newFullFillData
                }
                return newFullFillData
            }).filter(isDefined)
            if (!partialFullfillment) {
                await sendOrderMail(orderData, 'dispatched')
            }
            if (partialFullfillment) {
                // Modify order.data.productData to suit Email view
                // Delete products that are not dispatched
                const fullfilledVariantIds = fullfilledVariants.map(v => v.variantId)
                const filteredProductsData = orderData.data?.productsData.filter(p => fullfilledVariantIds.includes(p.variantId))
                if (filteredProductsData && filteredProductsData.length > 0) {
                    const newProductsData = filteredProductsData.map(productData => {
                        const fullfilledVariant = fullfilled.find(f => f.variantId === productData.variantId)
                        if (fullfilledVariant) {
                            productData.orderQuantity = fullfilledVariant.quantity
                            return productData
                        }
                        return
                    }).filter(isDefined)
                    orderData.data!.productsData = newProductsData
                    await sendOrderMail(orderData, 'dispatched')
                }
            }
        }

        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function cancelFullfillment(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const { data } = req.body
        const { warehouseId }: { warehouseId: string } = data
        const orderData = await order.get(orderId, 'order')
        const { fullfilled, variants: variantQty } = orderData
        let { orderStatus } = orderData
        const warehouseFiltered = fullfilled.filter(f => f.warehouseId === warehouseId)
        if (warehouseFiltered.length === 0) {
            return badRequest(res, 'No items found')
        }
        const variantIds = warehouseFiltered.map(w => w.variantId)
        await db.runTransaction(async transaction => {
            const variantsData = await variant.transactionGetAll(transaction, variantIds)
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
                variant.transactionSet(transaction, variantId, {
                    ...variantData,
                    bookedQuantity,
                    warehouseQuantity
                })
            })
    
            const updatedFullfilled = fullfilled.filter(f => f.warehouseId !== warehouseId)
            orderStatus = getFullfillmentStatus(updatedFullfilled, variantQty)
    
            order.transactionSet(transaction, orderId, {
                ...orderData,
                fullfilled: updatedFullfilled,
                orderStatus
            }, 'order')
        })

        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function cancelOrder(req: Request, res: Response) {
    try {
        const { role }: Record<string, Role> = res.locals
        const { orderId } = req.params
        const orderData = await order.get(orderId, 'order')
        const { variants, fullfilled } = orderData
        let { orderStatus } = orderData

        if (orderStatus === 'cancelled') {
            return badRequest(res, 'Order already cancelled')
        }
        if (orderStatus === 'draft') {
            return badRequest(res, 'Not a valid order')
        }

        const variantIds = variants.map(v => v.variantId)
        await db.runTransaction(async transaction => {
            const variantsData = await variant.transactionGetAll(transaction, variantIds)
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
                    variant.transactionSet(transaction, variantId, { ...variantData, warehouseQuantity })
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
                        variant.transactionSet(transaction, variantId, { ...variantData, bookedQuantity })
                    })
                }
            }

            orderStatus = 'cancelled'
            order.transactionSet(transaction, orderId, { ...orderData, orderStatus}, 'order')
        })

        return successUpdated(res)

    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function refund(req: Request, res: Response) {
    try {
        const { id: orderId } = req.params
        const { data }: { data: { amount: number }} = req.body
        let { amount } = data
        if (amount <= 0) {
            return badRequest(res, "Amount should be a positive value'")
        }
        amount = Number(amount.toFixed(2))
        const orderData = await order.get(orderId, 'order')
        const { payment, capturedAmount } = orderData
        if (amount > capturedAmount) {
            return badRequest(res, 'Amount is larger than captured')
        }
        const refunds = payment.filter(p => p.type === 'refund')
        if (refunds.length > 0) {
            const totalRefund = refunds.map(r => r.amount).reduce((a, b) => a + b, 0)
            if (totalRefund + amount > capturedAmount) {
                return badRequest(res, 'Amount is larger than captured')
            }
        }
        const charged = payment.find(p => p.type === 'charge')
        if (!charged) {
            return badRequest(res, 'No Payment found')
        }
        const { gateway, id: paymentId } = charged
        const refundId = await payments.refund(gateway, paymentId, amount)
        payment.push({
            type: 'refund',
            id: refundId.id,
            amount,
            gateway
        })
        await order.set(orderId, {
            ...orderData,
            payment
        }, 'order')
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}