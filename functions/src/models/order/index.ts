import { ordersRef } from '../../config/db'
import { decrementOrder, incrementOrder } from '../analytics/order'
import { OrderInterface, OrderType, Order } from './schema'

export async function get(orderId: string): Promise<OrderInterface> {
    try {
        const doc = await ordersRef.doc(orderId).get()
        if (!doc.exists) throw new Error('Order not found')
        const data = <OrderInterface>doc.data()
        data.orderId = doc.id
        return new Order(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(order: OrderType): Promise<string> {
    try {
        const id = ordersRef.doc().id
        order.orderId = id
        await set(id, order)
        await incrementOrder()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(orderId: string, order: OrderType): Promise<boolean> {
    try {
        const dataToInsert = new Order(order).get()
        dataToInsert.updatedAt = Date.now()
        await ordersRef.doc(orderId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(orderId: string, order: OrderType): Promise<boolean> {
    try {
        await ordersRef.doc(orderId).update({ ...order, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(orderId: string): Promise<boolean> {
    try {
        await ordersRef.doc(orderId).delete()
        await decrementOrder()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return ordersRef.doc(id)
    } else {
        return ordersRef
    }
}
