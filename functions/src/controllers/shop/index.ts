import { Request, Response } from 'express'
import * as shop from '../../models/shop'
import { ShopType } from '../../models/shop/schema'
import { badRequest, serverError, missingParam } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated } from '../../responseHandler/successHandler'

export async function create(req: Request, res: Response) {
    try {
        const { data }: { data: ShopType } = req.body
        const { shopId, name } = data
        if (!shopId) {
            return missingParam(res, 'ID')
        }
        if (!name) {
            return missingParam(res, 'Name')
        }
        try {
            await shop.get(shopId)
            return badRequest(res, 'Shop ID Exists')
        } catch (_) {}
        await shop.set(shopId, data)
        return successCreated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function inviteUser(req: Request, res: Response) {
    try {
        const { shopData }: { [shopId: string]: ShopType } = res.locals
        const { email } = req.body
        const { shopInvite } = shopData
        if (!email) {
            return missingParam(res, 'Email')
        }
        if (shopInvite) {
            shopInvite.unshift(email)
        }
        await shop.update({
            ...shopData,
            shopInvite
        })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}