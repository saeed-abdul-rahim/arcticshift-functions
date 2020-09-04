import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

export interface CollectionInterface extends TimestampInterface {
    shopId: string
    collectionId: string
    name: string
    description: string
    imageUrl: string[]
    productId: string[]
    featureOnHomePage: boolean
    hidden: boolean
}

export type CollectionType = TimestampType & {
    shopId: string
    collectionId?: string
    name?: string
    description?: string
    imageUrl?: string[]
    productId?: string[]
    featureOnHomePage?: boolean
    hidden?: boolean
}

export class Collection extends Timestamp implements CollectionInterface {
    shopId: string
    collectionId: string
    name: string
    description: string
    imageUrl: string[]
    productId: string[]
    featureOnHomePage: boolean
    hidden: boolean

    constructor(data: CollectionType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.collectionId = data.collectionId ? data.collectionId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.imageUrl = data.imageUrl ? data.imageUrl : []
        this.productId = data.productId ? data.productId : []
        this.featureOnHomePage = data.featureOnHomePage ? data.featureOnHomePage : false
        this.hidden = data.hidden ? data.hidden : false
    }

    get(): CollectionInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            collectionId: this.collectionId,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            productId: this.productId,
            featureOnHomePage: this.featureOnHomePage,
            hidden: this.hidden
        }
    }

}
