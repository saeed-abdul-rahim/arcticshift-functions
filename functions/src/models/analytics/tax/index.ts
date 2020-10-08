import { taxAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementTax() {
    try {
        const data = incrementDocByOne()
        await updateRef(taxAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementTax() {
    try {
        const data = decrementDocByOne()
        await updateRef(taxAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
