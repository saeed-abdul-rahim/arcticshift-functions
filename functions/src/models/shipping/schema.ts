import { Common, Condition, CommonInterface, CommonType } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'

export interface ShippingInterface extends CommonInterface {
    shopId: string
    shippingId: string
    name: string
    countries: string[] // ALPHA-3
    zipCode: string[]
    radius: number
    rates: string[]
    warehouseId: string[]
    taxId: string
}

export type ShippingType = CommonType & {
    shopId?: string
    shippingId?: string
    name?: string
    countries?: string[]
    zipCode?: string[]
    radius?: number
    rates?: string[]
    warehouseId?: string[]
    taxId?: string
}

export class Shipping extends Common implements ShippingInterface {
    shopId: string
    shippingId: string
    name: string
    countries: string[] // ALPHA-3
    zipCode: string[]
    radius: number
    rates: string[]
    warehouseId: string[]
    taxId: string

    constructor(data: ShippingType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.shippingId = data.shippingId ? data.shippingId : ''
        this.name = data.name ? data.name : ''
        this.countries = data.countries ? uniqueArr(data.countries) : []
        this.zipCode = data.zipCode ? uniqueArr(data.zipCode) : []
        this.radius = data.radius ? data.radius : 0
        this.rates = data.rates ? uniqueArr(data.rates) : []
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
            zipCode: this.zipCode,
            radius: this.radius,
            rates: this.rates,
            warehouseId: this.warehouseId,
            taxId: this.taxId
        }
    }

}

export type ShippingCondition = Condition & {
    field: ShippingFields
}

type ShippingFields = keyof ShippingType
