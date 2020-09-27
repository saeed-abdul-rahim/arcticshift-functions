import { saleDiscountsRef } from '../../config/db'
import { decrementSaleDiscount, incrementSaleDiscount } from '../analytics/saleDiscount'
import { SaleDiscountInterface, SaleDiscountType, SaleDiscount } from './schema'

export async function get(saleDiscountId: string): Promise<SaleDiscountInterface> {
    try {
        const doc = await saleDiscountsRef.doc(saleDiscountId).get()
        if (!doc.exists) throw new Error('SaleDiscount not found')
        const data = <SaleDiscountInterface>doc.data()
        data.saleDiscountId = doc.id
        return new SaleDiscount(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(saleDiscount: SaleDiscountType): Promise<string> {
    try {
        const id = saleDiscountsRef.doc().id
        saleDiscount.saleDiscountId = id
        await set(id, saleDiscount)
        await incrementSaleDiscount()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(saleDiscountId: string, saleDiscount: SaleDiscountType): Promise<boolean> {
    try {
        const dataToInsert = new SaleDiscount(saleDiscount).get()
        dataToInsert.updatedAt = Date.now()
        await saleDiscountsRef.doc(saleDiscountId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(saleDiscountId: string, saleDiscount: SaleDiscountType): Promise<boolean> {
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
        await decrementSaleDiscount()
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
