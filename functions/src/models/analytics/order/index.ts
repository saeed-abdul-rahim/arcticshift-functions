import { orderAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

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
