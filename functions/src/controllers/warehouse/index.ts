import { Request, Response } from 'express'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated } from '../../responseHandler/successHandler'
import { ShopType } from '../../models/shop/schema'
import { WarehouseType } from '../../models/warehouse/schema'
import * as warehouse from '../../models/warehouse'
import * as inventory from '../../models/inventory'

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
        await warehouse.add(data)
        return successCreated(res)
    } catch (err) {
        console.error(err)
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
        console.error(err)
        return serverError(res, err)
    }
}

export async function remove(req: Request, res: Response) {
    try {
        const { id: warehouseId } = req.params
        await warehouse.get(warehouseId)
        const inventoryData = await inventory.getByCondition([{
            field: 'warehouseId',
            type: '==',
            value: warehouseId,
            parentFields: ['warehouse']
        }])
        if (inventoryData) {
            await Promise.all(inventoryData.map(async invData => {
                try {
                    const { variantId } = invData
                    await inventory.remove(variantId)
                } catch (err) {
                    console.error(err)
                }
            }))
        }
        await warehouse.remove(warehouseId)
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
