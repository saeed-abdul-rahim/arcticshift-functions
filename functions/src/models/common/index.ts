import {
    Role,
    CommonInterface,
    CommonType,
    TimestampInterface,
    TimestampType,
    Status,
    Condition,
    ValueType, Datetime
} from './schema'

export const roles: Role[] = ['admin', 'staff']
export const valueTypes: ValueType[] = [ 'fixed', 'percent' ]

export class Timestamp implements TimestampInterface {
    createdAt: number
    updatedAt: number

    constructor(data: TimestampType) {
        this.createdAt = data.createdAt && data.createdAt !== 0 ? data.createdAt : Date.now()
        this.updatedAt = data.updatedAt && data.updatedAt !== 0 ? data.updatedAt : Date.now()
    }

    get(): TimestampInterface {
        return {
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

export class Common extends Timestamp implements CommonInterface {
    status: Status

    constructor(data: CommonType) {
        super(data)
        this.status = data.status ? data.status : 'active'
    }

    get(): CommonInterface {
        return {
            ...super.get(),
            status: this.status
        }
    }

}

export function setCondition(collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>, conditions: Condition[]) {
    let ref: FirebaseFirestore.Query = collectionRef
    conditions.forEach(condition => {
        const { field, type, value, parentFields } = condition
        if (parentFields && parentFields.length > 0) {
            const whereField = parentFields.join('.') + field
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
