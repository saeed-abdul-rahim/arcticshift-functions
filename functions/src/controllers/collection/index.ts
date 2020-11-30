import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as collection from '../../models/collection'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { CollectionType } from '../../models/collection/schema'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { removeProductFromCollection } from './helper'
import { isDefined } from '../../utils/isDefined'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/collection/index`

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: CollectionType } = req.body
        const { name } = data
        const { shopId } = shopData
        if (!name) {
            return missingParam(res, 'Name')
        }
        data = {
            ...data,
            shopId
        }
        const id = await collection.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: CollectionType } = req.body
        const { collectionId } = data 
        if (!collectionId) {
            return missingParam(res, 'ID')
        }
        const collectionData = await collection.get(collectionId)
        const newData = { ...collectionData, ...data }
        await collection.set(collectionId, newData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: collectionId } = req.params
        const collectionData = await collection.get(collectionId)
        const { images, productId } = collectionData
        await Promise.all(images.map(async img => {
            try {
                await storage.remove(img.content.path)
            } catch (_) {}
        }))
        await Promise.all(productId.map(async pId => {
            try {
                const productData = await product.get(pId)
                productData.collectionId = productData.collectionId.filter(cid => cid !== collectionId)
                await product.set(pId, productData)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }))
        await collection.remove(collectionId)
        return successDeleted(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function removeImage(req: Request, res: Response) {
    try {
        const { id: collectionId } = req.params
        const { path }: { path: string } = req.body
        const collectionData = await collection.get(collectionId)
        let { images } = collectionData
        const image = images.find(img => img.content.path === path)
        if (image) {
            const { content, thumbnails } = image
            await storage.remove(content.path)
            await storage.removeMultiple(thumbnails)
            images = images.filter(img => img.content.path !== path)
            await collection.update(collectionId, { images })
            return successDeleted(res)
        } else {
            return badRequest(res, 'Image not found')
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function addProduct(req: Request, res: Response) {
    try {
        const { data }: { data: { collectionId: string, productId: string[] } } = req.body
        const { collectionId, productId } = data
        if (!collectionId) {
            return missingParam(res, 'Collection ID')
        }
        if (!productId || productId.length === 0) {
            return missingParam(res, 'Product ID')
        }
        const collectionData = await collection.get(collectionId)
        const successPIds = await Promise.all(productId.map(async pId => {
            try {
                const productData = await product.get(pId)
                productData.collectionId.unshift(collectionId)
                await product.set(pId, productData)
                return pId
            } catch (_) {
                return
            }
        })).then(p => p.filter(isDefined))
        collectionData.productId.push(...successPIds)
        await collection.set(collectionId, collectionData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function removeProduct(req: Request, res: Response) {
    try {
        const { id: collectionId } = req.params
        const { data }: { data: { productId: string } } = req.body
        const { productId } = data
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const productData = await product.get(productId)
        const collectionData = await collection.get(collectionId)
        const { newProductData, newCollectionData } = removeProductFromCollection(productData, collectionData)
        await collection.set(collectionId, newCollectionData)
        await product.set(productId, newProductData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
