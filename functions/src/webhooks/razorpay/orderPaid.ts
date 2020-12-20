import { PaymentStatus } from "../../models/order/schema"
import * as orderModel from "../../models/order"
import { placeOrder } from "../../controllers/order/helper"

export async function orderPaid(payload: any) {
    const methodName = 'orderPaid'
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

        const orderData = await orderModel.getOneByCondition('draft', [{
            field: 'gatewayOrderId', type: '==', value: order.entity.id
        }])
        if (!orderData) {
            throw new Error('Order not found')
        }

        orderData.paymentStatus = paymentStatus
        orderData.capturedAmount = paymentAmount / 100
        orderData.payment.push({
            id: payment.entity.id,
            type: 'charge',
            amount: paymentAmount / 100,
            gateway: 'razorpay'
        })
        await placeOrder(orderData)

    } catch (err) {
        console.error(methodName, err)
        throw err
    }
}
