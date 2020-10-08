import { saleDiscountAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementSaleDiscount() {
    try {
        const data = incrementDocByOne()
        await updateRef(saleDiscountAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementSaleDiscount() {
    try {
        const data = decrementDocByOne()
        await updateRef(saleDiscountAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
