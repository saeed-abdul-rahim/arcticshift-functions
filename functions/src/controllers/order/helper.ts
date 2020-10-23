import { OrderStatus, OrderType } from "../../models/order/schema"
import { UserInterface } from "../../models/user/schema"
import * as order from "../../models/order"

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
