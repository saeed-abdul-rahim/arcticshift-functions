import { productsRef } from '../../config/db'
import { ProductInterface, ProductType, Product, ProductCondition } from './schema'
import { setCondition } from '../common'

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

export async function add(product: ProductType): Promise<string> {
    try {
        const id = productsRef.doc().id
        product.productId = id
        await set(id, product)
        return id
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

export async function getRef(id?: string) {
    if (id) {
        return productsRef.doc(id)
    } else {
        return productsRef
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
