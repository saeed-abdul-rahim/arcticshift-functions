import { CommonInterface, CommonType, Address, Condition } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface ShopInterface extends CommonInterface {
    shopId: string
    name: string
    address: Address | null
    shopInvite: string[]
    access: string[]
    weightUnit: string
    taxId: string
}

export type ShopType = CommonType & {
    shopId: string
    name?: string
    address?: Address | null
    shopInvite?: string[]
    access?: string[]
    weightUnit?: string
    taxId?: string
}

export class Shop extends Common implements ShopInterface {
    shopId: string
    name: string
    address: Address | null
    shopInvite: string[]
    access: string[]
    weightUnit: string
    taxId: string

    constructor(data: ShopType) {
        super(data)
        this.shopId = data.shopId
        this.name = data.name ? data.name : ''
        this.address = data.address ? data.address : null
        this.shopInvite = data.shopInvite ? uniqueArr(data.shopInvite) : []
        this.access = data.access ? data.access : []
        this.weightUnit = data.weightUnit ? data.weightUnit : ''
        this.taxId = data.taxId ? data.taxId : ''
    }

    get(): ShopInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            name: this.name,
            address: this.address,
            shopInvite: this.shopInvite,
            access: this.access,
            weightUnit: this.weightUnit,
            taxId: this.taxId
        }
    }

}

export type ShopCondition = Condition & {
    field: keyof ShopType
}
