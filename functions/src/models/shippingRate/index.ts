import { shippingRatesRef } from '../../config/db'
import { setCondition } from '../common'
import { ShippingRateInterface, ShippingRateType, ShippingRate, ShippingRateCondition } from './schema'

export async function get(shippingRateId: string, transaction?: FirebaseFirestore.Transaction): Promise<ShippingRateInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(shippingRateId))
        } else {
            doc = await getRef(shippingRateId).get()
        }
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
        await getRef(shippingRateId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(shippingRateId: string, shipping: ShippingRateType): Promise<boolean> {
    try {
        await getRef(shippingRateId).update({ ...shipping, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(shippingRateId: string): Promise<boolean> {
    try {
        await getRef(shippingRateId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return shippingRatesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, shippingRateId: string, shippingRate: ShippingRateType) {
    try {
        const dataToInsert = new ShippingRate(shippingRate).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(shippingRateId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, shippingRateId: string, shippingRate: ShippingRateType) {
    try {
        return batch.update(getRef(shippingRateId), { ...shippingRate, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, shippingRateId: string) {
    try {
        return batch.delete(getRef(shippingRateId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, shippingRateId: string, shippingRate: ShippingRateType) {
    try {
        const dataToInsert = new ShippingRate(shippingRate).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(shippingRateId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, shippingRateId: string, shippingRate: ShippingRateType) {
    try {
        return transaction.update(getRef(shippingRateId), { ...shippingRate, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, shippingRateId: string) {
    try {
        return transaction.delete(getRef(shippingRateId))
    } catch (err) {
        throw err
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
