import { PaymentStatus } from "../../models/order/schema"
import * as orderModel from "../../models/order"
import * as variant from "../../models/variant"

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
        orderData.capturedAmount = paymentAmount / 100
        await orderModel.set(orderData.orderId, orderData)

        const { variants } = orderData
        await Promise.all(variants.map(async v => {
            try {
                const { variantId, quantity } = v
                const variantData = await variant.get(variantId)
                const { trackInventory } = variantData
                if (trackInventory) {
                    variantData.bookedQuantity += quantity
                    await variant.set(variantId, variantData)
                }
            } catch (err) {
                console.log(err)
                return
            }
        }))
    } catch (err) {
        console.error(err)
        throw err
    }
}
