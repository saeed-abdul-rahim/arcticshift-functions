import * as functions from 'firebase-functions'
import Razorpay from 'razorpay'

export const TITLE = 'PROLR'
export const URL = {
    base: 'https://articshift-7f9cd.web.app',
    support: '/support',
    home: '/',
    logo: '/assets/icons/icon-72x72.png'
}
// export const gmail = functions.config().gmail.email
// export const clientId = functions.config().service.id
// export const clientSecret = functions.config().service.secret
// export const refreshToken = functions.config().service.refresh
// export const accessToken = functions.config().service.access

export const RAZORPAY = new Razorpay({
    key_id: functions.config().razorpay.id,
    key_secret: functions.config().razorpay.secret
})
