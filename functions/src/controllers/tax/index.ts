import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successUpdated, successDeleted, successResponse } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { TaxType } from '../../models/tax/schema'
import * as tax from '../../models/tax'
import * as shop from '../../models/shop'
import * as shipping from '../../models/shipping'
import * as productType from '../../models/productType'
import { valueTypes } from '../../models/common'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/tax/index`

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: TaxType } = req.body
        const { name, value, valueType, type } = data
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
        if (!type) {
            return missingParam(res, 'Type')
        }
        data = {
            ...data,
            shopId
        }
        const id = await tax.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        const { data }: { [data: string]: TaxType } = req.body
        const { taxId, name, value, valueType, type } = data 
        if (!taxId) {
            return missingParam(res, 'ID')
        }
        const taxData = await tax.get(taxId)
        if (name) {
            taxData.name = name
        }
        if (value) {
            taxData.value = value
        }
        if (valueType && valueTypes.includes(valueType)) {
            taxData.valueType = valueType
        }
        if (type && tax.taxTypes.includes(type)) {
            taxData.type = type
        }
        await tax.set(taxId, taxData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: taxId } = req.params
        const taxData = await tax.get(taxId)
        const { type } = taxData
        if (type === 'shop') {
            const shopsData = await shop.getByCondition([{
                field: 'taxId',
                type: '==',
                value: taxId
            }])
            if (shopsData) {
                await Promise.all(shopsData.map(async shopData => {
                    const { shopId } = shopData
                    shopData.taxId = ''
                    try {
                        await shop.set(shopId, shopData)
                    } catch (_) {}
                }))
            }
        }
        if (type === 'shipping') {
            const allShippingData = await shipping.getByCondition([{
                field: 'taxId',
                type: '==',
                value: taxId
            }])
            if (allShippingData) {
                await Promise.all(allShippingData.map(async shippingData => {
                    const { shippingId } = shippingData
                    shippingData.taxId = ''
                    try {
                        await shop.set(shippingId, shippingData)
                    } catch (_) {}
                }))
            }
        }
        if (type === 'product') {
            const productTypesData = await productType.getByCondition([{
                field: 'taxId',
                type: '==',
                value: taxId
            }])
            if (productTypesData) {
                await Promise.all(productTypesData.map(async productTypeData => {
                    const { productTypeId } = productTypeData
                    productTypeData.taxId = ''
                    try {
                        await shop.set(productTypeId, productTypeData)
                    } catch (_) {}
                }))
            }
        }
        await tax.remove(taxId)
        return successDeleted(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
