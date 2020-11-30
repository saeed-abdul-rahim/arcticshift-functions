import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { ShippingType } from '../../models/shipping/schema'
import * as shipping from '../../models/shipping'
import * as shippingRate from '../../models/shippingRate'
import * as warehouse from '../../models/warehouse'
import { isBothArrEqual } from '../../utils/arrayUtils'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/shipping/index`

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: ShippingType } = req.body
        const { name, warehouseId } = data
        if (!name) {
            return missingParam(res, 'Name')
        }
        const { shopId } = shopData
        data = {
            ...data,
            shopId
        }
        const id = await shipping.add(data)
        if (warehouseId && warehouseId.length > 0) {
            await Promise.all(warehouseId.map(async wId => {
                try {
                    const warehouseData = await warehouse.get(wId)
                    warehouseData.shippingId.push(id)
                    await warehouse.set(wId, warehouseData)
                } catch (err) {
                    await shipping.update(id, {
                        warehouseId: warehouseId.filter(i => i !== wId)
                    })
                }
            }))
        }
        return successResponse(res, { id })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: ShippingType } = req.body
        const { shippingId, warehouseId } = data
        if (!shippingId) {
            return missingParam(res, 'ID')
        }
        const shippingData = await shipping.get(shippingId)
        data = {
            ...shippingData,
            ...data
        }
        await shipping.set(shippingId, data)
        if (warehouseId && !isBothArrEqual(warehouseId, shippingData.warehouseId)) {
            const warehouseIdNotPresentInOld = warehouseId.filter(val => !shippingData.warehouseId.includes(val));
            const warehouseIdNotPresentInNew = shippingData.warehouseId.filter(val => !warehouseId.includes(val));
            await Promise.all(warehouseIdNotPresentInOld.map(async wId => {
                try {
                    const warehouseData = await warehouse.get(wId)
                    warehouseData.shippingId.push(shippingId)
                    await warehouse.set(wId, warehouseData)
                } catch (err) {
                    console.error(`${functionPath}/${callerName()}`, err)
                    await shipping.update(shippingId, {
                        warehouseId: warehouseId.filter(id => id !== wId)
                    })
                }
            }))
            await Promise.all(warehouseIdNotPresentInNew.map(async wId => {
                try {
                    const warehouseData = await warehouse.get(wId)
                    warehouseData.shippingId = warehouseData.shippingId.filter(id => id !== shippingId)
                    await warehouse.set(wId, warehouseData)
                } catch (err) {
                    warehouseId.push(wId)
                    await shipping.update(shippingId, { warehouseId })
                }
            }))
        }
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: shippingId } = req.params
        const shippingData = await shipping.get(shippingId)
        const { rates } = shippingData
        const warehouseData = await warehouse.getByCondition([{
            field: 'shippingId',
            type: 'array-contains',
            value: shippingId
        }])
        if (warehouseData && warehouseData.length > 0) {
            await Promise.all(warehouseData.map(async wd => {
                try {
                    const { warehouseId } = wd
                    wd.shippingId = wd.shippingId.filter(id => id !== shippingId)
                    await warehouse.set(warehouseId, wd)
                } catch (err) {
                    console.error(`${functionPath}/${callerName()}`, err)
                }
            }))
        }
        await Promise.all(rates.map(async rateId => {
            try {
                await shippingRate.remove(rateId)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }))
        await shipping.remove(shippingId)
        return successDeleted(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
