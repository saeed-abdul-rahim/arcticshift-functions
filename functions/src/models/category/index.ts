import { categoriesRef } from '../../config/db'
import { decrementCategory, incrementCategory } from '../analytics/category'
import { setCondition } from '../common'
import { CategoryInterface, CategoryType, Category, CategoryCondition, CategoryOrderBy } from './schema'

export async function get(categoryId: string): Promise<CategoryInterface> {
    try {
        const doc = await getRef(categoryId).get()
        if (!doc.exists) throw new Error('Category not found')
        const data = <CategoryInterface>doc.data()
        data.categoryId = doc.id
        return new Category(data).get()
    } catch (err) {
        throw err
    }
}

export async function getOneByCondition(conditions: CategoryCondition[], orderBy?: CategoryOrderBy): Promise<CategoryInterface | null> {
    try {
        const data = await getByCondition(conditions, orderBy, 1)
        if (!data) {
            return data
        }
        else {
            return data[0]
        }
    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function getByCondition(conditions: CategoryCondition[], orderBy?: CategoryOrderBy, limit?: number): Promise<CategoryInterface[] | null> {
    try {
        const ref = setCondition(categoriesRef, conditions, orderBy, limit)
        return await getAll(ref)
    } catch (err) {
        console.error(err)
        throw err;
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
        await getRef(categoryId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(categoryId: string, category: CategoryType): Promise<boolean> {
    try {
        await getRef(categoryId).update({ ...category, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(categoryId: string): Promise<boolean> {
    try {
        await getRef(categoryId).delete()
        await decrementCategory()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return categoriesRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, categoryId: string, data: CategoryType) {
    try {
        const dataToInsert = new Category(data).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(categoryId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, categoryId: string, data: CategoryType) {
    try {
        return batch.update(getRef(categoryId), { ...data, updatedAt: Date.now() })
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

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as CategoryInterface
        data.categoryId = d.id
        data = new Category(data).get()
        return data
    })
}
