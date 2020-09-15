import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as category from '../../models/category'
import * as collection from '../../models/collection'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { ProductType } from '../../models/product/schema'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated } from '../../responseHandler/successHandler'
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
        await product.add(data)
        return successCreated(res)
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

export async function remove(req: Request, res: Response) {
    try {
        const { id: productId } = req.params
        const productData = await product.get(productId)
        const { image, variantId, thumbnailUrls, categoryId, collectionId } = productData
        if (image) {
            try {
                const { path } = image
                await storage.remove(path)
            } catch (err) {
                console.error(err)
            }
        }
        if (thumbnailUrls) {
            try {
                await Promise.all(thumbnailUrls.map(async thumbnail => {
                    const { image: thumbImage } = thumbnail
                    if (thumbImage) {
                        const { path: thumbPath } = thumbImage
                        await storage.remove(thumbPath)
                    }
                }))
            } catch (err) {
                console.error(err)
            }
        }
        if (categoryId) {
            try {
                const categoryData = await category.get(categoryId)
                const { productId: catProductId } = categoryData
                await category.update(categoryId, {
                    productId: catProductId.filter(p => p !== productId)
                })
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
