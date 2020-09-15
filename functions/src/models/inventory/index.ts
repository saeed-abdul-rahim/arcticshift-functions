import { inventoryRef } from '../../config/db'
import { InventoryInterface, InventoryType, Inventory } from './schema'

export async function get(productId: string): Promise<InventoryInterface> {
    try {
        const doc = await inventoryRef.doc(productId).get()
        if (!doc.exists) throw new Error('Inventory not found')
        const data = <InventoryInterface>doc.data()
        return new Inventory(data).get()
    } catch (err) {
        throw err
    }
}

export async function set(productId: string, inventory: InventoryType): Promise<boolean> {
    try {
        const dataToInsert = new Inventory(inventory).get()
        dataToInsert.updatedAt = Date.now()
        await inventoryRef.doc(productId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(productId: string, inventory: InventoryType): Promise<boolean> {
    try {
        await inventoryRef.doc(productId).update({ ...inventory, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(productId: string): Promise<boolean> {
    try {
        await inventoryRef.doc(productId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return inventoryRef.doc(id)
    } else {
        return inventoryRef
    }
}
