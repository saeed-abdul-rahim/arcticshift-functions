import { saleDiscountsRef } from '../../config/db'
import { decrementSaleDiscount, incrementSaleDiscount } from '../analytics/saleDiscount'
import { setCondition } from '../common'
import { SaleDiscountInterface, SaleDiscountType, SaleDiscount, SaleDiscountCondition } from './schema'

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

export async function getOneByCondition(conditions: SaleDiscountCondition[]): Promise<SaleDiscountInterface | null> {
    try {
        const ref = setCondition(saleDiscountsRef, conditions)
        const doc = await ref.get()
        if (doc.empty) return null
        const user = doc.docs[0].data()
        const data = <SaleDiscountInterface>user
        data.saleDiscountId = doc.docs[0].id
        return new SaleDiscount(data).get()
    } catch (err) {
        throw err;
    }
}

export async function getByCondition(conditions: SaleDiscountCondition[]): Promise<SaleDiscountInterface[] | null> {
    try {
        const ref = setCondition(saleDiscountsRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
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

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as SaleDiscountInterface
        data.saleDiscountId = d.id
        data = new SaleDiscount(data).get()
        return data
    })
}
