import { productTypeAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementProductType() {
    try {
        const data = incrementDocByOne()
        await updateRef(productTypeAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementProductType() {
    try {
        const data = decrementDocByOne()
        await updateRef(productTypeAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
