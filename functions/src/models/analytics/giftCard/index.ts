import { giftCardAnalyticsRef } from "../../../config/db"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementGiftCard() {
    try {
        const data = incrementDocByOne()
        await updateRef(giftCardAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementGiftCard() {
    try {
        const data = decrementDocByOne()
        await updateRef(giftCardAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}
