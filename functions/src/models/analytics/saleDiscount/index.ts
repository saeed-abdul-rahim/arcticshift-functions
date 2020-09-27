import { saleDiscountAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementSaleDiscount() {
    try {
        const data = incrementDocByOne()
        await saleDiscountAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementSaleDiscount() {
    try {
        const data = decrementDocByOne()
        await saleDiscountAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
