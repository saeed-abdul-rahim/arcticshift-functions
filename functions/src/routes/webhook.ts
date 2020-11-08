import { Application } from 'express'
import routes from '../config/routes'
import * as razorpay from '../webhooks/razorpay'
import * as stripe from '../webhooks/stripe'

export function webhookHandler(app: Application) {

    const { webhooks } = routes
    const razorpayRoute = webhooks.razorpay
    const stripeRoute = webhooks.stripe

    app.post(razorpayRoute, razorpay.handleEvent)
    app.post(stripeRoute, stripe.handleEvent)

}