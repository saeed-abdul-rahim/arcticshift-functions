import { attributeAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementAttribute() {
    try {
        const data = incrementDocByOne()
        await attributeAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementAttribute() {
    try {
        const data = decrementDocByOne()
        await attributeAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
