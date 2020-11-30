import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successDeleted, successResponse, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { WarehouseType } from '../../models/warehouse/schema'
import * as warehouse from '../../models/warehouse'
import * as variant from '../../models/variant'
import { db } from '../../config/db'
import { CONTROLLERS } from '../../config/constants'
import { callerName } from '../../utils/functionUtils'

const functionPath = `${CONTROLLERS}/warehouse/index`

export async function create(req: Request, res: Response) {
    try {
        const { shopData }: { [shopData: string]: ShopType } = res.locals
        let { data }: { data: WarehouseType } = req.body
        const { name } = data
        if (!name) {
            return missingParam(res, 'Name')
        }
        const { shopId } = shopData
        data = {
            ...data,
            shopId
        }
        const id = await warehouse.add(data)
        return successResponse(res, { id })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    try {
        let { data }: { data: WarehouseType } = req.body
        const { warehouseId } = data
        if (!warehouseId) {
            return missingParam(res, 'ID')
        }
        const warehouseData = await warehouse.get(warehouseId)
        data = {
            ...warehouseData,
            ...data
        }
        await warehouse.set(warehouseId, data)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: warehouseId } = req.params
        await warehouse.get(warehouseId)
        const batch = db.batch()
        const variantsData = await variant.getByCondition([
            { field: warehouseId, type: '>=', value: -99999, parentFields: ['warehouseQuantity'] }
        ])
        if (variantsData) {
            variantsData.forEach(variantData => {
                if (variantData.warehouseQuantity && variantData.warehouseQuantity[warehouseId]) {
                    const { variantId } = variantData
                    delete variantData.warehouseQuantity[warehouseId]
                    variant.batchSet(batch, variantId, variantData)
                }
            })
        }
        warehouse.batchDelete(batch, warehouseId)
        await batch.commit()
        return successDeleted(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
