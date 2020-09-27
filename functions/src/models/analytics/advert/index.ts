import { advertAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementAdvert() {
    try {
        const data = incrementDocByOne()
        await advertAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementAdvert() {
    try {
        const data = decrementDocByOne()
        await advertAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
