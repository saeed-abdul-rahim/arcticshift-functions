import { taxesRef } from '../../config/db'
import { TaxInterface, TaxType, Tax } from './schema'

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
        const dataToInsert = new Tax(tax).get()
        const data = await taxesRef.add(dataToInsert)
        return data.id
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
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return taxesRef.doc(id)
    } else {
        return taxesRef
    }
}
