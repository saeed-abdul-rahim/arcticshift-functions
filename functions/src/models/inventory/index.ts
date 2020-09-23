import { inventoryRef } from '../../config/db'
import { setCondition } from '../common'
import { InventoryInterface, InventoryType, Inventory, InventoryCondition } from './schema'

export async function get(variantId: string): Promise<InventoryInterface> {
    try {
        const doc = await inventoryRef.doc(variantId).get()
        if (!doc.exists) throw new Error('Inventory not found')
        const data = <InventoryInterface>doc.data()
        data.variantId = doc.id
        return new Inventory(data).get()
    } catch (err) {
        throw err
    }
}

export async function getByCondition(conditions: InventoryCondition[]): Promise<InventoryInterface[] | null> {
    try {
        const ref = setCondition(inventoryRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function set(variantId: string, inventory: InventoryType): Promise<boolean> {
    try {
        const dataToInsert = new Inventory(inventory).get()
        dataToInsert.updatedAt = Date.now()
        await inventoryRef.doc(variantId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(variantId: string, inventory: InventoryType): Promise<boolean> {
    try {
        await inventoryRef.doc(variantId).update({ ...inventory, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(variantId: string): Promise<boolean> {
    try {
        await inventoryRef.doc(variantId).delete()
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

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as InventoryInterface
        data.variantId = d.id
        data = new Inventory(data).get()
        return data
    })
}
