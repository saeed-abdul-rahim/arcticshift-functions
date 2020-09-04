import { productsRef } from '../../config/db'
import { ProductInterface, ProductType, Product } from './schema'

export async function get(productId: string): Promise<ProductInterface> {
    try {
        const doc = await productsRef.doc(productId).get()
        if (!doc.exists) throw new Error('Product not found')
        const data = <ProductInterface>doc.data()
        data.productId = doc.id
        return new Product(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(product: ProductType): Promise<string> {
    try {
        const dataToInsert = new Product(product).get()
        const data = await productsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(productId: string, product: ProductType): Promise<boolean> {
    try {
        const dataToInsert = new Product(product).get()
        dataToInsert.updatedAt = Date.now()
        await productsRef.doc(productId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(productId: string, product: ProductType): Promise<boolean> {
    try {
        await productsRef.doc(productId).update({ ...product, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(productId: string): Promise<boolean> {
    try {
        await productsRef.doc(productId).delete()
        return true
    } catch (err) {
        throw err
    }
}
