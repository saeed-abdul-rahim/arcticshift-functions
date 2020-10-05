import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as category from '../../models/category'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { CategoryType } from '../../models/category/schema'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { addProductToCategory, removeProductFromCategory } from './helper'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: CategoryType } = req.body
        const { name, parentCategoryId } = data
        const { shopId } = shopData
        if (!name) {
            return missingParam(res, 'Name')
        }
        data = {
            ...data,
            shopId
        }
        const categoryId = await category.add(data)
        if (parentCategoryId) {
            try {
                const parentCategoryData = await category.get(parentCategoryId)
                const { subCategoryId } = parentCategoryData
                subCategoryId.push(categoryId)
                await category.update(parentCategoryId, { subCategoryId })
            } catch (err) {
                console.error(err)
            }
        }
        return successResponse(res, { id: categoryId })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: CategoryType } = req.body
        const { categoryId, name, images } = data 
        if (!categoryId) {
            return missingParam(res, 'ID')
        }
        const categoryData = await category.get(categoryId)
        if (name) {
            categoryData.name = name
        }
        if (images) {
            categoryData.images = images
        }
        await category.set(categoryId, categoryData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: categoryId } = req.params
        const categoryData = await category.get(categoryId)
        const { subCategoryId, images } = categoryData
        await Promise.all(subCategoryId.map(async subId => {
            try {
                const subCategoryData = await category.get(subId)
                await Promise.all(subCategoryData.images.map(async img => {
                    try {
                        await storage.remove(img.content.path)
                    } catch (_) {}
                }))
                await category.remove(subId)
            } catch (err) {
                console.error(err)
            }
        }))
        await Promise.all(images.map(async img => {
            try {
                await storage.remove(img.content.path)
            } catch (err) {
                console.error(err)
            }
        }))
        await category.remove(categoryId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeImage(req: Request, res: Response) {
    try {
        const { id: categoryId } = req.params
        const { path }: { path: string } = req.body
        const categoryData = await category.get(categoryId)
        let { images } = categoryData
        const image = images.find(img => img.content.path === path)
        if (image) {
            const { content, thumbnails } = image
            await storage.remove(content.path)
            await storage.removeMultiple(thumbnails)
            images = images.filter(img => img.content.path !== path)
            await category.update(categoryId, { images })
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
        const { categoryId, productId }: { categoryId: string, productId: string } = req.body
        if (!categoryId) {
            return missingParam(res, 'Category ID')
        }
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const productData = await product.get(productId)
        const categoryData = await category.get(categoryId)
        const { newCategoryData, newProductData } = await addProductToCategory(productData, categoryData)
        await category.set(categoryId, newCategoryData)
        await product.set(productId, newProductData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeProduct(req: Request, res: Response) {
    try {
        const { cid: categoryId, pid: productId } = req.params
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const productData = await product.get(productId)
        const categoryData = await category.get(categoryId)
        const { newCategoryData, newProductData } = await removeProductFromCategory(productData, categoryData)
        await category.set(categoryId, newCategoryData)
        await product.set(productId, newProductData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
