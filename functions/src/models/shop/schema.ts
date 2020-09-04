import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'

export interface ShopInterface extends CommonInterface {
    shopId: string
    name: string
    city: string
    fullLocation: string
    sinceDate: number
}

export type ShopType = CommonType & {
    shopId: string
    name?: string
    city?: string
    fullLocation?: string
    sinceDate?: number
}

export class Shop extends Common implements ShopInterface {
    shopId: string
    name: string
    city: string
    fullLocation: string
    sinceDate: number

    constructor(data: ShopType) {
        super(data)
        this.shopId = data.shopId
        this.name = data.name ? data.name : ''
        this.city = data.city ? data.city : ''
        this.fullLocation = data.fullLocation ? data.fullLocation : ''
        this.sinceDate = data.sinceDate ? data.sinceDate : 0
    }

    get(): ShopInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            name: this.name,
            city: this.city,
            fullLocation: this.fullLocation,
            sinceDate: this.sinceDate,
            status: this.status
        }
    }

}