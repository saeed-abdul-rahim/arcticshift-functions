import { warehouseRef } from '../../config/db'
import { decrementWarehouse, incrementWarehouse } from '../analytics/warehouse'
import { setCondition } from '../common'
import { WarehouseInterface, WarehouseType, Warehouse, WarehouseCondition } from './schema'

export async function get(warehouseId: string, transaction?: FirebaseFirestore.Transaction): Promise<WarehouseInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(warehouseId))
        } else {
            doc = await getRef(warehouseId).get()
        }
        if (!doc.exists) throw new Error('Warehouse not found')
        const data = <WarehouseInterface>doc.data()
        data.warehouseId = doc.id
        return new Warehouse(data).get()
    } catch (err) {
        throw err
    }
}

export async function getByCondition(conditions: WarehouseCondition[]): Promise<WarehouseInterface[] | null> {
    try {
        const ref = setCondition(warehouseRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(warehouse: WarehouseType): Promise<string> {
    try {
        const id = warehouseRef.doc().id
        warehouse.warehouseId = id
        await set(id, warehouse)
        await incrementWarehouse()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(warehouseId: string, warehouse: WarehouseType): Promise<boolean> {
    try {
        const dataToInsert = new Warehouse(warehouse).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(warehouseId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(warehouseId: string, warehouse: WarehouseType): Promise<boolean> {
    try {
        await getRef(warehouseId).update({ ...warehouse, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(warehouseId: string): Promise<boolean> {
    try {
        await getRef(warehouseId).delete()
        await decrementWarehouse()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return warehouseRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, warehouseId: string, warehouse: WarehouseType) {
    try {
        const dataToInsert = new Warehouse(warehouse).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(warehouseId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, warehouseId: string, warehouse: WarehouseType) {
    try {
        return batch.update(getRef(warehouseId), { ...warehouse, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, warehouseId: string) {
    try {
        return batch.delete(getRef(warehouseId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, warehouseId: string, warehouse: WarehouseType) {
    try {
        const dataToInsert = new Warehouse(warehouse).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(warehouseId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, warehouseId: string, warehouse: WarehouseType) {
    try {
        return transaction.update(getRef(warehouseId), { ...warehouse, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, warehouseId: string) {
    try {
        return transaction.delete(getRef(warehouseId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as WarehouseInterface
        data.warehouseId = d.id
        data = new Warehouse(data).get()
        return data
    })
}
