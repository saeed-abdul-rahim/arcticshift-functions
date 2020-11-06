import { IRazorOrder } from 'razorpay-typescript/dist/resources/order'
import { razorpay } from '../../config'

export async function createCustomer(name: string, uid: string, email?: string, contact?: string) {
    try {
        return razorpay.customers.create({
            name,
            email,
            contact,
            notes: {
                uid
            }
        })
    } catch (err) {
        throw err
    }
}

export async function createOrder(amount: number, currency: string, orderId: string, notes?: string) {
    try {
        const options: IRazorOrder = {
            amount: amount * 100,
            currency,
            receipt: orderId,
            notes: {
                notes: notes || ''
            }
        }
        return await razorpay.orders.create(options)
    } catch (err) {
        throw err
    }
}
