import { MODELS } from '../../config/constants'
import { shopsRef } from '../../config/db'
import { callerName } from '../../utils/functionUtils'
import { setCondition } from '../common'
import { ShopInterface, ShopType, Shop, ShopCondition } from './schema'

const functionPath = `${MODELS}/shop`

export async function get(shopId: string, transaction?: FirebaseFirestore.Transaction): Promise<ShopInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(shopId))
        } else {
            doc = await getRef(shopId).get()
        }
        if (!doc.exists) throw new Error('Shop not found')
        const data = <ShopInterface>doc.data()
        data.shopId = doc.id
        return new Shop(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function getByCondition(conditions: ShopCondition[]): Promise<ShopInterface[] | null> {
    try {
        const ref = setCondition(shopsRef, conditions)
        const doc = await ref.get()
        if (doc.empty) return null
        return doc.docs.map(d => {
            let data = d.data() as ShopInterface
            data.shopId = d.id
            data = new Shop(data).get()
            return data
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export async function set(shopId: string, shop: ShopType): Promise<boolean> {
    try {
        const dataToInsert = new Shop(shop).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(shopId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(shop: ShopType): Promise<boolean> {
    try {
        const { shopId } = shop
        await getRef(shopId).update({ ...shop, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function getRef(id: string) {
    return shopsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, shopId: string, shop: ShopType) {
    try {
        const dataToInsert = new Shop(shop).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(shopId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, shopId: string, shop: ShopType) {
    try {
        return batch.update(getRef(shopId), { ...shop, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, shopId: string, shop: ShopType) {
    try {
        const dataToInsert = new Shop(shop).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(shopId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, shopId: string, shop: ShopType) {
    try {
        return transaction.update(getRef(shopId), { ...shop, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, shopId: string) {
    try {
        return transaction.delete(getRef(shopId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, shopId: string) {
    try {
        return batch.delete(getRef(shopId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}
