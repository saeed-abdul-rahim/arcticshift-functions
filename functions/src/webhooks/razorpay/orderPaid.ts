import { PaymentStatus } from "../../models/order/schema"
import * as orderModel from "../../models/order"
import * as userModel from "../../models/user"
import * as variant from "../../models/variant"
import { incrementOrder } from "../../models/analytics/order"

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
        orderData.orderStatus = 'unfullfilled'
        orderData.capturedAmount = paymentAmount / 100
        orderData.payment.push({
            id: payment.entity.id,
            type: 'charge',
            amount: paymentAmount / 100,
            gateway: 'razorpay'
        })
        await orderModel.set(orderData.orderId, orderData)
        await incrementOrder()

        const { variants, userId } = orderData
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
        
        try {
            const userData = await userModel.get(userId)
            userData.totalOrders += 1
            await userModel.set(userId, userData)
        } catch (err) {
            console.log(err)
        }

    } catch (err) {
        console.error(err)
        throw err
    }
}
