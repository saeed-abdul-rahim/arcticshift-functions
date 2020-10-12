import { Request, Response } from 'express'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { ProductTypeType } from '../../models/productType/schema'
import * as productType from '../../models/productType'
import * as attribute from '../../models/attribute'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import { uniqueArr } from '../../utils/uniqueArr'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: ProductTypeType } = req.body
        const { name } = data
        if (!name) {
            return missingParam(res, 'Name')
        }
        const { shopId } = shopData
        data = {
            ...data,
            shopId
        }
        const id = await productType.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: ProductTypeType } = req.body
        let attributeIds: string[] = []
        const { productTypeId, name, productAttributeId, variantAttributeId, taxId } = data
        if (!productTypeId) {
            return missingParam(res, 'ID')
        }
        const productTypeData = await productType.get(productTypeId)
        if (name) {
            productTypeData.name = name
        }
        if (productAttributeId) {
            attributeIds.push(...productAttributeId)
            productTypeData.productAttributeId = productAttributeId
        }
        if (variantAttributeId) {
            attributeIds.push(...variantAttributeId)
            productTypeData.variantAttributeId = variantAttributeId
        }
        if (taxId) {
            productTypeData.taxId = taxId
        }

        const oldAttributes = [...productTypeData.productAttributeId, ...productTypeData.variantAttributeId]
        const attributesToRemove = uniqueArr(oldAttributes.filter(id => !attributeIds.includes(id)))
        if (attributesToRemove.length > 0) {
            await Promise.all(attributesToRemove.map(async id => {
                try {
                    const attributeData = await attribute.get(id)
                    attributeData.productTypeId = attributeData.productTypeId.filter(pid => pid !== productTypeId)
                    await attribute.set(id, attributeData)
                } catch (err) {
                    console.error(err)
                }
            }))
        }
        if (attributeIds.length > 0) {
            attributeIds = uniqueArr(attributeIds)
            await Promise.all(attributeIds.map(async id => {
                const attributeData = await attribute.get(id)
                attributeData.productTypeId.push(productTypeId)
                await attribute.set(id, attributeData)
            }))
        }

        data = {
            ...productTypeData,
            ...data
        }
        await productType.set(productTypeId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: productTypeId } = req.params
        await productType.get(productTypeId)
        const products = await product.getByCondition([{ field: 'productTypeId', type: '==', value: productTypeId }])
        const variants = await variant.getByCondition([{ field: 'productTypeId', type: '==', value: productTypeId }])
        if (products) {
            return badRequest(res, 'Product Type is being used by product')
        }
        if (variants) {
            return badRequest(res, 'Product Type is being used by Variant')
        }
        await productType.remove(productTypeId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
