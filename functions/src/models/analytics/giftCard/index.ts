import { giftCardAnalyticsRef } from "../../../config/db"
import { decrementDocByOne, incrementDocByOne } from "../common"

export async function incrementGiftCard() {
    try {
        const data = incrementDocByOne()
        await giftCardAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementGiftCard() {
    try {
        const data = decrementDocByOne()
        await giftCardAnalyticsRef.update(data)
    } catch (err) {
        console.error(err)
    }
}
