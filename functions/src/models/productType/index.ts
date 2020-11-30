import { MODELS } from '../../config/constants'
import { productTypesRef } from '../../config/db'
import { callerName } from '../../utils/functionUtils'
import { decrementProductType, incrementProductType } from '../analytics/productType'
import { setCondition } from '../common'
import { ProductTypeInterface, ProductTypeType, ProductType, ProductTypeCondition } from './schema'

const functionPath = `${MODELS}/productType`

export async function get(productTypeId: string, transaction?: FirebaseFirestore.Transaction): Promise<ProductTypeInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(productTypeId))
        } else {
            doc = await getRef(productTypeId).get()
        }
        if (!doc.exists) throw new Error('ProductType not found')
        const data = <ProductTypeInterface>doc.data()
        data.productTypeId = doc.id
        return new ProductType(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function getByCondition(conditions: ProductTypeCondition[]): Promise<ProductTypeInterface[] | null> {
    try {
        const ref = setCondition(productTypesRef, conditions)
        const doc = await ref.get()
        if (doc.empty) return null
        return doc.docs.map(d => {
            let data = d.data() as ProductTypeInterface
            data.productTypeId = d.id
            data = new ProductType(data).get()
            return data
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export async function add(productType: ProductTypeType): Promise<string> {
    try {
        const id = productTypesRef.doc().id
        productType.productTypeId = id
        await set(id, productType)
        await incrementProductType()
        return id
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function set(productTypeId: string, product: ProductTypeType): Promise<boolean> {
    try {
        const dataToInsert = new ProductType(product).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(productTypeId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(productTypeId: string, product: ProductTypeType): Promise<boolean> {
    try {
        await getRef(productTypeId).update({ ...product, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function remove(productTypeId: string): Promise<boolean> {
    try {
        await getRef(productTypeId).delete()
        await decrementProductType()
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function getRef(id: string) {
    return productTypesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, productTypeId: string, productType: ProductTypeType) {
    try {
        const dataToInsert = new ProductType(productType).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(productTypeId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, productTypeId: string, productType: ProductTypeType) {
    try {
        return batch.update(getRef(productTypeId), { ...productType, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, productTypeId: string) {
    try {
        return batch.delete(getRef(productTypeId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, productId: string, productType: ProductTypeType) {
    try {
        const dataToInsert = new ProductType(productType).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(productId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, productId: string, productType: ProductTypeType) {
    try {
        return transaction.update(getRef(productId), { ...productType, updatedAt: Date.now() })
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
