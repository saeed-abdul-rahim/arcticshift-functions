import { collectionsRef } from '../../config/db'
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
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return collectionsRef.doc(id)
    } else {
        return collectionsRef
    }
}
