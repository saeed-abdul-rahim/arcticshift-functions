import { IRazorOrder } from 'razorpay-typescript/dist/resources/order'
import { razorpay, razorpayWebhookSecret } from '../../config'
import * as crypto from "crypto";

export async function createCustomer(uid: string, name = '', email?: string, contact?: string) {
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
            amount: Math.round(amount * 100),
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

export async function createRefund(paymentId: string, amount: number) {
    try {
        return await razorpay.payments.payment(paymentId).refund({
            amount: Math.round(amount * 100)
        })
    } catch (err) {
        throw err
    }
}

export function validateWebhook(body: any, signature: any) {
    try {
        return getSHA256(body, razorpayWebhookSecret) === signature
    } catch (err) {
        throw err
    }
}

function getSHA256(body: any, secret: string) {
    return crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
  }
