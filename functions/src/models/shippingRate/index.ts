import { shippingRatesRef } from '../../config/db'
import { setCondition } from '../common'
import { ShippingRateInterface, ShippingRateType, ShippingRate, ShippingRateCondition } from './schema'

export async function get(shippingRateId: string): Promise<ShippingRateInterface> {
    try {
        const doc = await shippingRatesRef.doc(shippingRateId).get()
        if (!doc.exists) throw new Error('ShippingRate not found')
        const data = <ShippingRateInterface>doc.data()
        data.shippingRateId = doc.id
        return new ShippingRate(data).get()
    } catch (err) {
        throw err
    }
}

export async function getOneByCondition(conditions: ShippingRateCondition[]): Promise<ShippingRateInterface | null> {
    try {
        const data = await getByCondition(conditions)
        if (!data) {
            return data
        } else {
            return data[0]
        }
    } catch (err) {
        throw err;
    }
}

export async function getByCondition(conditions: ShippingRateCondition[]): Promise<ShippingRateInterface[] | null> {
    try {
        const ref = setCondition(shippingRatesRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(shipping: ShippingRateType): Promise<string> {
    try {
        const id = shippingRatesRef.doc().id
        shipping.shippingRateId = id
        await set(id, shipping)
        return id
    } catch (err) {
        throw err
    }
}

export async function set(shippingRateId: string, shipping: ShippingRateType): Promise<boolean> {
    try {
        const dataToInsert = new ShippingRate(shipping).get()
        dataToInsert.updatedAt = Date.now()
        await shippingRatesRef.doc(shippingRateId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(shippingRateId: string, shipping: ShippingRateType): Promise<boolean> {
    try {
        await shippingRatesRef.doc(shippingRateId).update({ ...shipping, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(shippingRateId: string): Promise<boolean> {
    try {
        await shippingRatesRef.doc(shippingRateId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return shippingRatesRef.doc(id)
    } else {
        return shippingRatesRef
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as ShippingRateInterface
        data.shippingRateId = d.id
        data = new ShippingRate(data).get()
        return data
    })
}
