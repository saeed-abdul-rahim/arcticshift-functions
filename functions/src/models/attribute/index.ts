import { attributesRef } from '../../config/db'
import { decrementAttribute, incrementAttribute } from '../analytics/attribute'
import { setCondition } from '../common'
import { AttributeInterface, AttributeType, Attribute, AttributeCondition } from './schema'

export async function get(attributeId: string, transaction?: FirebaseFirestore.Transaction): Promise<AttributeInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(attributeId))
        } else {
            doc = await getRef(attributeId).get()
        }
        if (!doc.exists) throw new Error('Attribute not found')
        const data = <AttributeInterface>doc.data()
        data.attributeId = doc.id
        return new Attribute(data).get()
    } catch (err) {
        throw err
    }
}

export async function getByCondition(conditions: AttributeCondition[]): Promise<AttributeInterface[] | null> {
    try {
        const ref = setCondition(attributesRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(attribute: AttributeType): Promise<string> {
    try {
        const id = attributesRef.doc().id
        attribute.attributeId = id
        await set(id, attribute)
        await incrementAttribute()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(attributeId: string, attribute: AttributeType): Promise<boolean> {
    try {
        const dataToInsert = new Attribute(attribute).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(attributeId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(attributeId: string, attribute: AttributeType): Promise<boolean> {
    try {
        await getRef(attributeId).update({ ...attribute, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(attributeId: string): Promise<boolean> {
    try {
        await getRef(attributeId).delete()
        await decrementAttribute()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return attributesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, attributeId: string, attribute: AttributeType) {
    try {
        const dataToInsert = new Attribute(attribute).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(attributeId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, attributeId: string, attribute: AttributeType) {
    try {
        return batch.update(getRef(attributeId), { ...attribute, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, attributeId: string) {
    try {
        return batch.delete(getRef(attributeId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, attributeId: string, attribute: AttributeType) {
    try {
        const dataToInsert = new Attribute(attribute).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(attributeId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, attributeId: string, attribute: AttributeType) {
    try {
        return transaction.update(getRef(attributeId), { ...attribute, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, attributeId: string) {
    try {
        return transaction.delete(getRef(attributeId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as AttributeInterface
        data.attributeId = d.id
        data = new Attribute(data).get()
        return data
    })
}
