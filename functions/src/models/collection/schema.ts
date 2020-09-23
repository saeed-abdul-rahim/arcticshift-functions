import { CommonInterface, CommonType, ContentStorage, Condition } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface CollectionInterface extends CommonInterface {
    shopId: string
    collectionId: string
    name: string
    description: string
    images: ContentStorage[]
    productId: string[]
    featureOnHomePage: boolean
    saleDiscountId: string
    voucherId: string
}

export type CollectionType = CommonType & {
    shopId?: string
    collectionId?: string
    name?: string
    description?: string
    images?: ContentStorage[]
    productId?: string[]
    featureOnHomePage?: boolean
    saleDiscountId?: string
    voucherId?: string
}

export class Collection extends Common implements CollectionInterface {
    shopId: string
    collectionId: string
    name: string
    description: string
    images: ContentStorage[]
    productId: string[]
    featureOnHomePage: boolean
    saleDiscountId: string
    voucherId: string

    constructor(data: CollectionType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.collectionId = data.collectionId ? data.collectionId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.images = data.images ? data.images : []
        this.productId = data.productId ? uniqueArr(data.productId) : []
        this.featureOnHomePage = data.featureOnHomePage ? data.featureOnHomePage : false
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.voucherId = data.voucherId ? data.voucherId : ''
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
            saleDiscountId: this.saleDiscountId,
            voucherId: this.voucherId
        }
    }

}

export type CollectionCondition = Condition & {
    field: CollectionFields
    parentFields?: (keyof CollectionType)[]
}

type CollectionFields = keyof (CollectionType & ContentStorage)
