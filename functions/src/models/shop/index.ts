import { shopsRef } from '../../config/db'
import { ShopInterface, ShopType, Shop } from './schema'

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
