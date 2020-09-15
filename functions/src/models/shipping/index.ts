import { shippingsRef } from '../../config/db'
import { ShippingInterface, ShippingType, Shipping } from './schema'

export async function get(shippingId: string): Promise<ShippingInterface> {
    try {
        const doc = await shippingsRef.doc(shippingId).get()
        if (!doc.exists) throw new Error('Shipping not found')
        const data = <ShippingInterface>doc.data()
        data.shippingId = doc.id
        return new Shipping(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(shipping: ShippingType): Promise<string> {
    try {
        const dataToInsert = new Shipping(shipping).get()
        const data = await shippingsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(shippingId: string, shipping: ShippingType): Promise<boolean> {
    try {
        const dataToInsert = new Shipping(shipping).get()
        dataToInsert.updatedAt = Date.now()
        await shippingsRef.doc(shippingId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(shippingId: string, shipping: ShippingType): Promise<boolean> {
    try {
        await shippingsRef.doc(shippingId).update({ ...shipping, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(shippingId: string): Promise<boolean> {
    try {
        await shippingsRef.doc(shippingId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return shippingsRef.doc(id)
    } else {
        return shippingsRef
    }
}
