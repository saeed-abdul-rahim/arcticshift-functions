import { OrderInterface, OrderStatus, OrderType, VariantQuantity } from "../../models/order/schema"
import { UserInterface } from "../../models/user/schema"
import * as order from "../../models/order"
import { isDefined } from "../../utils/isDefined"

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
