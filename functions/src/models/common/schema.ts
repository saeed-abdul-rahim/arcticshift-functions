import * as admin from 'firebase-admin'

export type FieldValue = admin.firestore.FieldValue

export type PaymentGateway = 'razorpay' | 'stripe'
export type Role = 'admin' | 'staff'
export type Status = 'active' | 'inactive'
export type ValueType = 'fixed' | 'percent'
export type PriceType = 'original' | 'override' | 'strike' | 'discount' | 'cost'
export type FullfillmentStatus = 'unfullfilled' | 'partiallyFullfilled' | 'fullfilled' | 'cancelled'

export type Price = {
    name: PriceType
    value: number
}

export type CatalogType = {
    productId?: string[]
    categoryId?: string[]
    collectionId?: string[]
}
export type CatalogTypeKey = keyof CatalogType

export type ObjString = {
    [key: string]: string
} | null

export type ObjNumber = {
    [key: string]: number
} | null

export type Tax = {
    name: string
    value: number
    type: ValueType
}

export type ContentStorage = {
    path: string
    url: string
    name?: string
    dimension?: number
}

export type Content = {
    content: ContentStorage
    thumbnails: ContentStorage[]
}

export type Condition = {
    field: string | FirebaseFirestore.FieldPath,
    type: FirebaseFirestore.WhereFilterOp,
    value: any
    parentFields?: string[]
}

export type OrderBy = {
    field: string
    direction: 'asc' | 'desc'
};

export type SignInType = {
    email?: string
    phone?: string
}

export type AuthType = {
    [key in Role]?: string[]
}

export type AuthTypeImp = {
    [key in Role]: string[]
}

export type TimestampType = {
    createdAt?: number
    updatedAt?: number
}

export interface TimestampInterface {
    createdAt?: number
    updatedAt?: number
}

export type CommonType = TimestampType & {
    status?: Status
}

export interface CommonInterface extends TimestampInterface {
    status: Status
}

export type Address = {
    name?: string
    firstName?: string
    lastName?: string
    company?: string
    phone?: string
    email?: string
    line1?: string
    line2?: string
    city?: string
    zip?: string
    area?: string
    country?: string
}

export type AddressKey = keyof Address

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
