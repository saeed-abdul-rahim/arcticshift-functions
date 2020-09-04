import { categoriesRef } from '../../config/db'
import { CategoryInterface, CategoryType, Category } from './schema'

export async function get(categoryId: string): Promise<CategoryInterface> {
    try {
        const doc = await categoriesRef.doc(categoryId).get()
        if (!doc.exists) throw new Error('Category not found')
        const data = <CategoryInterface>doc.data()
        data.categoryId = doc.id
        return new Category(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(category: CategoryType): Promise<string> {
    try {
        const dataToInsert = new Category(category).get()
        const data = await categoriesRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(categoryTypeId: string, category: CategoryType): Promise<boolean> {
    try {
        const dataToInsert = new Category(category).get()
        dataToInsert.updatedAt = Date.now()
        await categoriesRef.doc(categoryTypeId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(categoryTypeId: string, category: CategoryType): Promise<boolean> {
    try {
        await categoriesRef.doc(categoryTypeId).update({ ...category, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(categoryTypeId: string): Promise<boolean> {
    try {
        await categoriesRef.doc(categoryTypeId).delete()
        return true
    } catch (err) {
        throw err
    }
}
