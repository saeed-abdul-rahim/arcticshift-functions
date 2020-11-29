import { variantsRef } from '../../config/db'
import { VariantInterface, VariantType, Variant, VariantCondition } from './schema'
import { setCondition } from '../common'

export async function get(variantId: string, transaction?: FirebaseFirestore.Transaction): Promise<VariantInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(variantId))
        } else {
            doc = await getRef(variantId).get()
        }
        if (!doc.exists) throw new Error('Variant not found')
        const data = <VariantInterface>doc.data()
        data.variantId = doc.id
        return new Variant(data).get()
    } catch (err) {
        throw err
    }
}

export async function getOneByCondition(conditions: VariantCondition[]): Promise<VariantInterface | null> {
    try {
        const ref = setCondition(variantsRef, conditions)
        const doc = await ref.get()
        if (doc.empty) return null
        const user = doc.docs[0].data()
        const data = <VariantInterface>user
        data.variantId = doc.docs[0].id
        return new Variant(data).get()
    } catch (err) {
        throw err;
    }
}

export async function getByCondition(conditions: VariantCondition[]): Promise<VariantInterface[] | null> {
    try {
        const ref = setCondition(variantsRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(variant: VariantType): Promise<string> {
    try {
        const id = variantsRef.doc().id
        variant.variantId = id
        await set(id, variant)
        return id
    } catch (err) {
        throw err
    }
}

export async function set(variantId: string, variant: VariantType): Promise<boolean> {
    try {
        const dataToInsert = new Variant(variant).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(variantId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(variantId: string, variant: VariantType): Promise<boolean> {
    try {
        await getRef(variantId).update({ ...variant, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(variantId: string): Promise<boolean> {
    try {
        await getRef(variantId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return variantsRef.doc(id)
}


export function batchSet(batch: FirebaseFirestore.WriteBatch, variantId: string, variant: VariantType) {
    try {
        const dataToInsert = new Variant(variant).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(variantId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, variantId: string, variant: VariantType) {
    try {
        return batch.update(getRef(variantId), { ...variant, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, variantId: string) {
    try {
        return batch.delete(getRef(variantId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, variantId: string, variant: VariantType) {
    try {
        const dataToInsert = new Variant(variant).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(variantId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, variantId: string, variant: VariantType) {
    try {
        return transaction.update(getRef(variantId), { ...variant, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, variantId: string) {
    try {
        return transaction.delete(getRef(variantId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as VariantInterface
        data.variantId = d.id
        data = new Variant(data).get()
        return data
    })
}
