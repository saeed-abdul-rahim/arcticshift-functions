import { TimestampInterface, TimestampType, ContentStorage } from '../common/schema'
import { Timestamp } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface CollectionInterface extends TimestampInterface {
    shopId: string
    collectionId: string
    name: string
    description: string
    images: ContentStorage[]
    productId: string[]
    featureOnHomePage: boolean
    hidden: boolean
}

export type CollectionType = TimestampType & {
    shopId?: string
    collectionId?: string
    name?: string
    description?: string
    images?: ContentStorage[]
    productId?: string[]
    featureOnHomePage?: boolean
    hidden?: boolean
}

export class Collection extends Timestamp implements CollectionInterface {
    shopId: string
    collectionId: string
    name: string
    description: string
    images: ContentStorage[]
    productId: string[]
    featureOnHomePage: boolean
    hidden: boolean

    constructor(data: CollectionType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.collectionId = data.collectionId ? data.collectionId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.images = data.images ? data.images : []
        this.productId = data.productId ? uniqueArr(data.productId) : []
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
            images: this.images,
            productId: this.productId,
            featureOnHomePage: this.featureOnHomePage,
            hidden: this.hidden
        }
    }

}
