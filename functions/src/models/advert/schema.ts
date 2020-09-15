import { TimestampInterface, TimestampType, Status, Datetime } from '../common/schema'
import { Timestamp } from '../common'

export interface AdvertInterface extends TimestampInterface {
    shopId: string
    advertId: string
    name: string
    description: string
    imageUrl: string
    url: string
    status: Status
    startDate: Datetime | null
    endDate: Datetime | null
}

export type AdvertType = TimestampType & {
    shopId: string
    advertId?: string
    name?: string
    description?: string
    imageUrl?: string
    url?: string
    status?: Status
    startDate?: Datetime | null
    endDate?: Datetime | null
}

export class Advert extends Timestamp implements AdvertInterface {
    shopId: string
    advertId: string
    name: string
    description: string
    imageUrl: string
    url: string
    status: Status
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
        this.status = data.status ? data.status : 'active'
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
            status: this.status,
            startDate: this.startDate,
            endDate: this.endDate
        }
    }

}
