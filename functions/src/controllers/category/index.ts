import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as category from '../../models/category'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { CategoryType } from '../../models/category/schema'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated, successDeleted } from '../../responseHandler/successHandler'

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
        return successCreated(res)
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
                        await storage.remove(img.path)
                    } catch (_) {}
                }))
                await category.remove(subId)
            } catch (_) {}
        }))
        await Promise.all(images.map(async img => {
            try {
                await storage.remove(img.path)
            } catch (_) {}
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
        const { data }: { [data: string]: CategoryType } = req.body
        const { categoryId, images } = data
        if (!categoryId) {
            return missingParam(res, 'ID')
        }
        if (!images) {
            return missingParam(res, 'Image')
        }
        const categoryData = await category.get(categoryId)
        await Promise.all(images.map(async img => storage.remove(img.path)))
        images.forEach(img => 
            categoryData.images = categoryData.images.filter(i => i.path !== img.path)
        )
        await category.set(categoryId, categoryData)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addProduct(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        const { shopId } = shopData
        const { categoryId, productId }: { categoryId: string, productId: string } = req.body
        if (!categoryId) {
            return missingParam(res, 'Category ID')
        }
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        await product.get(productId)
        const categoryData = await category.get(categoryId)
        const { productId: productIds } = categoryData
        productIds.unshift(productId)
        await category.update(categoryId, { productId: productIds })
        await product.update(productId, { shopId, categoryId })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeProduct(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        const { shopId } = shopData
        const { cid: categoryId, pid: productId } = req.params
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        await product.get(productId)
        const categoryData = await category.get(categoryId)
        let { productId: productIds } = categoryData
        productIds = productIds.filter(pid => pid !== productId)
        await category.update(categoryId, { productId: productIds })
        await product.update(productId, { shopId, categoryId: '' })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
