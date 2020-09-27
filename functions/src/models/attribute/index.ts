import { attributesRef } from '../../config/db'
import { decrementAttribute, incrementAttribute } from '../analytics/attribute'
import { AttributeInterface, AttributeType, Attribute } from './schema'

export async function get(attributeId: string): Promise<AttributeInterface> {
    try {
        const doc = await attributesRef.doc(attributeId).get()
        if (!doc.exists) throw new Error('Attribute not found')
        const data = <AttributeInterface>doc.data()
        data.attributeId = doc.id
        return new Attribute(data).get()
    } catch (err) {
        throw err
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
        await attributesRef.doc(attributeId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(attributeId: string, attribute: AttributeType): Promise<boolean> {
    try {
        await attributesRef.doc(attributeId).update({ ...attribute, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(attributeId: string): Promise<boolean> {
    try {
        await attributesRef.doc(attributeId).delete()
        await decrementAttribute()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return attributesRef.doc(id)
    } else {
        return attributesRef
    }
}
