import { Request, Response } from 'express'
import { validateWebhook } from '../../payments/razorpay'
import { forbidden, serverError } from '../../responseHandler/errorHandler'
import { successUpdated } from '../../responseHandler/successHandler'
import { orderPaid } from './orderPaid'

export async function handleEvent(req: Request, res: Response) {
    try {
        const { headers, body } = req
        const signature = headers['x-razorpay-signature']
        if (!validateWebhook(body, signature)) {
            return forbidden(res)
        }
        const { event, payload } = body
        switch (event) {
            case 'order.paid':
                await orderPaid(payload)
                break
            default:
                return forbidden(res)
        }
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
