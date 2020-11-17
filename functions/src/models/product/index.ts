import { productsRef } from '../../config/db'
import { ProductInterface, ProductType, Product, ProductCondition } from './schema'
import { setCondition } from '../common'
import { decrementProduct, incrementProduct } from '../analytics/product'

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

export async function getOneByCondition(conditions: ProductCondition[]): Promise<ProductInterface | null> {
    try {
        const ref = setCondition(productsRef, conditions)
        const doc = await ref.get()
        if (doc.empty) return null
        const user = doc.docs[0].data()
        const data = <ProductInterface>user
        data.productId = doc.docs[0].id
        return new Product(data).get()
    } catch (err) {
        throw err;
    }
}

export async function getByCondition(conditions: ProductCondition[]): Promise<ProductInterface[] | null> {
    try {
        const ref = setCondition(productsRef, conditions)
        return await getAll(ref)
    } catch (err) {
        throw err;
    }
}

export async function add(product: ProductType): Promise<ProductInterface> {
    try {
        const id = productsRef.doc().id
        product.productId = id
        const productData = await set(id, product)
        await incrementProduct()
        return productData
    } catch (err) {
        throw err
    }
}

export async function set(productId: string, product: ProductType): Promise<ProductInterface> {
    try {
        const dataToInsert = new Product(product).get()
        dataToInsert.updatedAt = Date.now()
        await productsRef.doc(productId).set(dataToInsert)
        return dataToInsert
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
        await decrementProduct()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return productsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, productId: string, order: ProductType) {
    try {
        const dataToInsert = new Product(order).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(productId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, productId: string, order: ProductType) {
    try {
        return batch.update(getRef(productId), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, productId: string) {
    try {
        return batch.delete(getRef(productId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as ProductInterface
        data.productId = d.id
        data = new Product(data).get()
        return data
    })
}
