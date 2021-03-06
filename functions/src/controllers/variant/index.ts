import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { VariantType } from '../../models/variant/schema'
import { badRequest, serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { CONTROLLERS, PRODUCT } from '../../config/constants'
import { callerName } from '../../utils/functionUtils'
import { wordKeys } from '../../utils/strUtils'

const functionPath = `${CONTROLLERS}/variant/index`

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: VariantType } = req.body
        const { sku, productId, name } = data
        let { price, prices } = data
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const productData = await product.get(productId)
        const { name: productName, images: productImages } = productData
        const variantImages = productImages.map(image => {
            image.id = PRODUCT
            return image
        })
        data = {
            ...data,
            productName,
            images: variantImages
        }
        if (sku) {
            const prevVariant = await variant.getOneByCondition([{
                field: 'sku',
                type: '==',
                value: sku
            }])
            if (prevVariant) {
                return badRequest(res, 'SKU exists')
            }
        }
        if (name) {
            data.keywords = wordKeys(`${productName} ${name}`)
            if (sku) {
                data.keywords = wordKeys(`${productName} ${name} ${sku}`)
            }
        }
        const { shopId } = shopData
        data = {
            ...data,
            shopId
        }
        if (!price) {
            price = productData.price
            prices = [{ name: 'override', value: productData.price }]
            data = {
                ...data,
                price,
                prices
            }
        }
        const variantId = await variant.add(data)
        productData.variantId.push(variantId)
        await product.set(productId, productData)
        return successResponse(res, { id: variantId })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: VariantType } = req.body
        const { variantId, sku, trackInventory, images, name } = data
        if (!variantId) {
            return missingParam(res, 'ID')
        }
        if (sku) {
            let prevVariant = await variant.getByCondition([{
                field: 'sku',
                type: '==',
                value: sku
            }])
            if (prevVariant) {
                prevVariant = prevVariant.filter(p => p.variantId !== variantId)
                if (prevVariant.length > 0) {
                    return badRequest(res, 'SKU exists')
                }
            }
        }
        const oldVariantData = await variant.get(variantId)
        if (images && images.length > 0) {
            oldVariantData.images = images
        }
        if (trackInventory === false) {
            data.bookedQuantity = 0
        }
        if (name) {
            data.keywords = wordKeys(`${oldVariantData.productName} ${name}`)
            if (sku) {
                data.keywords = wordKeys(`${oldVariantData.productName} ${name} ${sku}`)
            }
        }
        data = {
            ...oldVariantData,
            ...data
        }
        await variant.set(variantId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}


export async function removeImage(req: Request, res: Response) {
    try {
        const { id: variantId } = req.params
        const { path }: { path: string } = req.body
        const variantData = await variant.get(variantId)
        let { images } = variantData
        const image = images.find(img => img.content.path === path)
        if (image) {
            if (image.id && image.id !== PRODUCT) {
                const { content, thumbnails } = image
                await storage.remove(content.path)
                await storage.removeMultiple(thumbnails)
            }
            images = images.filter(img => img.content.path !== path)
            await variant.update(variantId, { images })
            return successDeleted(res)
        } else {
            return badRequest(res, 'Image not found')
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: variantId } = req.params
        const variantData = await variant.get(variantId)
        const { images, productId } = variantData
        const productData = await product.get(productId)
        productData.variantId = productData.variantId.filter(id => id !== variantId)
        if (images) {
            await Promise.all(images.map(async img => {
                const { content, thumbnails } = img
                if (content) {
                    try {
                        const { path } = content
                        await storage.remove(path)
                    } catch (err) {
                        console.error(`${functionPath}/${callerName()}`, err)
                    }
                }
                if (thumbnails) {
                    try {
                        await Promise.all(thumbnails.map(async thumbnail => {
                            const { path: thumbPath } = thumbnail
                            await storage.remove(thumbPath)
                        }))
                    } catch (err) {
                        console.error(`${functionPath}/${callerName()}`, err)
                    }
                }
            }))
        }
        await product.set(productId, productData)
        await variant.remove(variantId)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
