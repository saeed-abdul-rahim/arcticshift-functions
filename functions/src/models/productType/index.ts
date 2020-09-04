import { productTypesRef } from '../../config/db'
import { ProductTypeInterface, ProductTypeType, ProductType } from './schema'

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

export async function add(product: ProductTypeType): Promise<string> {
    try {
        const dataToInsert = new ProductType(product).get()
        const data = await productTypesRef.add(dataToInsert)
        return data.id
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
        return true
    } catch (err) {
        throw err
    }
}
