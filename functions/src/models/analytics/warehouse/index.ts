import { warehouseAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementWarehouse() {
    try {
        const data = incrementDocByOne()
        await warehouseAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementWarehouse() {
    try {
        const data = decrementDocByOne()
        await warehouseAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
