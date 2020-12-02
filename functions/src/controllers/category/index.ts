import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as category from '../../models/category'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { CategoryType } from '../../models/category/schema'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { addProductToAllCategories, removeProductFromAllCategories } from './helper'
import { isDefined } from '../../utils/isDefined'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/category/index`

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
                const { subCategoryId, parentCategoryIds } = parentCategoryData
                subCategoryId.push(categoryId)
                parentCategoryIds.push(parentCategoryId)
                await category.update(parentCategoryId, { subCategoryId })
                await category.update(categoryId, { parentCategoryIds })
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }
        return successResponse(res, { id: categoryId })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: CategoryType } = req.body
        const { categoryId, images } = data 
        if (!categoryId) {
            return missingParam(res, 'ID')
        }
        const categoryData = await category.get(categoryId)
        if (images && images.length > 0) {
            categoryData.images = images
        }
        const newData = { ...categoryData, ...data }
        await category.set(categoryId, newData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: categoryId } = req.params
        const categoryData = await category.get(categoryId)
        const { subCategoryId, images, productId, parentCategoryId } = categoryData
        await Promise.all(subCategoryId.map(async subId => {
            try {
                const subCategoryData = await category.get(subId)
                await Promise.all(subCategoryData.images.map(async img => {
                    try {
                        await storage.remove(img.content.path)
                    } catch (err) {
                        console.error(`${functionPath}/${callerName()}`, err)
                    }
                }))
                await category.remove(subId)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }))
        await Promise.all(images.map(async img => {
            try {
                await storage.remove(img.content.path)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }))
        await Promise.all(productId.map(async pid => {
            try {
                const productData = await product.get(pid)
                productData.categoryId = productData.categoryId === categoryId ? '' : productData.categoryId
                productData.allCategoryId = productData.allCategoryId.filter(cid => !subCategoryId.includes(cid))
                await product.set(pid, productData)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }))
        if (parentCategoryId) {
            const parentCategoryData = await category.get(parentCategoryId)
            parentCategoryData.subCategoryId = parentCategoryData.subCategoryId.filter(cid => cid !== categoryId)
            await category.set(parentCategoryId, parentCategoryData)
        }
        await category.remove(categoryId)
        return successDeleted(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function addProduct(req: Request, res: Response) {
    try {
        const { data }: { data: { categoryId: string, productId: string[] } } = req.body
        const { categoryId, productId } = data
        if (!categoryId) {
            return missingParam(res, 'Category ID')
        }
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const categoryData = await category.get(categoryId)
        const allProductData = await Promise.all(productId.map(async pId => {
            try {
                return await product.get(pId)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
                return
            }
        })).then(p => p.filter(isDefined))
        const pIds = allProductData.map(p => p.productId)
        const allCategories = await addProductToAllCategories(pIds, categoryData)
        const cIds = allCategories.map(c => c.categoryId)
        await Promise.all(allProductData.map(async productData => {
            try {
                productData.categoryId = categoryId
                productData.allCategoryId = cIds
                await product.set(productData.productId, productData)
            } catch (err) {
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }))
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function removeProduct(req: Request, res: Response) {
    try {
        const { id: categoryId } = req.params
        const { data }: { data: { productId: string } } = req.body
        const { productId } = data
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const productData = await product.get(productId)
        const categoryData = await category.get(categoryId)
        const allCategories = await removeProductFromAllCategories(productId, categoryData)
        productData.categoryId = ''
        productData.allCategoryId = productData.allCategoryId.filter(c => !allCategories.includes(c))
        await product.set(productId, productData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
