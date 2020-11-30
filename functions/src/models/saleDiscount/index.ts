import { MODELS } from '../../config/constants'
import { saleDiscountsRef } from '../../config/db'
import { callerName } from '../../utils/functionUtils'
import { decrementSaleDiscount, incrementSaleDiscount } from '../analytics/saleDiscount'
import { setCondition } from '../common'
import { SaleDiscountInterface, SaleDiscountType, SaleDiscount, SaleDiscountCondition } from './schema'

const functionPath = `${MODELS}/saleDiscount`

export async function get(saleDiscountId: string, transaction?: FirebaseFirestore.Transaction): Promise<SaleDiscountInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(saleDiscountId))
        } else {
            doc = await getRef(saleDiscountId).get()
        }
        if (!doc.exists) throw new Error('SaleDiscount not found')
        const data = <SaleDiscountInterface>doc.data()
        data.saleDiscountId = doc.id
        return new SaleDiscount(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export async function getByCondition(conditions: SaleDiscountCondition[]): Promise<SaleDiscountInterface[] | null> {
    try {
        const ref = setCondition(saleDiscountsRef, conditions)
        return await getAll(ref)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function set(saleDiscountId: string, saleDiscount: SaleDiscountType): Promise<boolean> {
    try {
        const dataToInsert = new SaleDiscount(saleDiscount).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(saleDiscountId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(saleDiscountId: string, saleDiscount: SaleDiscountType): Promise<boolean> {
    try {
        await getRef(saleDiscountId).update({ ...saleDiscount, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function remove(saleDiscountId: string): Promise<boolean> {
    try {
        await getRef(saleDiscountId).delete()
        await decrementSaleDiscount()
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function getRef(id: string) {
    return saleDiscountsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, saleDiscountId: string, saleDiscount: SaleDiscountType) {
    try {
        const dataToInsert = new SaleDiscount(saleDiscount).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(saleDiscountId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, saleDiscountId: string, saleDiscount: SaleDiscountType) {
    try {
        return batch.update(getRef(saleDiscountId), { ...saleDiscount, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, saleDiscountId: string) {
    try {
        return batch.delete(getRef(saleDiscountId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, saleDiscountId: string, saleDiscount: SaleDiscountType) {
    try {
        const dataToInsert = new SaleDiscount(saleDiscount).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(saleDiscountId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, saleDiscountId: string, saleDiscount: SaleDiscountType) {
    try {
        return transaction.update(getRef(saleDiscountId), { ...saleDiscount, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, saleDiscountId: string) {
    try {
        return transaction.delete(getRef(saleDiscountId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, transaction?: FirebaseFirestore.Transaction) {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(ref)
        } else {
            doc = await ref.get()
        }
        if (doc.empty) return null
        return doc.docs.map(d => {
            let data = d.data() as SaleDiscountInterface
            data.saleDiscountId = d.id
            data = new SaleDiscount(data).get()
            return data
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}
