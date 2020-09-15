import { warehouseRef } from '../../config/db'
import { WarehouseInterface, WarehouseType, Warehouse } from './schema'

export async function get(warehouseId: string): Promise<WarehouseInterface> {
    try {
        const doc = await warehouseRef.doc(warehouseId).get()
        if (!doc.exists) throw new Error('Warehouse not found')
        const data = <WarehouseInterface>doc.data()
        data.warehouseId = doc.id
        return new Warehouse(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(warehouse: WarehouseType): Promise<string> {
    try {
        const dataToInsert = new Warehouse(warehouse).get()
        const data = await warehouseRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(warehouseId: string, warehouse: WarehouseType): Promise<boolean> {
    try {
        const dataToInsert = new Warehouse(warehouse).get()
        dataToInsert.updatedAt = Date.now()
        await warehouseRef.doc(warehouseId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(warehouseId: string, warehouse: WarehouseType): Promise<boolean> {
    try {
        await warehouseRef.doc(warehouseId).update({ ...warehouse, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(warehouseId: string): Promise<boolean> {
    try {
        await warehouseRef.doc(warehouseId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return warehouseRef.doc(id)
    } else {
        return warehouseRef
    }
}
