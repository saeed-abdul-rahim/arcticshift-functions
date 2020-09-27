import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { VariantType } from '../../models/variant/schema'
import { badRequest, serverError, missingParam } from '../../responseHandler/errorHandler'
import { successResponse, successUpdated } from '../../responseHandler/successHandler'
import { createKeywords } from '../../utils/createKeywords'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: VariantType } = req.body
        const { name, sku, productId } = data
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        if (!name) {
            return missingParam(res, 'Name')
        }
        const productData = await product.get(productId)
        const keywords = createKeywords(name)
        if (sku) {
            const prevVariant = await variant.getOneByCondition([{
                field: 'sku',
                type: '==',
                value: data.sku
            }])
            if (prevVariant) {
                return badRequest(res, 'SKU exists')
            }
        }
        const { shopId } = shopData
        data = {
            ...data,
            keywords,
            shopId
        }
        const variantId = await variant.add(data)
        productData.variantId.push(variantId)
        await product.set(productId, productData)
        return successResponse(res, { id: variantId })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: VariantType } = req.body
        const { variantId, sku, name } = data
        if (!variantId) {
            return missingParam(res, 'ID')
        }
        if (sku) {
            let prevVariant = await variant.getByCondition([{
                field: 'sku',
                type: '==',
                value: data.sku
            }])
            if (prevVariant) {
                prevVariant = prevVariant.filter(p => p.variantId !== variantId)
                if (prevVariant.length > 0) {
                    return badRequest(res, 'SKU exists')
                }
            }
        }
        const oldVariantData = await variant.get(variantId)
        let keywords = oldVariantData.keywords
        if (name) {
            keywords = createKeywords(name)
        }
        data = {
            ...oldVariantData,
            ...data,
            keywords
        }
        await variant.set(variantId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: variantId } = req.params
        const variantData = await variant.get(variantId)
        const { image, thumbnailUrls } = variantData
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
        await variant.remove(variantId)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
