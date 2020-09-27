import { voucherAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementVoucher() {
    try {
        const data = incrementDocByOne()
        await voucherAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementVoucher() {
    try {
        const data = decrementDocByOne()
        await voucherAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
