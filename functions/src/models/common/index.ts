import {
    Role,
    CommonInterface,
    CommonType,
    TimestampInterface,
    TimestampType,
    Status
} from './schema'
import { uniqueArr } from '../../utils/uniqueArr'

export const roles: Role[] = ['admin', 'manager']

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
    manager: string[]
    status: Status

    constructor(data: CommonType) {
        super(data)
        this.admin = data.admin ? uniqueArr(data.admin) : []
        this.manager = data.manager ? uniqueArr(data.manager) : []
        this.status = data.status ? data.status : 'active'
    }

    get(): CommonInterface {
        return {
            ...super.get(),
            admin: this.admin,
            manager: this.manager,
            status: this.status
        }
    }

}
