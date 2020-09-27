import { orderAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementOrder() {
    try {
        const data = incrementDocByOne()
        await orderAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementOrder() {
    try {
        const data = decrementDocByOne()
        await orderAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
