import { Request, Response } from 'express'
import * as user from '../../models/user'
import * as order from '../../models/order'
import { OrderType } from '../../models/order/schema'
import { missingParam, serverError } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { addVariantToOrder, createDraft } from './helper'

export async function create(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const userData = await user.get(uid)
        const id = await createDraft(userData, data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addVariant(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data }: { data: OrderType } = req.body
        const { variants, userId } = data
        if (!variants || !Array.isArray(variants) || variants.length <= 0) {
            return missingParam(res, 'Variant')
        }
        let orderData = await order.getOneByCondition([{
            field: 'userId',
            type: '==',
            value: userId || uid
        }]);
        if (orderData) {
            const { orderId } = orderData
            orderData = addVariantToOrder(orderData, variants)
            await order.set(orderId, orderData)
            return successUpdated(res)
        } else {
            const userData = await user.get(userId || uid)
            const id = await createDraft(userData, data)
            return successResponse(res, { id })
        }
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeVariant(req: Request, res: Response) {
    try {
        const { orderId } = req.params
        const { variantIds }: { variantIds: string[] } = req.body
        if (!variantIds || !Array.isArray(variantIds) || variantIds.length <= 0) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(orderId)
        const { variants } = orderData
        orderData.variants = variants.filter(variant => !variantIds.includes(variant.variantId))
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
