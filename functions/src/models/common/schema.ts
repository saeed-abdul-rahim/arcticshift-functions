export type Role = 'admin' | 'manager'
export type Status = 'active' | 'inactive'

export type SignInType = {
    email?: string
    phone?: string
}

export type TimestampType = {
    createdAt?: number
    updatedAt?: number
}

export interface TimestampInterface {
    createdAt?: number
    updatedAt?: number
}

export type AuthType = {
    [key in Role]?: string[]
};

export type AuthTypeImp = {
    [key in Role]: string[]
};

export type CommonType = AuthType & TimestampType & {
    status?: Status
}

export interface CommonInterface extends AuthTypeImp, TimestampInterface {
    status: Status
}
