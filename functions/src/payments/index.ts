import { PaymentGateway } from "../models/common/schema";
import * as razorpay from "./razorpay"

export async function createOrder(gateway: PaymentGateway, amount: number, currency: string, orderId: string, notes?: string) {
    try {
        switch (gateway) {
            case 'razorpay':
                return await razorpay.createOrder(amount, currency, orderId, notes)
            default:
                throw new Error('Unable to create order')
        }
    } catch (err) {
        throw err
    }
}

export async function refund(gateway: PaymentGateway, paymentId: string, amount: number) {
    try {
        switch (gateway) {
            case 'razorpay':
                return await razorpay.createRefund(paymentId, amount)
            default:
                throw new Error('Unable to refund')
        }
    } catch (err) {
        throw err
    }
}