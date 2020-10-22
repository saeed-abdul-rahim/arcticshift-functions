import { Request, Response } from 'express'
import * as user from '../../models/user'
import * as order from '../../models/order'
import { OrderStatus, OrderType } from '../../models/order/schema'
import { serverError } from '../../responseHandler/errorHandler'
import { successCreated } from '../../responseHandler/successHandler'

export async function create(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const orderStatus: OrderStatus = 'draft'
        const userData = await user.get(uid)
        const customerName = userData.name || userData.phone || userData.email || 'anonymous'
        const orderData: OrderType = {
            ...data,
            orderStatus,
            customerName
        }
        await order.add(orderData)
        return successCreated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
