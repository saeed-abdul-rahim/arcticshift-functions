import { Role } from "../common/schema"

export interface CustomClaimsInterface {
    shopId: string
    role: Role,
    access: string[]
}

export interface AllCustomClaimsInterface {
    claims: CustomClaimsInterface[]
}

export type CustomClaimsType = {
    shopId: string,
    role: Role,
    access?: string[]
}

export class CustomClaims implements CustomClaimsInterface {
    shopId: string
    role: Role
    access: string[]

    constructor(data: CustomClaimsType) {
        this.shopId = data.shopId
        this.role = data.role
        this.access = data.access ? data.access : []
    }

    get(): CustomClaimsInterface {
        return {
            shopId: this.shopId,
            role: this.role,
            access: this.access
        }
    }
}