import { variantsRef } from '../../config/db'
import { VariantInterface, VariantType, Variant, VariantCondition } from './schema'
import { setCondition } from '../common'

export async function get(variantId: string): Promise<VariantInterface> {
    try {
        const doc = await variantsRef.doc(variantId).get()
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
        const doc = await ref.get()
        if (doc.empty) return null
        return doc.docs.map(d => {
            let data = d.data() as VariantInterface
            data.variantId = d.id
            data = new Variant(data).get()
            return data
        })
    } catch (err) {
        throw err;
    }
}

export async function add(variant: VariantType): Promise<string> {
    try {
        const dataToInsert = new Variant(variant).get()
        const data = await variantsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(variantId: string, variant: VariantType): Promise<boolean> {
    try {
        const dataToInsert = new Variant(variant).get()
        dataToInsert.updatedAt = Date.now()
        await variantsRef.doc(variantId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(variantId: string, variant: VariantType): Promise<boolean> {
    try {
        await variantsRef.doc(variantId).update({ ...variant, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(variantId: string): Promise<boolean> {
    try {
        await variantsRef.doc(variantId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return variantsRef.doc(id)
    } else {
        return variantsRef
    }
}
