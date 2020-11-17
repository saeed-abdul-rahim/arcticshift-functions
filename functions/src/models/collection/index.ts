import { collectionsRef } from '../../config/db'
import { decrementCollection, incrementCollection } from '../analytics/collection'
import { CollectionInterface, CollectionType, Collection } from './schema'

export async function get(collectionId: string): Promise<CollectionInterface> {
    try {
        const doc = await collectionsRef.doc(collectionId).get()
        if (!doc.exists) throw new Error('Collection not found')
        const data = <CollectionInterface>doc.data()
        data.collectionId = doc.id
        return new Collection(data).get()
    } catch (err) {
        throw err
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
        await collectionsRef.doc(collectionId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(collectionId: string, collection: CollectionType): Promise<boolean> {
    try {
        await collectionsRef.doc(collectionId).update({ ...collection, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(collectionId: string): Promise<boolean> {
    try {
        await collectionsRef.doc(collectionId).delete()
        await decrementCollection()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return collectionsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, collectionsId: string, order: CollectionType) {
    try {
        const dataToInsert = new Collection(order).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(collectionsId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, collectionsId: string, order: CollectionType) {
    try {
        return batch.update(getRef(collectionsId), { ...order, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, collectionsId: string) {
    try {
        return batch.delete(getRef(collectionsId))
    } catch (err) {
        throw err
    }
}
