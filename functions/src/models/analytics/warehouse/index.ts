import { warehouseAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementWarehouse() {
    try {
        const data = incrementDocByOne()
        await updateRef(warehouseAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementWarehouse() {
    try {
        const data = decrementDocByOne()
        await updateRef(warehouseAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
