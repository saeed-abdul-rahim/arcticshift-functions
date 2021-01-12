import * as functions from 'firebase-functions'
import { Razorpay } from 'razorpay-typescript'

const { config } = functions

export const TITLE = 'PROLR'
export const URL = {
    base: 'https://articshift-7f9cd.web.app'
}
export const appId = config().app.id

// For OAuth2 -> nodemailer
export const gmail = config().gmail.email
export const clientId = config().gmail.id
export const clientSecret = config().gmail.secret
export const refreshToken = config().gmail.refresh
export const accessToken = config().gmail.access

export const razorpay: Razorpay = new Razorpay({
    authKey: {   
        key_id: config().razorpay.id,
        key_secret: config().razorpay.secret
    }
})
export const razorpayWebhookSecret = config().razorpay.webhook
