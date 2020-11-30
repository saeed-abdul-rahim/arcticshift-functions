import { productsRef } from '../../config/db'
import { ProductInterface, ProductType, Product, ProductCondition } from './schema'
import { setCondition } from '../common'
import { decrementProduct, incrementProduct } from '../analytics/product'
import { callerName } from '../../utils/functionUtils'
import { MODELS } from '../../config/constants'

const functionPath = `${MODELS}/product`

export async function get(productId: string, transaction?: FirebaseFirestore.Transaction): Promise<ProductInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(productId))
        } else {
            doc = await getRef(productId).get()
        }
        if (!doc.exists) throw new Error('Product not found')
        const data = <ProductInterface>doc.data()
        data.productId = doc.id
        return new Product(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export async function getByCondition(conditions: ProductCondition[]): Promise<ProductInterface[] | null> {
    try {
        const ref = setCondition(productsRef, conditions)
        return await getAll(ref)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function set(productId: string, product: ProductType): Promise<ProductInterface> {
    try {
        const dataToInsert = new Product(product).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(productId).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(productId: string, product: ProductType): Promise<boolean> {
    try {
        await getRef(productId).update({ ...product, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function remove(productId: string): Promise<boolean> {
    try {
        await getRef(productId).delete()
        await decrementProduct()
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function getRef(id: string) {
    return productsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, productId: string, product: ProductType) {
    try {
        const dataToInsert = new Product(product).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(productId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, productId: string, product: ProductType) {
    try {
        return batch.update(getRef(productId), { ...product, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, productId: string) {
    try {
        return batch.delete(getRef(productId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, productId: string, product: ProductType) {
    try {
        const dataToInsert = new Product(product).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(productId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, productId: string, product: ProductType) {
    try {
        return transaction.update(getRef(productId), { ...product, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, productId: string) {
    try {
        return transaction.delete(getRef(productId))
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
            let data = d.data() as ProductInterface
            data.productId = d.id
            data = new Product(data).get()
            return data
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}
