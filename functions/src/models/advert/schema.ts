import { CommonInterface, CommonType, Datetime } from '../common/schema'
import { Common } from '../common'

export interface AdvertInterface extends CommonInterface {
    shopId: string
    advertId: string
    name: string
    description: string
    imageUrl: string
    url: string
    startDate: Datetime | null
    endDate: Datetime | null
}

export type AdvertType = CommonType & {
    shopId: string
    advertId?: string
    name?: string
    description?: string
    imageUrl?: string
    url?: string
    startDate?: Datetime | null
    endDate?: Datetime | null
}

export class Advert extends Common implements AdvertInterface {
    shopId: string
    advertId: string
    name: string
    description: string
    imageUrl: string
    url: string
    startDate: Datetime | null
    endDate: Datetime | null

    constructor(data: AdvertType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.advertId = data.advertId ? data.advertId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.imageUrl = data.imageUrl ? data.imageUrl : ''
        this.url = data.url ? data.url : ''
        this.startDate = data.startDate ? data.startDate : null
        this.endDate = data.endDate ? data.endDate : null
    }

    get(): AdvertInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            advertId: this.advertId,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            url: this.url,
            startDate: this.startDate,
            endDate: this.endDate
        }
    }

}
