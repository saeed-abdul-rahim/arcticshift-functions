import { categoryAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementCategory() {
    try {
        const data = incrementDocByOne()
        await updateRef(categoryAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementCategory() {
    try {
        const data = decrementDocByOne()
        await updateRef(categoryAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
