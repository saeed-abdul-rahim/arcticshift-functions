import { taxesRef } from '../../config/db'
import { decrementTax, incrementTax } from '../analytics/tax'
import { TaxInterface, TaxType, Tax, TaxObjectType } from './schema'

export async function get(taxId: string): Promise<TaxInterface> {
    try {
        const doc = await taxesRef.doc(taxId).get()
        if (!doc.exists) throw new Error('Tax not found')
        const data = <TaxInterface>doc.data()
        data.taxId = doc.id
        return new Tax(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(tax: TaxType): Promise<string> {
    try {
        const id = taxesRef.doc().id
        tax.taxId = id
        await set(id, tax)
        await incrementTax()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(taxId: string, tax: TaxType): Promise<boolean> {
    try {
        const dataToInsert = new Tax(tax).get()
        dataToInsert.updatedAt = Date.now()
        await taxesRef.doc(taxId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(taxId: string, tax: TaxType): Promise<boolean> {
    try {
        await taxesRef.doc(taxId).update({ ...tax, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(taxId: string): Promise<boolean> {
    try {
        await taxesRef.doc(taxId).delete()
        await decrementTax()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return taxesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, taxId: string, order: TaxType) {
    try {
        const dataToInsert = new Tax(order).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(taxId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, taxId: string, order: TaxType) {
    try {
        return batch.update(getRef(taxId), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, taxId: string) {
    try {
        return batch.delete(getRef(taxId))
    } catch (err) {
        throw err
    }
}

export const taxTypes: TaxObjectType[] = [ 'shop', 'shipping', 'product' ]
