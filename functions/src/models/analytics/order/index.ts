import { ANALYTICS } from "../../../config/constants"
import { firestore, orderAnalyticsRef } from "../../../config/db"
import { callerName } from "../../../utils/functionUtils"
import { updateRef } from "../../common"
import { decrementDocByOne, incrementDocByOne } from "../common"
import { SaleAnalytics, SaleAnalyticsType } from './schema'

const functionPath = `${ANALYTICS}/order`
const dayWiseAnalyticsRef = orderAnalyticsRef.collection('dayWise')

export async function incrementOrder() {
    try {
        const data = incrementDocByOne()
        await updateRef(orderAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export async function decrementOrder() {
    try {
        const data = decrementDocByOne()
        await updateRef(orderAnalyticsRef, data)
    } catch (err) {
        console.error(err)
    }
}

export function getRefDayWise(id: string) {
    return dayWiseAnalyticsRef.doc(id)
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, saleAnalyticsId: string, saleAnalytics: SaleAnalyticsType) {
    try {
        return transaction.set(getRefDayWise(saleAnalyticsId), {
            sale: firestore.FieldValue.arrayUnion((new SaleAnalytics(saleAnalytics).get())) },
            { merge: true }
        )
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}
