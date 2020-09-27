import { productAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementProduct() {
    try {
        const data = incrementDocByOne()
        await productAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementProduct() {
    try {
        const data = decrementDocByOne()
        await productAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
