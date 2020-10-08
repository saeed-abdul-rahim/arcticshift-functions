import { Request, Response } from 'express'
import * as attribute from '../../models/attribute'
import * as attributeValue from '../../models/attributeValue'
import { ShopType } from '../../models/shop/schema'
import { AttributeType } from '../../models/attribute/schema'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { AttributeValue } from '../../models/attributeValue/schema'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: AttributeType } = req.body
        const { name } = data
        const { shopId } = shopData
        if (!name) {
            return missingParam(res, 'Name')
        }
        data = {
            ...data,
            shopId
        }
        const id = await attribute.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: AttributeType } = req.body
        const { attributeId, name } = data 
        if (!attributeId) {
            return missingParam(res, 'ID')
        }
        const attributeData = await attribute.get(attributeId)
        if (name) {
            attributeData.name = name
        }
        await attribute.set(attributeId, attributeData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: attributeId } = req.params
        const attributeData = await attribute.get(attributeId)
        const { attributeValueId } = attributeData
        await Promise.all(attributeValueId.map(async atvId => {
            try {
                await attributeValue.remove(atvId)
            } catch (_) {}
        }))
        await attribute.remove(attributeId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addAttributeValue(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        const { data }: { [data: string]: AttributeValue } = req.body
        const { shopId } = shopData
        const { attributeId, name } = data
        if (!attributeId) {
            return missingParam(res, 'Attribute ID')
        }
        if (!name) {
            return missingParam(res, 'Name')
        }
        const attributeValueId = await attributeValue.add({
            shopId,
            attributeId,
            name
        })
        const attributeData = await attribute.get(attributeId)
        attributeData.attributeValueId.unshift(attributeValueId)
        await attribute.set(attributeId, attributeData)
        return successResponse(res, { id: attributeValueId })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function updateAttributeValue(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: AttributeValue } = req.body
        const { attributeValueId, name } = data
        if (!attributeValueId) {
            return missingParam(res, 'Attribute Value ID')
        }
        if (!name) {
            return missingParam(res, 'Name')
        }
        await attributeValue.update(attributeValueId, { name })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeAttributeValue(req: Request, res: Response) {
    const { attributeId, attributeValueId } = req.params
    try {
        await attributeValue.remove(attributeValueId)
        const attributeData = await attribute.get(attributeId)
        attributeData.attributeValueId = attributeData.attributeValueId.filter(aid => aid !== attributeValueId)
        await attribute.set(attributeId, attributeData)
        return successDeleted(res)
    } catch (err) {
        console.error(err, attributeId, attributeValueId)
        return serverError(res, err)
    }
}
