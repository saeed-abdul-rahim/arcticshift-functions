import { voucherAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementVoucher() {
    try {
        const data = incrementDocByOne()
        await updateRef(voucherAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementVoucher() {
    try {
        const data = decrementDocByOne()
        await updateRef(voucherAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
