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
        const dataToInsert = new Collection(collection).get()
        const data = await collectionsRef.add(dataToInsert)
        return data.id
    } catch (err) {
        throw err
    }
}

export async function set(collectionTypeId: string, collection: CollectionType): Promise<boolean> {
    try {
        const dataToInsert = new Collection(collection).get()
        dataToInsert.updatedAt = Date.now()
        await collectionsRef.doc(collectionTypeId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(collectionTypeId: string, collection: CollectionType): Promise<boolean> {
    try {
        await collectionsRef.doc(collectionTypeId).update({ ...collection, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(collectionTypeId: string): Promise<boolean> {
    try {
        await collectionsRef.doc(collectionTypeId).delete()
        return true
    } catch (err) {
        throw err
    }
}
