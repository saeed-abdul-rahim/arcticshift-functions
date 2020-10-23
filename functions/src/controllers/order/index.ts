import { Request, Response } from 'express'
import * as user from '../../models/user'
import * as order from '../../models/order'
import { OrderType } from '../../models/order/schema'
import { badRequest, missingParam, serverError } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { isDefined } from '../../utils/isDefined'
import { createDraft } from './helper'

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
        const { orderId, variants } = data
        if (!variants || !Array.isArray(variants) || variants.length <= 0) {
            return missingParam(res, 'Variant')
        }
        if (orderId) {
            const orderData = await order.get(orderId)
            if (orderData.orderStatus === 'draft') {
                // Existing variants
                const newVariants = variants.map(variant => {
                    const { variantId } = variant
                    const varIdx = orderData.variants.findIndex(v => v.variantId === variantId)
                    if (varIdx > -1) {
                        orderData.variants[varIdx] = variant
                        return undefined
                    } else {
                        return variant
                    }
                }).filter(isDefined)
                // New variants
                if (newVariants.length > 0) {
                    orderData.variants.push(...newVariants)
                }
            } else {
                return badRequest(res, 'Not a valid draft')
            }
            await order.set(orderId, orderData)
            return successUpdated(res)
        } else {
            const userData = await user.get(uid)
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
        const { id } = req.params
        const { variantId }: { variantId: string[] } = req.body
        if (!variantId || !Array.isArray(variantId) || variantId.length <= 0) {
            return missingParam(res, 'Variant')
        }
        const orderData = await order.get(id)
        const { variants } = orderData
        orderData.variants = variants.filter(variant => !variantId.includes(variant.variantId))
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
