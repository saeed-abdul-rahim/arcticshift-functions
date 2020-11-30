import { orderAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"
import { SaleAnalyticsGroupInterface, SaleAnalyticsGroupType, SaleAnalyticsGroup } from './schema'

const dayWiseAnalyticsRef = orderAnalyticsRef.collection('dayWise')

export async function incrementOrder() {
    try {
        const data = incrementDocByOne()
        await updateRef(orderAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementOrder() {
    try {
        const data = decrementDocByOne()
        await updateRef(orderAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function get(saleAnalyticsId: string, transaction?: FirebaseFirestore.Transaction): Promise<SaleAnalyticsGroupInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRefDayWise(saleAnalyticsId))
        } else {
            doc = await getRefDayWise(saleAnalyticsId).get()
        }
        if (!doc.exists) throw new Error('SaleAnalyticsGroup not found')
        const data = <SaleAnalyticsGroupInterface>doc.data()
        return new SaleAnalyticsGroup(data).get()
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function set(saleAnalyticsId: string, saleAnalytics: SaleAnalyticsGroupType): Promise<boolean> {
    try {
        const dataToInsert = new SaleAnalyticsGroup(saleAnalytics).get()
        await getRefDayWise(saleAnalyticsId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function update(saleAnalyticsId: string, saleAnalytics: SaleAnalyticsGroupType): Promise<boolean> {
    try {
        await getRefDayWise(saleAnalyticsId).update({ ...saleAnalytics, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function remove(saleAnalyticsId: string): Promise<boolean> {
    try {
        await getRefDayWise(saleAnalyticsId).delete()
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function getRefDayWise(id: string) {
    return dayWiseAnalyticsRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, saleAnalyticsId: string, saleAnalytics: SaleAnalyticsGroupType) {
    try {
        const dataToInsert = new SaleAnalyticsGroup(saleAnalytics).get()
        return batch.set(getRefDayWise(saleAnalyticsId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, saleAnalyticsId: string, saleAnalytics: SaleAnalyticsGroupType) {
    try {
        return batch.update(getRefDayWise(saleAnalyticsId), { ...saleAnalytics, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, saleAnalyticsId: string) {
    try {
        return batch.delete(getRefDayWise(saleAnalyticsId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, saleAnalyticsId: string, saleAnalytics: SaleAnalyticsGroupType) {
    try {
        const dataToInsert = new SaleAnalyticsGroup(saleAnalytics).get()
        return transaction.set(getRefDayWise(saleAnalyticsId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, saleAnalyticsId: string, saleAnalytics: SaleAnalyticsGroupType) {
    try {
        return transaction.update(getRefDayWise(saleAnalyticsId), { ...saleAnalytics, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, saleAnalyticsId: string) {
    try {
        return transaction.delete(getRefDayWise(saleAnalyticsId))
    } catch (err) {
        throw err
    }
}
