import { categoryAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementCategory() {
    try {
        const data = incrementDocByOne()
        await categoryAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementCategory() {
    try {
        const data = decrementDocByOne()
        await categoryAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
