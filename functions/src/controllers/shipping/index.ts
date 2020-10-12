import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { ShippingType } from '../../models/shipping/schema'
import * as shipping from '../../models/shipping'
import * as warehouse from '../../models/warehouse'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: ShippingType } = req.body
        const { name } = data
        if (!name) {
            return missingParam(res, 'Name')
        }
        const { shopId } = shopData
        data = {
            ...data,
            shopId
        }
        const id = await shipping.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: ShippingType } = req.body
        const { shippingId } = data
        if (!shippingId) {
            return missingParam(res, 'ID')
        }
        const shippingData = await shipping.get(shippingId)
        data = {
            ...shippingData,
            ...data
        }
        await shipping.set(shippingId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: shippingId } = req.params
        await shipping.get(shippingId)
        const warehouseData = await warehouse.getByCondition([{
            field: 'shippingId',
            type: '==',
            value: shippingId
        }])
        if (warehouseData && warehouseData.length > 0) {
            await Promise.all(warehouseData.map(async wd => {
                try {
                    const { warehouseId } = wd
                    wd.shippingId = wd.shippingId.filter(id => id !== shippingId)
                    await warehouse.set(warehouseId, wd)
                } catch (err) {
                    console.error(err)
                }
            }))
        }
        await shipping.remove(shippingId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
