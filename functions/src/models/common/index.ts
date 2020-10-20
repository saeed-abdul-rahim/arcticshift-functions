import * as admin from 'firebase-admin'
import { Role, Condition, ValueType, Datetime, AddressKey } from './schema'

export const roles: Role[] = ['admin', 'staff']
export const valueTypes: ValueType[] = ['fixed', 'percent']

export function isOfTypeAddress (keyInput: string): keyInput is AddressKey {
    return ['name', 'company', 'phone', 'email', 'line1', 'line2', 'city', 'zip', 'area', 'country'].includes(keyInput);
}

export function setCondition(collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>, conditions: Condition[]) {
    let ref: FirebaseFirestore.Query = collectionRef
    conditions.forEach(condition => {
        const { field, type, value, parentFields } = condition
        if (parentFields && parentFields.length > 0) {
            const whereField = `${parentFields.join('.')}.${field}`
            ref = ref.where(whereField, type, value)
        } else {
            ref = ref.where(field, type, value)
        }
    })
    return ref
}

export function isValidDateTime(datetime: Datetime) {
    const { date, time, zone } = datetime
    if (date && time && zone) {
        return datetime
    } else {
        return null
    }
}

export function incrementValue(value: number) {
    return admin.firestore.FieldValue.increment(value)
}

export async function updateRef(ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, data: any) {
    try {
        await ref.set(data, { merge: true })
    } catch (err) {
        console.error(err)
    }
}