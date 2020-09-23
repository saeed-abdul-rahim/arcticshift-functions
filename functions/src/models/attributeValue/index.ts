import { attributeValuesRef } from '../../config/db'
import { AttributeValueInterface, AttributeValueType, AttributeValue } from './schema'

export async function get(attributeValueId: string): Promise<AttributeValueInterface> {
    try {
        const doc = await attributeValuesRef.doc(attributeValueId).get()
        if (!doc.exists) throw new Error('AttributeValue not found')
        const data = <AttributeValueInterface>doc.data()
        data.attributeValueId = doc.id
        return new AttributeValue(data).get()
    } catch (err) {
        throw err
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
        await attributeValuesRef.doc(attributeValueId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(attributeValueId: string, attributeValue: AttributeValueType): Promise<boolean> {
    try {
        await attributeValuesRef.doc(attributeValueId).update({ ...attributeValue, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(attributeValueId: string): Promise<boolean> {
    try {
        await attributeValuesRef.doc(attributeValueId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return attributeValuesRef.doc(id)
    } else {
        return attributeValuesRef
    }
}
