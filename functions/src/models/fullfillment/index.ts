import { fullfillmentsRef } from '../../config/db'
import { setCondition } from '../common'
import { FullfillmentInterface, FullfillmentType, Fullfillment, FullfillmentCondition, FullfillmentOrderBy } from './schema'

export async function get(fullfillmentId: string): Promise<FullfillmentInterface> {
    try {
        const doc = await getRef(fullfillmentId).get()
        if (!doc.exists) throw new Error('Fullfillment not found')
        const data = <FullfillmentInterface>doc.data()
        data.fullfillmentId = doc.id
        return new Fullfillment(data).get()
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function getOneByCondition(conditions: FullfillmentCondition[], fullfillmentBy?: FullfillmentOrderBy): Promise<FullfillmentInterface | null> {
    try {
        const data = await getByCondition(conditions, fullfillmentBy, 1)
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

export async function getByCondition(conditions: FullfillmentCondition[], fullfillmentBy?: FullfillmentOrderBy, limit?: number): Promise<FullfillmentInterface[] | null> {
    try {
        const ref = setCondition(fullfillmentsRef, conditions, fullfillmentBy, limit)
        return await getAll(ref)
    } catch (err) {
        console.error(err)
        throw err;
    }
}

export async function add(fullfillment: FullfillmentType): Promise<string> {
    try {
        const id = fullfillmentsRef.doc().id
        fullfillment.fullfillmentId = id
        await set(id, fullfillment)
        return id
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function set(fullfillmentId: string, fullfillment: FullfillmentType): Promise<boolean> {
    try {
        const dataToInsert = new Fullfillment(fullfillment).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(fullfillmentId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function update(fullfillmentId: string, fullfillment: FullfillmentType): Promise<boolean> {
    try {
        await getRef(fullfillmentId).update({ ...fullfillment, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function remove(fullfillmentId: string): Promise<boolean> {
    try {
        await getRef(fullfillmentId).delete()
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function getRef(id: string) {
    return fullfillmentsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, fullfillmentId: string, fullfillment: FullfillmentType) {
    try {
        const dataToInsert = new Fullfillment(fullfillment).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(fullfillmentId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, fullfillmentId: string, fullfillment: FullfillmentType) {
    try {
        return batch.update(getRef(fullfillmentId), { ...fullfillment, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, fullfillmentId: string) {
    try {
        return batch.delete(getRef(fullfillmentId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
    try {
        const doc = await ref.get()
        if (doc.empty) return null
        return doc.docs.map(d => {
            let data = d.data() as FullfillmentInterface
            data.fullfillmentId = d.id
            data = new Fullfillment(data).get()
            return data
        })
    } catch (err) {
        console.error(err)
        throw err
    }
}
