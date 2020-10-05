import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as collection from '../../models/collection'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { CollectionType } from '../../models/collection/schema'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { addProductToCollection, removeProductFromCollection } from './helper'

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
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: CollectionType } = req.body
        const { collectionId, name, images } = data 
        if (!collectionId) {
            return missingParam(res, 'ID')
        }
        const collectionData = await collection.get(collectionId)
        if (name) {
            collectionData.name = name
        }
        if (images) {
            collectionData.images = images
        }
        await collection.set(collectionId, collectionData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: collectionId } = req.params
        const collectionData = await collection.get(collectionId)
        const { images } = collectionData
        await Promise.all(images.map(async img => {
            try {
                await storage.remove(img.content.path)
            } catch (_) {}
        }))
        await collection.remove(collectionId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
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
        console.error(err)
        return serverError(res, err)
    }
}

export async function addProduct(req: Request, res: Response) {
    try {
        const { collectionId, productId }: { collectionId: string, productId: string } = req.body
        if (!collectionId) {
            return missingParam(res, 'Collection ID')
        }
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const productData = await product.get(productId)
        const collectionData = await collection.get(collectionId)
        const { newProductData, newCollectionData } = addProductToCollection(productData, collectionData)
        await collection.set(collectionId, newCollectionData)
        await product.set(productId, newProductData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeProduct(req: Request, res: Response) {
    try {
        const { cid: collectionId, pid: productId } = req.params
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
        console.error(err)
        return serverError(res, err)
    }
}
