import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { ProductTypeType } from '../../models/productType/schema'
import * as productType from '../../models/productType'

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
        const { productTypeId, name, productAttributeId, variantAttributeId, taxId } = data
        if (!productTypeId) {
            return missingParam(res, 'ID')
        }
        const productTypeData = await productType.get(productTypeId)
        if (name) {
            productTypeData.name = name
        }
        if (productAttributeId) {
            productTypeData.productAttributeId = productAttributeId
        }
        if (variantAttributeId) {
            productTypeData.variantAttributeId = variantAttributeId
        }
        if (taxId) {
            productTypeData.taxId = taxId
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
        await productType.remove(productTypeId)
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
