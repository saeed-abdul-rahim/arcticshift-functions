import { MODELS } from '../../config/constants'
import { taxesRef } from '../../config/db'
import { callerName } from '../../utils/functionUtils'
import { decrementTax, incrementTax } from '../analytics/tax'
import { TaxInterface, TaxType, Tax, TaxObjectType } from './schema'

const functionPath = `${MODELS}/tax`

export async function get(taxId: string, transaction?: FirebaseFirestore.Transaction): Promise<TaxInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(taxId))
        } else {
            doc = await getRef(taxId).get()
        }
        if (!doc.exists) throw new Error('Tax not found')
        const data = <TaxInterface>doc.data()
        data.taxId = doc.id
        return new Tax(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function set(taxId: string, tax: TaxType): Promise<boolean> {
    try {
        const dataToInsert = new Tax(tax).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(taxId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(taxId: string, tax: TaxType): Promise<boolean> {
    try {
        await getRef(taxId).update({ ...tax, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function remove(taxId: string): Promise<boolean> {
    try {
        await getRef(taxId).delete()
        await decrementTax()
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function getRef(id: string) {
    return taxesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, taxId: string, tax: TaxType) {
    try {
        const dataToInsert = new Tax(tax).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(taxId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, taxId: string, tax: TaxType) {
    try {
        return batch.update(getRef(taxId), { ...tax, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, taxId: string) {
    try {
        return batch.delete(getRef(taxId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, taxId: string, tax: TaxType) {
    try {
        const dataToInsert = new Tax(tax).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(taxId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, taxId: string, tax: TaxType) {
    try {
        return transaction.update(getRef(taxId), { ...tax, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, taxId: string) {
    try {
        return transaction.delete(getRef(taxId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export const taxTypes: TaxObjectType[] = [ 'shop', 'shipping', 'product' ]
