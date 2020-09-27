import { productTypeAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementProductType() {
    try {
        const data = incrementDocByOne()
        await productTypeAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementProductType() {
    try {
        const data = decrementDocByOne()
        await productTypeAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
