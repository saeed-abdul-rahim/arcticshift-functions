import { shippingAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementShipping() {
    try {
        const data = incrementDocByOne()
        await shippingAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementShipping() {
    try {
        const data = decrementDocByOne()
        await shippingAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
