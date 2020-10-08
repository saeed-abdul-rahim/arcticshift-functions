import { productAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementProduct() {
    try {
        const data = incrementDocByOne()
        await updateRef(productAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementProduct() {
    try {
        const data = decrementDocByOne()
        await updateRef(productAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
