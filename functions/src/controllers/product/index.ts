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

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: ProductType } = req.body
        const { name } = data
        if (!name) {
            return missingParam(res, 'Name')
        }
        const keywords = createKeywords(name)
        const { shopId } = shopData
        data = {
            ...data,
            keywords,
            shopId
        }
        const id = await product.add(data)
        return successResponse(res, { id })
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
        await product.set(productId, data)
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
                await Promise.all(categoryId.map(async catId => {
                    const categoryData = await category.get(catId)
                    const { productId: catProductId } = categoryData
                    try {
                        await category.update(catId, {
                            productId: catProductId.filter(p => p !== productId)
                        })
                    } catch (err) {
                        console.error(err)
                    }
                }))
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
