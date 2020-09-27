import { productTypesRef } from '../../config/db'
import { decrementProductType, incrementProductType } from '../analytics/productType'
import { setCondition } from '../common'
import { ProductTypeInterface, ProductTypeType, ProductType, ProductTypeCondition } from './schema'

export async function get(productTypeId: string): Promise<ProductTypeInterface> {
    try {
        const doc = await productTypesRef.doc(productTypeId).get()
        if (!doc.exists) throw new Error('ProductType not found')
        const data = <ProductTypeInterface>doc.data()
        data.productTypeId = doc.id
        return new ProductType(data).get()
    } catch (err) {
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
        throw err
    }
}

export async function set(productTypeId: string, product: ProductTypeType): Promise<boolean> {
    try {
        const dataToInsert = new ProductType(product).get()
        dataToInsert.updatedAt = Date.now()
        await productTypesRef.doc(productTypeId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(productTypeId: string, product: ProductTypeType): Promise<boolean> {
    try {
        await productTypesRef.doc(productTypeId).update({ ...product, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(productTypeId: string): Promise<boolean> {
    try {
        await productTypesRef.doc(productTypeId).delete()
        await decrementProductType()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return productTypesRef.doc(id)
    } else {
        return productTypesRef
    }
}
