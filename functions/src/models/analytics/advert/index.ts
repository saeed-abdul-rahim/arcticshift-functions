import { advertAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementAdvert() {
    try {
        const data = incrementDocByOne()
        await updateRef(advertAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementAdvert() {
    try {
        const data = decrementDocByOne()
        await updateRef(advertAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
