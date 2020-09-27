import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { valueTypes } from '../../models/common'
import { ShopType } from '../../models/shop/schema'
import { SaleDiscountType } from '../../models/saleDiscount/schema'
import { updateCatalog } from './helper'
import * as saleDiscount from '../../models/saleDiscount'
import { CatalogType } from '../../models/common/schema'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: SaleDiscountType } = req.body
        const { name, value, valueType, startDate } = data
        const { shopId } = shopData
        if (!name) {
            return missingParam(res, 'Name')
        }
        if (!value) {
            return missingParam(res, 'Value')
        }
        if (!valueType) {
            return missingParam(res, 'Value Type')
        }
        if (!startDate) {
            return missingParam(res, 'Start Date')
        }
        data = {
            ...data,
            shopId
        }
        const id = await saleDiscount.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: SaleDiscountType } = req.body
        const { saleDiscountId, name, value, valueType, startDate, endDate } = data 
        if (!saleDiscountId) {
            return missingParam(res, 'ID')
        }
        const saleDiscountData = await saleDiscount.get(saleDiscountId)
        if (name) {
            saleDiscountData.name = name
        }
        if (value) {
            saleDiscountData.value = value
        }
        if (valueType && valueTypes.includes(valueType)) {
            saleDiscountData.valueType = valueType
        }
        if (startDate) {
            saleDiscountData.startDate = startDate
        }
        if (endDate) {
            saleDiscountData.endDate = endDate
        }
        await saleDiscount.set(saleDiscountId, saleDiscountData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: saleDiscountId } = req.params
        const saleDiscountData = await saleDiscount.get(saleDiscountId)
        await saleDiscount.remove(saleDiscountId)
        const { productId, categoryId, collectionId } = saleDiscountData
        await updateCatalog('', {
            productId,
            categoryId,
            collectionId
        })
        return successDeleted(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function addCatalog(req: Request, res: Response) {
    try {
        const { id: saleDiscountId } = req.params
        const { data }: { [data: string]: CatalogType } = req.body
        const { productId, collectionId, categoryId } = data
        const saleDiscountData = await saleDiscount.get(saleDiscountId)
        if (productId) {
            saleDiscountData.productId.push(...productId)
        }
        if (collectionId) {
            saleDiscountData.collectionId.push(...collectionId)
        }
        if (categoryId) {
            saleDiscountData.categoryId.push(...categoryId)
        }
        await saleDiscount.set(saleDiscountId, saleDiscountData)
        await updateCatalog(saleDiscountId, {
            productId,
            categoryId,
            collectionId
        })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function removeCatalog(req: Request, res: Response) {
    try {
        const { id: saleDiscountId } = req.params
        const { data }: { [data: string]: CatalogType } = req.body
        const { productId, collectionId, categoryId } = data
        const saleDiscountData = await saleDiscount.get(saleDiscountId)
        if (productId) {
            saleDiscountData.productId = saleDiscountData.productId.filter(pid => !productId.includes(pid))
        }
        if (collectionId) {
            saleDiscountData.collectionId = saleDiscountData.collectionId.filter(pid => !collectionId.includes(pid))
        }
        if (categoryId) {
            saleDiscountData.categoryId = saleDiscountData.categoryId.filter(pid => !categoryId.includes(pid))
        }
        await saleDiscount.set(saleDiscountId, saleDiscountData)
        await updateCatalog('', {
            productId,
            categoryId,
            collectionId
        })
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
