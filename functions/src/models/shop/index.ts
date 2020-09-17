import { shopsRef } from '../../config/db'
import { setCondition } from '../common'
import { ShopInterface, ShopType, Shop, ShopCondition } from './schema'

export async function get(shopId: string): Promise<ShopInterface> {
    try {
        const doc = await shopsRef.doc(shopId).get()
        if (!doc.exists) throw new Error('Shop not found')
        const data = <ShopInterface>doc.data()
        data.shopId = doc.id
        return new Shop(data).get()
    } catch (err) {
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
        throw err;
    }
}

export async function set(shopId: string, shop: ShopType): Promise<boolean> {
    try {
        const dataToInsert = new Shop(shop).get()
        dataToInsert.updatedAt = Date.now()
        await shopsRef.doc(shopId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(shop: ShopType): Promise<boolean> {
    try {
        const { shopId } = shop
        await shopsRef.doc(shopId).update({ ...shop, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return shopsRef.doc(id)
    } else {
        return shopsRef
    }
}
