import { shippingsRef } from '../../config/db'
import { decrementShipping, incrementShipping } from '../analytics/shipping'
import { setCondition } from '../common'
import { ShippingInterface, ShippingType, Shipping, ShippingCondition } from './schema'

export async function get(shippingId: string, transaction?: FirebaseFirestore.Transaction): Promise<ShippingInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(shippingId))
        } else {
            doc = await getRef(shippingId).get()
        }
        if (!doc.exists) throw new Error('Shipping not found')
        const data = <ShippingInterface>doc.data()
        data.shippingId = doc.id
        return new Shipping(data).get()
    } catch (err) {
        throw err
    }
}

export async function getOneByCondition(conditions: ShippingCondition[]): Promise<ShippingInterface | null> {
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

export async function getByCondition(conditions: ShippingCondition[]): Promise<ShippingInterface[] | null> {
    try {
        const ref = setCondition(shippingsRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(shipping: ShippingType): Promise<string> {
    try {
        const id = shippingsRef.doc().id
        shipping.shippingId = id
        await set(id, shipping)
        await incrementShipping()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(shippingId: string, shipping: ShippingType): Promise<boolean> {
    try {
        const dataToInsert = new Shipping(shipping).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(shippingId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(shippingId: string, shipping: ShippingType): Promise<boolean> {
    try {
        await getRef(shippingId).update({ ...shipping, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(shippingId: string): Promise<boolean> {
    try {
        await getRef(shippingId).delete()
        await decrementShipping()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return shippingsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, shippingId: string, shipping: ShippingType) {
    try {
        const dataToInsert = new Shipping(shipping).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(shippingId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, shippingId: string, shipping: ShippingType) {
    try {
        return batch.update(getRef(shippingId), { ...shipping, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, shippingId: string) {
    try {
        return batch.delete(getRef(shippingId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, shippingId: string, shipping: ShippingType) {
    try {
        const dataToInsert = new Shipping(shipping).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(shippingId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, shippingId: string, shipping: ShippingType) {
    try {
        return transaction.update(getRef(shippingId), { ...shipping, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, shippingId: string) {
    try {
        return transaction.delete(getRef(shippingId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as ShippingInterface
        data.shippingId = d.id
        data = new Shipping(data).get()
        return data
    })
}
