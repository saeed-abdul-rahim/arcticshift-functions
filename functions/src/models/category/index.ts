import { categoriesRef } from '../../config/db'
import { decrementCategory, incrementCategory } from '../analytics/category'
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
        await incrementCategory()
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
        await decrementCategory()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return categoriesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, categoryId: string, order: CategoryType) {
    try {
        const dataToInsert = new Category(order).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(categoryId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, categoryId: string, order: CategoryType) {
    try {
        return batch.update(getRef(categoryId), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, categoryId: string) {
    try {
        return batch.delete(getRef(categoryId))
    } catch (err) {
        throw err
    }
}
