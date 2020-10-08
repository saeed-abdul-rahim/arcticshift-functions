import { attributeAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementAttribute() {
    try {
        const data = incrementDocByOne()
        await updateRef(attributeAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementAttribute() {
    try {
        const data = decrementDocByOne()
        await updateRef(attributeAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
