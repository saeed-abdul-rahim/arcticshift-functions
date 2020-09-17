import { Condition, TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

type Rate = {
    name: string
    minValue?: number
    maxValue?: number
    price?: number
    noValueLimit?: boolean
    freeShipping?: boolean
} | null

export interface ShippingInterface extends TimestampInterface {
    shopId: string
    shippingId: string
    name: string
    countries: string[] // ALPHA-3
    priceBased: Rate
    weightBased: Rate
    warehouseId: string[]
    taxId: string
}

export type ShippingType = TimestampType & {
    shopId: string
    shippingId?: string
    name?: string
    countries?: string[]
    priceBased?: Rate
    weightBased?: Rate
    warehouseId?: string[]
    taxId?: string
}

export class Shipping extends Timestamp implements ShippingInterface {
    shopId: string
    shippingId: string
    name: string
    countries: string[] // ALPHA-3
    priceBased: Rate
    weightBased: Rate
    warehouseId: string[]
    taxId: string

    constructor(data: ShippingType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.shippingId = data.shippingId ? data.shippingId : ''
        this.name = data.name ? data.name : ''
        this.countries = data.countries ? uniqueArr(data.countries) : []
        this.priceBased = data.priceBased ? data.priceBased : null
        this.weightBased = data.weightBased ? data.weightBased : null
        this.warehouseId = data.warehouseId ? uniqueArr(data.warehouseId) : []
        this.taxId = data.taxId ? data.taxId : ''
    }

    get(): ShippingInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            shippingId: this.shippingId,
            name: this.name,
            countries: this.countries,
            priceBased: this.priceBased,
            weightBased: this.weightBased,
            warehouseId: this.warehouseId,
            taxId: this.taxId
        }
    }

}

export type ShippingCondition = Condition & {
    field: keyof ShippingType
}
