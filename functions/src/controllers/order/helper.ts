import { Fullfill, OrderInterface, OrderStatus, OrderType, ProductData, VariantQuantity } from "../../models/order/schema"
import { UserInterface } from "../../models/user/schema"
import * as shippingRate from "../../models/shippingRate"
import * as voucher from "../../models/voucher"
import * as order from "../../models/order"
import * as user from "../../models/user"
import * as tax from "../../models/tax"
import * as category from "../../models/category"
import * as collection from "../../models/collection"
import * as variant from "../../models/variant"
import * as settings from "../../models/settings"
import * as orderAnalytics from "../../models/analytics/order"
import { isDefined } from "../../utils/isDefined"
import { ValueType } from "../../models/common/schema"
import { getDiscountValue, getTax } from "../../utils/calculation"
import { VariantInterface } from "../../models/variant/schema"
import { ProductInterface } from "../../models/product/schema"
import { ProductTypeInterface } from "../../models/productType/schema"
import { SaleDiscountInterface } from "../../models/saleDiscount/schema"
import { mergeDuplicatesArrObj, uniqueArr } from "../../utils/arrayUtils"
import { VoucherInterface } from "../../models/voucher/schema"
import { ShippingRateInterface } from "../../models/shippingRate/schema"
import { TaxInterface } from "../../models/tax/schema"
import { CategoryInterface } from "../../models/category/schema"
import { CollectionInterface } from "../../models/collection/schema"
import { orderPlacedHTML } from "../../mail/templates/orderPlaced"
import { sendMail } from "../../mail"
import * as voucherHelper from "../voucher/helper"
import { orderShippedHTML } from "../../mail/templates/orderShipped"
import { db } from "../../config/db"
import { callerName } from "../../utils/functionUtils"
import { CONTROLLERS } from "../../config/constants"

const functionPath = `${CONTROLLERS}/order/helper`

export async function createDraft(userData: UserInterface, orderdata: OrderType) {
    try {
        const orderStatus: OrderStatus = 'draft'
        const customerName = userData.name || userData.phone || userData.email || 'anonymous'
        const orderData: OrderType = {
            ...orderdata,
            orderStatus,
            customerName,
            email: userData.email || userData.billingAddress?.email,
            phone: userData.phone || userData.billingAddress?.email,
            billingAddress: userData.billingAddress,
            shippingAddress: userData.shippingAddress,
        }
        return await order.add(orderData, 'draft')
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function addVariantToOrder(orderData: OrderInterface, variants: VariantQuantity[]) {
    if (orderData.orderStatus === 'draft') {
        // Existing variants
        const newVariants = variants.map(variantQty => {
            const { variantId } = variantQty
            const varIdx = orderData.variants.findIndex(v => v.variantId === variantId)
            if (varIdx > -1) {
                orderData.variants[varIdx] = variantQty
                return undefined
            } else {
                return variantQty
            }
        }).filter(isDefined)
        // New variants
        if (newVariants.length > 0) {
            orderData.variants.push(...newVariants)
        }
        return orderData
    } else {
        throw new Error('Not a draft')
    }
}

export function getFullfillmentStatus(fullfulled: Fullfill[], variantQty: VariantQuantity[]): OrderStatus {
    const totalFullfilled = fullfulled.map(f => f.quantity).reduce((sum, curr) => sum + curr, 0)
    const toFullfill = variantQty.map(v => v.quantity).reduce((sum, curr) => sum + curr, 0)
    if (totalFullfilled === 0) {
        return 'unfullfilled'
    } else if (totalFullfilled < toFullfill) {
        return 'partiallyFullfilled'
    } else {
        return 'fullfilled'
    }
}

export async function combineData(orderVariants: VariantQuantity[], allVariantData: VariantInterface[], allProductData: ProductInterface[], allProductTypeData: ProductTypeInterface[], saleDiscounts: SaleDiscountInterface[] | null): Promise<ProductData[]> {
    try {
        return await Promise.all(allVariantData.map(async variantData => {

            const { productId, variantId } = variantData
            const orderQuantity = orderVariants.find(v => v.variantId === variantId)!.quantity
            const baseProduct = allProductData.find(p => p.productId === productId)!
            const { productTypeId, chargeTax, categoryId, allCategoryId, collectionId } = baseProduct
            const baseProductType = allProductTypeData.find(p => p.productTypeId === productTypeId)!
            const { taxId } = baseProductType
            let taxData: TaxInterface | null = null

            allCategoryId.push(categoryId)
            const cids = uniqueArr(allCategoryId)
            const productDiscount = saleDiscounts?.find(sd => sd.productId.includes(productId))
            const categoryDiscount = saleDiscounts?.find(sd => sd.categoryId.some(cid => cids.includes(cid)))
            const collectionDiscount = saleDiscounts?.find(sd => sd.collectionId.some(cid => collectionId.includes(cid)))
            if (chargeTax && taxId) {
                taxData = await tax.get(taxId)
            }

            // REMOVE IMAGES FOR ORDER DOCUMENT DATA
            variantData.images = []
            baseProduct.images = []

            const data = {
                ...variantData,
                taxData,
                orderQuantity,
                baseProduct,
                baseProductType
            }
            if (productDiscount) {
                return { ...data, saleDiscount: productDiscount }
            } else if (categoryDiscount) {
                return { ...data, saleDiscount: categoryDiscount }
            } else if (collectionDiscount) {
                return { ...data, saleDiscount: collectionDiscount }
            } else {
                return { ...data, saleDiscount: null }
            }
        })).then(data => data.filter(isDefined))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function calculateData(allData: ProductData[]): OrderDataCalc[] {
    try {
        return allData.map(data => {
            const { price, orderQuantity, saleDiscount, baseProductType, taxData } = data
            const { weight } = baseProductType
            const subTotal = price * orderQuantity
            let total = subTotal
            let taxes = 0
            let totalWeight = 0
            let discountValue = 0
            if (saleDiscount) {
                const { value, valueType } = saleDiscount
                discountValue = getDiscount(price, value, valueType) * orderQuantity
                total -= discountValue
            }
            if (taxData) {
                const { value, valueType } = taxData
                if (valueType === 'fixed') {
                    taxes += value
                } else {
                    taxes = getTax(subTotal, value)
                }
                taxes = taxes * orderQuantity
                total += taxes
            }
            if (weight && weight > 0) {
                totalWeight = weight * orderQuantity
            }
            return {
                data,
                subTotal,
                total,
                taxes,
                totalWeight,
                quantity: orderQuantity,
                saleDiscount: discountValue
            }
        })
    } catch (err) {
        throw err
    }
}

export function aggregateData(allDataCalculated: OrderDataCalc[]): AggregateType {
    try {
        const allDataTotals = allDataCalculated.map(dt => {
            const { subTotal, total, taxes, totalWeight, quantity, saleDiscount } = dt
            return { subTotal, total, taxes, totalWeight, quantity, saleDiscount }
        })
        return mergeDuplicatesArrObj(allDataTotals)
    } catch (err) {
        throw err
    }
}

export async function calculateShipping(shippingRateId: string, aggregate: AggregateType) {
    try {
        let shippingCharge = 0
        let shippingRateData: ShippingRateInterface | null = null
        if (shippingRateId) {
            shippingRateData = await shippingRate.get(shippingRateId)
            const { type, noValueLimit, freeShippingRate, minValue, maxValue, price } = shippingRateData
            const { total, totalWeight } = aggregate
            if (!freeShippingRate) {
                shippingCharge = price > 0 ? price : 0
                if (!noValueLimit && (total > minValue || totalWeight > minValue)) {
                    if (maxValue > minValue) {
                        if (type === 'weight' && totalWeight > maxValue) {
                            shippingCharge = 0
                        } else if (type === 'price' && total > maxValue) {
                            shippingCharge = 0
                        }
                    }
                }
            }
        }
        return { shippingCharge, shippingRateData }
    } catch (err) {
        throw err
    }
}

export async function calculateVoucherDiscount(uid: string, voucherId: string, allProductData: ProductInterface[], allDataCalculated: OrderDataCalc[], allDataAggregated: AggregateType, shipping: number) {
    try {
        let shippingCharge = shipping
        const now = Date.now()
        let voucherDiscount = 0
        let voucherData: VoucherInterface | null = null
        if (voucherId) {
            voucherData = await voucher.get(voucherId)

            const {
                status,
                startDate,
                endDate,
                oncePerOrder,
                minimumRequirement,
                orderType,
                valueType,
                value
            } = voucherData

            if (now >= startDate && (now <= endDate || endDate <= 0) && status === 'active') {

                let isValidMinimum = true
                if (minimumRequirement && minimumRequirement.type && minimumRequirement.value) {
                    const minType = minimumRequirement.type
                    const minValue = minimumRequirement.value
                    if (minType === 'quantity') {
                        if (allDataAggregated.quantity < minValue) {
                            isValidMinimum = false
                        }
                    } else if (minType === 'orderValue') {
                        if (allDataAggregated.total + shippingCharge < minValue) {
                            isValidMinimum = false
                        }
                    }
                }

                const isValidUse = await voucherHelper.isValidUse(voucherData, uid)

                if (!isValidMinimum || !isValidUse) {
                    return {
                        voucherDiscount: 0,
                        shippingCharge
                    }
                }

                if (valueType === 'shipping') {
                    shippingCharge = 0
                } else {
                    if (orderType === 'entireOrder') {
                        if (!oncePerOrder) {
                            voucherDiscount = getDiscount(allDataAggregated.total, value, valueType)
                        } else {
                            voucherDiscount = allDataCalculated.map(variantData => {
                                const { total } = variantData
                                return getDiscount(total, value, valueType)
                            }).reduce((sum, data) => sum + data, 0)
                        }
                    } else if (orderType === 'specificProducts') {
                        const eligibleProducts = allDataCalculated.map(dc => {
                            const { data } = dc
                            const { productId: pId } = data
                            const productData = allProductData.find(p => p.productId === pId)!
                            if (voucherHelper.isProductEligible(voucherData!, productData)) {
                                return dc
                            } else {
                                return
                            }
                        }).filter(isDefined)
                        if (eligibleProducts.length > 0) {
                            if (!oncePerOrder) {
                                voucherDiscount = eligibleProducts.map(eligibleProduct => {
                                    return getDiscount(eligibleProduct.total, value, valueType)
                                }).reduce((sum, data) => sum + data, 0)
                            } else {
                                const eliglibleProductValue = eligibleProducts
                                    .map(eligibleProduct => eligibleProduct.total)
                                    .reduce((sum, data) => sum + data, 0)
                                voucherDiscount = getDiscount(eliglibleProductValue, value, valueType)
                            }
                        }
                    }
                }
            }
        }
        return {
            voucherDiscount, shippingCharge, voucherData
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function placeOrder(orderData: OrderInterface) {
    try {
        const { variants, userId, orderId, voucherId } = orderData
        const variantIds = variants.map(v => v.variantId)
        orderData.orderStatus = 'unfullfilled'

        delete orderData.createdAt
        delete orderData.updatedAt

        const newOrderId = await order.add(orderData, 'order')
        await order.remove(orderId, 'draft')

        await Promise.all(variants.map(async v => {
            try {
                const { variantId, quantity } = v
                await db.runTransaction(async transaction => {
                    const variantData = await variant.get(variantId, transaction)
                    const { trackInventory } = variantData
                    if (trackInventory) {
                        variantData.bookedQuantity += quantity
                        variant.transactionSet(transaction, variantId, variantData)
                    }
                })
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
                return
            }
        }))

        try {
            const userData = await user.get(userId)
            userData.totalOrders += 1
            if (voucherId && userData.voucherUsed && userData.voucherUsed[voucherId]) {
                userData.voucherUsed[voucherId] += 1
            } else if (voucherId && userData.voucherUsed) {
                userData.voucherUsed[voucherId] = 1
            } else if (voucherId) {
                userData.voucherUsed = { [voucherId]: 1 }
            }
            await user.set(userId, userData)
        } catch (err) {
            console.error(`${functionPath}/${callerName()}`, err)
        }

        try {
            const startDate = new Date();
            startDate.setUTCHours(0, 0, 0, 0);
            const analyticsId = startDate.getTime().toString()
            await db.runTransaction(async transaction => {
                try {
                    orderAnalytics.transactionSet(transaction, analyticsId, {
                        variantId: variantIds,
                        sale: orderData.capturedAmount,
                        orderId: newOrderId
                    })
                } catch (err) { 
                    console.error(`${functionPath}/${callerName()}`, err)
                }
            })
        } catch (err) {
            console.error(`${functionPath}/${callerName()}`, err)
        }

        return await sendOrderMail(orderData, 'order')

    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function sendOrderMail(orderData: OrderInterface, type: 'order' | 'dispatched', partial = false) {
    const { email } = orderData
    let categoriesData: CategoryInterface[] | null = null
    let collectionData: CollectionInterface | null = null

    try {
        categoriesData = await category.getByCondition([], {
            field: 'updatedAt', direction: 'desc'
        }, 6)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }

    try {
        collectionData = await collection.getOneByCondition([], {
            field: 'updatedAt', direction: 'desc'
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }

    try {
        let orderMail = ''
        const settingsData = await settings.getGeneralSettings()
        if (type === 'order') {
            orderMail = orderPlacedHTML(settingsData, orderData, collectionData || undefined, categoriesData || undefined)
        } else if (type === 'dispatched') {
            orderMail = orderShippedHTML(settingsData, orderData, collectionData || undefined, categoriesData || undefined, partial)
        }
        if (orderMail) {
            return await sendMail({
                to: email,
                subject: 'Order ' + type === 'order' ? 'Placed!' : 'Dispatched!',
                html: orderMail
            })
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }
}

export function isDraft(orderData: OrderInterface) {
    const { orderStatus } = orderData
    if (orderStatus === 'draft') {
        return true
    }
    return false
}

function getDiscount(price: number, discount: number, type: ValueType) {
    try {
        if (type === 'fixed') {
            return discount
        } else {
            return getDiscountValue(price, discount)
        }
    } catch (err) {
        throw err
    }
}

type AggregateType = {
    subTotal: number
    total: number
    taxes: number
    totalWeight: number
    quantity: number
    saleDiscount: number
}

type OrderDataCalc = AggregateType & {
    data: ProductData
}