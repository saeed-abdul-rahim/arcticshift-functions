export type Role = 'admin' | 'staff'
export type Status = 'active' | 'inactive'
export type ValueType = 'fixed' | 'percent'

export type CatalogType = {
    productId?: string[]
    categoryId?: string[]
    collectionId?: string[]
}
export type CatalogTypeKey = keyof CatalogType

export type Tax = {
    name: string
    value: number
    type: ValueType
}

export type ContentStorage = {
    path: string
    url: string
}

export type Condition = {
    field: string | FirebaseFirestore.FieldPath,
    type: FirebaseFirestore.WhereFilterOp,
    value: any
    parentFields?: string[]
}

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

export type Datetime = {
    date: string
    time: string
    zone: string
}

export type Address = {
    name?: string
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
export function isOfTypeAddress (keyInput: string): keyInput is AddressKey {
    return ['name', 'company', 'phone', 'email', 'line1', 'line2', 'city', 'zip', 'area', 'country'].includes(keyInput);
}
