import { shippingAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementShipping() {
    try {
        const data = incrementDocByOne()
        await updateRef(shippingAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementShipping() {
    try {
        const data = decrementDocByOne()
        await updateRef(shippingAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
