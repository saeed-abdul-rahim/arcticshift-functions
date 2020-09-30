import * as functions from 'firebase-functions'
import { Razorpay } from 'razorpay-typescript'

const { config } = functions

export const TITLE = 'PROLR'
export const URL = {
    base: 'https://articshift-7f9cd.web.app',
    support: '/support',
    home: '/',
    logo: '/assets/icons/icon-72x72.png'
}
export const appId = config().app.id
export const gmail = config().gmail.email
export const clientId = config().service.id
export const clientSecret = config().service.secret
export const refreshToken = config().service.refresh
export const accessToken = config().service.access

export const razorpay: Razorpay = new Razorpay({
    authKey: {   
        key_id: config().razorpay.id,
        key_secret: config().razorpay.secret
    }
})
