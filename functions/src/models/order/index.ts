import { ordersRef, draftsRef } from '../../config/db'
import { decrementOrder, incrementOrder } from '../analytics/order'
import { setCondition } from '../common'
import { OrderInterface, OrderType, Order, OrderCondition, OrderOrderBy } from './schema'

export async function get(orderId: string, type: OrderDraft, transaction?: FirebaseFirestore.Transaction): Promise<OrderInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(orderId, type))
        } else {
            doc = await getRef(orderId, type).get()
        }
        if (!doc.exists) throw new Error('Order not found')
        const data = <OrderInterface>doc.data()
        data.orderId = doc.id
        return new Order(data).get()
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function getOneByCondition(type: OrderDraft, conditions: OrderCondition[], orderBy?: OrderOrderBy): Promise<OrderInterface | null> {
    try {
        const data = await getByCondition(type, conditions, orderBy, 1)
        if (!data) {
            return data
        }
        else {
            return data[0]
        }
    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function getByCondition(type: OrderDraft, conditions: OrderCondition[], orderBy?: OrderOrderBy, limit?: number): Promise<OrderInterface[] | null> {
    try {
        const ref = setCondition(getCollectionRef(type), conditions, orderBy, limit)
        return await getAll(ref)
    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function add(order: OrderType, type: OrderDraft): Promise<string> {
    try {
        const id = ordersRef.doc().id
        order.orderId = id
        await set(id, order, type)
        if (type === 'order') {
            await incrementOrder()
        }
        return id
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function set(orderId: string, order: OrderType, type: OrderDraft): Promise<boolean> {
    try {
        const dataToInsert = new Order(order).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(orderId, type).set(dataToInsert)
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function update(orderId: string, order: OrderType, type: OrderDraft): Promise<boolean> {
    try {
        await getRef(orderId, type).update({ ...order, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function remove(orderId: string, type: OrderDraft): Promise<boolean> {
    try {
        await getRef(orderId, type).delete()
        if (type === 'order') {
            await decrementOrder()
        }
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function getRef(id: string, type: OrderDraft) {
    return getCollectionRef(type).doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, orderId: string, order: OrderType, type: OrderDraft) {
    try {
        const dataToInsert = new Order(order).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(orderId, type), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, orderId: string, order: OrderType, type: OrderDraft) {
    try {
        return batch.update(getRef(orderId, type), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, orderId: string, type: OrderDraft) {
    try {
        return batch.delete(getRef(orderId, type))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, orderId: string, order: OrderType, type: OrderDraft) {
    try {
        const dataToInsert = new Order(order).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(orderId, type), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, orderId: string, order: OrderType, type: OrderDraft) {
    try {
        return transaction.update(getRef(orderId, type), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, orderId: string, type: OrderDraft) {
    try {
        return transaction.delete(getRef(orderId, type))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    try {
        const doc = await ref.get()
        if (doc.empty) return null
        return doc.docs.map(d => {
            let data = d.data() as OrderInterface
            data.orderId = d.id
            data = new Order(data).get()
            return data
        })
    } catch (err) {
        console.error(err)
        throw err
    }
}

function getCollectionRef(type: OrderDraft) {
    if (type === 'draft') {
        return draftsRef
    } else {
        return ordersRef
    }
}

type OrderDraft = 'draft' | 'order';
