import { collectionAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementCollection() {
    try {
        const data = incrementDocByOne()
        await collectionAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementCollection() {
    try {
        const data = decrementDocByOne()
        await collectionAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
