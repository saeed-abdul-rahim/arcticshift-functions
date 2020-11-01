import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShippingRateType } from '../../models/shippingRate/schema'
import * as shippingRate from '../../models/shippingRate'
import * as shipping from '../../models/shipping'

export async function create(req: Request, res: Response) {
    try {
        let { data }: { data: ShippingRateType } = req.body
        const { name, shippingId } = data
        if (!shippingId) {
            return missingParam(res, 'Shipping ID')
        }
        if (!name) {
            return missingParam(res, 'Name')
        }
        data = {
            ...data,
            shippingId
        }
        const shippingData = await shipping.get(shippingId)
        const id = await shippingRate.add(data)
        shippingData.rates.push(id)
        await shipping.set(shippingId, shippingData)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: ShippingRateType } = req.body
        const { shippingRateId } = data
        if (!shippingRateId) {
            return missingParam(res, 'ID')
        }
        const shippingRateData = await shippingRate.get(shippingRateId)
        data = {
            ...shippingRateData,
            ...data
        }
        await shippingRate.set(shippingRateId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: shippingRateId } = req.params
        const shippingRateData = await shippingRate.get(shippingRateId)
        const { shippingId } = shippingRateData
        const shippingData = await shipping.get(shippingId)
        shippingData.rates = shippingData.rates.filter(rate => rate !== shippingRateId)
        await shipping.set(shippingId, shippingData)
        await shippingRate.remove(shippingRateId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
