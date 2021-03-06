import { collectionAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementCollection() {
    try {
        const data = incrementDocByOne()
        await updateRef(collectionAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementCollection() {
    try {
        const data = decrementDocByOne()
        await updateRef(collectionAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
