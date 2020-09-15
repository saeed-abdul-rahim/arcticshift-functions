import {
    Role,
    CommonInterface,
    CommonType,
    TimestampInterface,
    TimestampType,
    Status,
    Condition
} from './schema'
import { uniqueArr } from '../../utils/uniqueArr'

export const roles: Role[] = ['admin', 'staff']

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
    admin: string[]
    staff: string[]
    status: Status

    constructor(data: CommonType) {
        super(data)
        this.admin = data.admin ? uniqueArr(data.admin) : []
        this.staff = data.staff ? uniqueArr(data.staff) : []
        this.status = data.status ? data.status : 'active'
    }

    get(): CommonInterface {
        return {
            ...super.get(),
            admin: this.admin,
            staff: this.staff,
            status: this.status
        }
    }

}

export function setCondition(collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>, conditions: Condition[]) {
    let ref: FirebaseFirestore.Query = collectionRef
    conditions.forEach(condition => {
        const { field, type, value } = condition
        ref = ref.where(field, type, value)
    })
    return ref
}
