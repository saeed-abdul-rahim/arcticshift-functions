import { OrderInterface, OrderStatus, OrderType, VariantQuantity } from "../../models/order/schema"
import { UserInterface } from "../../models/user/schema"
import * as shippingRate from "../../models/shippingRate"
import * as voucher from "../../models/voucher"
import * as order from "../../models/order"
import * as user from "../../models/user"
import * as tax from "../../models/tax"
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

export async function createDraft(userData: UserInterface, orderdata: OrderType) {
    try {
        const orderStatus: OrderStatus = 'draft'
        const customerName = userData.name || userData.phone || userData.email || 'anonymous'
        const orderData: OrderType = {
            ...orderdata,
            orderStatus,
            customerName
        }
        return await order.add(orderData)
    } catch (err) {
        throw err
    }
}

export function addVariantToOrder(orderData: OrderInterface, variants: VariantQuantity[]) {
    if (orderData.orderStatus === 'draft') {
        // Existing variants
        const newVariants = variants.map(variant => {
            const { variantId } = variant
            const varIdx = orderData.variants.findIndex(v => v.variantId === variantId)
            if (varIdx > -1) {
                orderData.variants[varIdx] = variant
                return undefined
            } else {
                return variant
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

export async function combineData(orderVariants: VariantQuantity[], allVariantData: VariantInterface[], allProductData: ProductInterface[], allProductTypeData: ProductTypeInterface[], saleDiscounts: SaleDiscountInterface[] | null): Promise<OrderData[]> {
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
            if (chargeTax) {
                taxData = await tax.get(taxId)
            }
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
        throw err
    }
}

export function calculateData(allData: OrderData[]): OrderDataCalc[] {
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
                onePerUser,
                oncePerOrder,
                totalUsage,
                minimumRequirement,
                productId,
                categoryId,
                collectionId,
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

                let isValidUse = true
                if (onePerUser || totalUsage > 0) {
                    const userData = await user.get(uid)
                    const { voucherUsed } = userData
                    if (voucherUsed && voucherUsed[voucherId] && voucherUsed[voucherId] > 0) {
                        if (onePerUser) {
                            isValidUse = false
                        } else if (totalUsage > 0 && voucherUsed[voucherId] > totalUsage) {
                            isValidUse = false
                        }
                    }
                }

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
                            const productData = allProductData.find(p => p.productId)!
                            const { categoryId: catId, collectionId: colId } = productData
                            const isValidProduct = productId.includes(pId)
                            const isValidCategory = categoryId.some(c => catId.includes(c))
                            const isValidCollection = collectionId.some(c => colId.includes(c))
                            if (isValidProduct || isValidCategory || isValidCollection) {
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
        throw err
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

type OrderData = VariantInterface & {
    orderQuantity: number
    baseProduct: ProductInterface
    baseProductType: ProductTypeInterface
    saleDiscount: SaleDiscountInterface | null
    taxData?: TaxInterface | null
}
type OrderDataCalc = AggregateType & {
    data: OrderData
}