import { Request, Response } from 'express'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
// import * as storage from '../../storage'
import { ShopType } from '../../models/shop/schema'
import { VariantType } from '../../models/variant/schema'
import { badRequest, serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
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
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
