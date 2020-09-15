import { saleDiscountsRef } from '../../config/db'
import { SalesDiscountInterface, SalesDiscountType, SalesDiscount } from './schema'

export async function get(saleDiscountId: string): Promise<SalesDiscountInterface> {
    try {
        const doc = await saleDiscountsRef.doc(saleDiscountId).get()
        if (!doc.exists) throw new Error('SalesDiscount not found')
        const data = <SalesDiscountInterface>doc.data()
        data.saleDiscountId = doc.id
        return new SalesDiscount(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(saleDiscount: SalesDiscountType): Promise<string> {
    try {
        const dataToInsert = new SalesDiscount(saleDiscount).get()
        const data = await saleDiscountsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(saleDiscountId: string, saleDiscount: SalesDiscountType): Promise<boolean> {
    try {
        const dataToInsert = new SalesDiscount(saleDiscount).get()
        dataToInsert.updatedAt = Date.now()
        await saleDiscountsRef.doc(saleDiscountId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(saleDiscountId: string, saleDiscount: SalesDiscountType): Promise<boolean> {
    try {
        await saleDiscountsRef.doc(saleDiscountId).update({ ...saleDiscount, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(saleDiscountId: string): Promise<boolean> {
    try {
        await saleDiscountsRef.doc(saleDiscountId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return saleDiscountsRef.doc(id)
    } else {
        return saleDiscountsRef
    }
}
