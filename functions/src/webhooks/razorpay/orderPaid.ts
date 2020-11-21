import { PaymentStatus } from "../../models/order/schema"
import * as settings from "../../models/settings"
import * as orderModel from "../../models/order"
import * as userModel from "../../models/user"
import * as variant from "../../models/variant"
import * as category from "../../models/category"
import * as collection from "../../models/collection"
import { CategoryInterface } from "../../models/category/schema"
import { CollectionInterface } from "../../models/collection/schema"
import { orderPlacedHTML } from "../../mail/templates/orderPlacedHTML"
import { sendMail } from "../../mail"

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
        const orderData = await orderModel.getOneByCondition('draft', [{
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
        const { variants, userId, orderId, email } = orderData

        await orderModel.add(orderData, 'order')
        await orderModel.remove(orderId, 'draft')

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

        let categoriesData: CategoryInterface[] | null = null
        let collectionData: CollectionInterface | null = null

        try {
            categoriesData = await category.getByCondition([], {
                field: 'createdAt', direction: 'desc'
            }, 6)
        } catch (err) {
            console.error(err)
        }

        try {
            collectionData = await collection.getOneByCondition([], {
                field: 'createdAt', direction: 'desc'
            })
        } catch (err) {
            console.error(err)
        }

        try {
            const settingsData = await settings.getGeneralSettings()
            const orderPaidMail = orderPlacedHTML(settingsData, orderData, collectionData || undefined, categoriesData || undefined)
            await sendMail({
                to: email,
                subject: 'Order Placed!',
                html: orderPaidMail
            })
        } catch (err) {
            console.error(err)
        }

    } catch (err) {
        console.error(err)
        throw err
    }
}
