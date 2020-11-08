import { PaymentStatus } from "../../models/order/schema"
import * as orderModel from "../../models/order"

export async function orderPaid(payload: any) {
    try {
        const { payment, order } = payload
        let paymentStatus: PaymentStatus = 'notCharged'
        const orderAmount = order.entity.amount
        const paymentAmount = payment.entity.amount
        if (paymentAmount === orderAmount) {
            paymentStatus = 'fullyCharged'
        } else if (paymentAmount < orderAmount) {
            paymentStatus = 'partiallyCharged'
        }
        const orderData = await orderModel.getOneByCondition([{
            field: 'gatewayOrderId', type: '==', value: order.entity.id
        }])
        if (!orderData) {
            throw new Error('Order not found')
        }
        orderData.paymentStatus = paymentStatus
        orderData.orderStatus = 'unfulfilled'
        await orderModel.set(orderData.orderId, orderData)
    } catch (err) {
        throw err
    }
}
