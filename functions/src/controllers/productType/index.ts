import { Request, Response } from 'express'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { ProductTypeType } from '../../models/productType/schema'
import * as productType from '../../models/productType'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/productType/index`

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
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: ProductTypeType } = req.body
        const { productTypeId } = data
        if (!productTypeId) {
            return missingParam(res, 'ID')
        }
        const productTypeData = await productType.get(productTypeId)
        data = {
            ...productTypeData,
            ...data
        }
        await productType.set(productTypeId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
