import { collectionsRef } from '../../config/db'
import { decrementCollection, incrementCollection } from '../analytics/collection'
import { setCondition } from '../common'
import { CollectionInterface, CollectionType, Collection, CollectionCondition, CollectionOrderBy } from './schema'

export async function get(collectionId: string): Promise<CollectionInterface> {
    try {
        const doc = await getRef(collectionId).get()
        if (!doc.exists) throw new Error('Collection not found')
        const data = <CollectionInterface>doc.data()
        data.collectionId = doc.id
        return new Collection(data).get()
    } catch (err) {
        throw err
    }
}

export async function getOneByCondition(conditions: CollectionCondition[], orderBy?: CollectionOrderBy): Promise<CollectionInterface | null> {
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

export async function getByCondition(conditions: CollectionCondition[], orderBy?: CollectionOrderBy, limit?: number): Promise<CollectionInterface[] | null> {
    try {
        const ref = setCondition(collectionsRef, conditions, orderBy, limit)
        return await getAll(ref)
    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function add(collection: CollectionType): Promise<string> {
    try {
        const id = collectionsRef.doc().id
        collection.collectionId = id
        await set(id, collection)
        await incrementCollection()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(collectionId: string, collection: CollectionType): Promise<boolean> {
    try {
        const dataToInsert = new Collection(collection).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(collectionId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(collectionId: string, collection: CollectionType): Promise<boolean> {
    try {
        await getRef(collectionId).update({ ...collection, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(collectionId: string): Promise<boolean> {
    try {
        await getRef(collectionId).delete()
        await decrementCollection()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return collectionsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, collectionId: string, order: CollectionType) {
    try {
        const dataToInsert = new Collection(order).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(collectionId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, collectionId: string, order: CollectionType) {
    try {
        return batch.update(getRef(collectionId), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, collectionId: string) {
    try {
        return batch.delete(getRef(collectionId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    const doc = await ref.get()
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as CollectionInterface
        data.collectionId = d.id
        data = new Collection(data).get()
        return data
    })
}
