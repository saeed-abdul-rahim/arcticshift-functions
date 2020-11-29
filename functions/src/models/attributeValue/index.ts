import { attributeValuesRef } from '../../config/db'
import { setCondition } from '../common'
import { AttributeValueInterface, AttributeValueType, AttributeValue, AttributeValueCondition } from './schema'

export async function get(attributeValueId: string, transaction?: FirebaseFirestore.Transaction): Promise<AttributeValueInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(attributeValueId))
        } else {
            doc = await getRef(attributeValueId).get()
        }
        if (!doc.exists) throw new Error('AttributeValue not found')
        const data = <AttributeValueInterface>doc.data()
        data.attributeValueId = doc.id
        return new AttributeValue(data).get()
    } catch (err) {
        throw err
    }
}

export async function getByCondition(conditions: AttributeValueCondition[]): Promise<AttributeValueInterface[] | null> {
    try {
        const ref = setCondition(attributeValuesRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(attributeValue: AttributeValueType): Promise<string> {
    try {
        const id = attributeValuesRef.doc().id
        attributeValue.attributeValueId = id
        await set(id, attributeValue)
        return id
    } catch (err) {
        throw err
    }
}

export async function set(attributeValueId: string, attributeValue: AttributeValueType): Promise<boolean> {
    try {
        const dataToInsert = new AttributeValue(attributeValue).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(attributeValueId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(attributeValueId: string, attributeValue: AttributeValueType): Promise<boolean> {
    try {
        await getRef(attributeValueId).update({ ...attributeValue, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(attributeValueId: string): Promise<boolean> {
    try {
        await getRef(attributeValueId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return attributeValuesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, attributeId: string, attributeValue: AttributeValueType) {
    try {
        const dataToInsert = new AttributeValue(attributeValue).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(attributeId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, attributeId: string, attributeValue: AttributeValueType) {
    try {
        return batch.update(getRef(attributeId), { ...attributeValue, updatedAt: Date.now() })
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

export function transactionSet(transaction: FirebaseFirestore.Transaction, attributeValueId: string, attributeValue: AttributeValueType) {
    try {
        const dataToInsert = new AttributeValue(attributeValue).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(attributeValueId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, attributeValueId: string, attributeValue: AttributeValueType) {
    try {
        return transaction.update(getRef(attributeValueId), { ...attributeValue, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, attributeValueId: string) {
    try {
        return transaction.delete(getRef(attributeValueId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as AttributeValueInterface
        data.attributeValueId = d.id
        data = new AttributeValue(data).get()
        return data
    })
}
