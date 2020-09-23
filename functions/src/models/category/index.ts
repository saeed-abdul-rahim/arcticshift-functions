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
        const id = categoriesRef.doc().id
        category.categoryId = id
        await set(id, category)
        return id
    } catch (err) {
        throw err
    }
}

export async function set(categoryId: string, category: CategoryType): Promise<boolean> {
    try {
        const dataToInsert = new Category(category).get()
        dataToInsert.updatedAt = Date.now()
        await categoriesRef.doc(categoryId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(categoryId: string, category: CategoryType): Promise<boolean> {
    try {
        await categoriesRef.doc(categoryId).update({ ...category, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(categoryId: string): Promise<boolean> {
    try {
        await categoriesRef.doc(categoryId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return categoriesRef.doc(id)
    } else {
        return categoriesRef
    }
}
