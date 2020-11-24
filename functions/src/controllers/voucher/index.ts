import { Request, Response } from 'express'
import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { CatalogType } from '../../models/common/schema'
import { ShopType } from '../../models/shop/schema'
import { VoucherType } from '../../models/voucher/schema'
import { checkIfVoucherExists, updateCatalog } from './helper'
import * as voucher from '../../models/voucher'

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: VoucherType } = req.body
        const { code, value, valueType, startDate } = data
        const { shopId } = shopData
        if (!code) {
            return missingParam(res, 'Code')
        }
        const voucherExists = await checkIfVoucherExists(code)
        if (voucherExists) {
            return badRequest(res, 'Voucher exists')
        }
        if (!valueType) {
            return missingParam(res, 'Value Type')
        }
        if (!value && valueType !== 'shipping') {
            return missingParam(res, 'Value')
        }
        if (!startDate) {
            return missingParam(res, 'Start Date')
        }
        data = {
            ...data,
            shopId
        }
        const id = await voucher.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: VoucherType } = req.body
        const { voucherId, code } = data 
        if (!voucherId) {
            return missingParam(res, 'ID')
        }
        const voucherData = await voucher.get(voucherId)
        if (code && voucherData.code !== code) {
            const voucherExists = await checkIfVoucherExists(code)
            if (voucherExists) {
                return badRequest(res, 'Voucher exists')
            }
        }
        const newData = {
            ...voucherData,
            ...data
        }
        await voucher.set(voucherId, newData)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: voucherId } = req.params
        const voucherData = await voucher.get(voucherId)
        await voucher.remove(voucherId)
        const { productId, categoryId, collectionId } = voucherData
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
        const { id: voucherId } = req.params
        const { data }: { [data: string]: CatalogType } = req.body
        const { productId, collectionId, categoryId } = data
        const voucherData = await voucher.get(voucherId)
        if (productId) {
            voucherData.productId.push(...productId)
        }
        if (collectionId) {
            voucherData.collectionId.push(...collectionId)
        }
        if (categoryId) {
            voucherData.categoryId.push(...categoryId)
        }
        await voucher.set(voucherId, voucherData)
        await updateCatalog(voucherId, {
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
        const { id: voucherId } = req.params
        const { data }: { [data: string]: CatalogType } = req.body
        const { productId, collectionId, categoryId } = data
        const voucherData = await voucher.get(voucherId)
        if (productId) {
            voucherData.productId = voucherData.productId.filter(pid => !productId.includes(pid))
        }
        if (collectionId) {
            voucherData.collectionId = voucherData.collectionId.filter(pid => !collectionId.includes(pid))
        }
        if (categoryId) {
            voucherData.categoryId = voucherData.categoryId.filter(pid => !categoryId.includes(pid))
        }
        await voucher.set(voucherId, voucherData)
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