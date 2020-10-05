import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as category from '../../models/category'
import * as collection from '../../models/collection'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { ProductType } from '../../models/product/schema'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { createKeywords } from '../../utils/createKeywords'
import { removeProductFromCategory } from '../category/helper'
import { organizeProduct, updateOrganizeProduct } from './helper'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: ProductType } = req.body
        const { name, productTypeId, price } = data
        if (!name) {
            return missingParam(res, 'Name')
        }
        if (!productTypeId) {
            return missingParam(res, 'Product Type')
        }
        if (!price) {
            return missingParam(res, 'Price')
        }
        const keywords = createKeywords(name)
        const { shopId } = shopData
        data = {
            ...data,
            keywords,
            shopId
        }
        const productData = await product.add(data)
        const { productId } = productData
        await organizeProduct(productData)
        return successResponse(res, { id: productId })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: ProductType } = req.body
        const { productId, name } = data
        if (!productId) {
            return missingParam(res, 'ID')
        }
        const oldProductData = await product.get(productId)
        let keywords = oldProductData.keywords
        if (name) {
            keywords = createKeywords(name)
        }
        data = {
            ...oldProductData,
            ...data,
            keywords
        }
        const productData = await product.set(productId, data)
        await updateOrganizeProduct(oldProductData, productData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeImage(req: Request, res: Response) {
    try {
        const { id: productId } = req.params
        const { path }: { path: string } = req.body
        const productData = await product.get(productId)
        let { images } = productData
        const image = images.find(img => img.content.path === path)
        if (image) {
            const { content, thumbnails } = image
            await storage.remove(content.path)
            await storage.removeMultiple(thumbnails)
            images = images.filter(img => img.content.path !== path)
            await product.update(productId, { images })
            return successDeleted(res)
        } else {
            return badRequest(res, 'Image not found')
        }
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: productId } = req.params
        const productData = await product.get(productId)
        const { images, variantId, categoryId, collectionId } = productData
        if (images) {
            await Promise.all(images.map(async img => {
                const { content, thumbnails } = img
                if (content) {
                    try {
                        const { path } = content
                        await storage.remove(path)
                    } catch (err) {
                        console.error(err)
                    }
                }
                if (thumbnails) {
                    try {
                        await Promise.all(thumbnails.map(async thumbnail => {
                            const { path: thumbPath } = thumbnail
                            await storage.remove(thumbPath)
                        }))
                    } catch (err) {
                        console.error(err)
                    }
                }
            }))
        }
        if (categoryId) {
            try {
                const categoryData = await category.get(categoryId)
                await removeProductFromCategory(productData, categoryData)
            } catch (err) {
                console.error(err)
            }
        }
        if (collectionId && collectionId.length > 0) {
            try {
                await Promise.all(collectionId.map(async colId => {
                    const collectionData = await collection.get(colId)
                    const { productId: colProductId } = collectionData
                    try {
                        await collection.update(colId, {
                            productId: colProductId.filter(p => p !== productId)
                        })
                    } catch (err) {
                        console.error(err)
                    }
                }))
            } catch (err) {
                console.error(err)
            }
        }
        if (variantId && variantId.length > 0) {
            try {
                await Promise.all(variantId.map(async varId => {
                    try {
                        await variant.remove(varId)
                    } catch (err) {
                        console.log(err)
                    }
                }))
            } catch (err) {
                console.error(err)
            }
        }
        await product.remove(productId)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
