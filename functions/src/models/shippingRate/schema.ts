import { Common, Condition, CommonInterface, CommonType } from '../common/schema'

export interface ShippingRateInterface extends CommonInterface {
    shippingId: string
    shippingRateId: string
    name: string
    type: RateType
    minValue: number
    maxValue: number
    price: number
    noValueLimit: boolean
    freeShippingRate: boolean
}

export type ShippingRateType = CommonType & {
    shippingId?: string
    shippingRateId?: string
    name?: string
    type?: RateType
    minValue?: number
    maxValue?: number
    price?: number
    noValueLimit?: boolean
    freeShippingRate?: boolean
}

export class ShippingRate extends Common implements ShippingRateInterface {
    shippingId: string
    shippingRateId: string
    name: string
    type: RateType
    minValue: number
    maxValue: number
    price: number
    noValueLimit: boolean
    freeShippingRate: boolean

    constructor(data: ShippingRateType) {
        super(data)
        this.shippingId = data.shippingId ? data.shippingId : ''
        this.shippingRateId = data.shippingRateId ? data.shippingRateId : ''
        this.name = data.name ? data.name : ''
        this.type = data.type ? data.type : 'price'
        this.minValue = data.minValue ? data.minValue : -1
        this.maxValue = data.maxValue ? data.maxValue : -1
        this.price = data.price ? data.price : 0
        this.noValueLimit = data.noValueLimit ? data.noValueLimit : false
        this.freeShippingRate = data.freeShippingRate ? data.freeShippingRate : false
    }

    get(): ShippingRateInterface {
        return {
            ...super.get(),
            shippingId: this.shippingId,
            shippingRateId: this.shippingRateId,
            name: this.name,
            type: this.type,
            minValue: this.minValue,
            maxValue: this.maxValue,
            price: this.price,
            noValueLimit: this.noValueLimit,
            freeShippingRate: this.freeShippingRate
        }
    }

}

export type ShippingRateCondition = Condition & {
    field: ShippingRateFields
}

type ShippingRateFields = keyof ShippingRateType

type RateType = 'price' | 'weight'
