import { TimestampInterface, TimestampType, Status } from '../common/schema'
import { Timestamp } from '../common'

type Thumbnail = {
    size: string
    url: string
}

type Price = {
    name: string
    value: string
}

export interface ProductInterface extends TimestampInterface {
    shopId: string
    productId: string
    name: string
    description: string
    url: string
    imageUrl: string
    thumbnailUrls: Thumbnail[]
    productTypeId: string
    attributeId: string
    attributeValueId: string[]
    categoryId: string
    collectionId: string[]
    prices: Price[]
    tax: number
    variants: string[]
    status: Status
}

export type ProductType = TimestampType & {
    shopId: string
    productId?: string
    name?: string
    description?: string
    url?: string
    imageUrl?: string
    thumbnailUrls?: Thumbnail[]
    productTypeId?: string
    attributeId?: string
    attributeValueId?: string[]
    categoryId?: string
    collectionId?: string[]
    prices?: Price[]
    tax?: number
    variants?: string[]
    status?: Status
}

export class Product extends Timestamp implements ProductInterface {
    shopId: string
    productId: string
    name: string
    description: string
    url: string
    imageUrl: string
    thumbnailUrls: Thumbnail[]
    productTypeId: string
    attributeId: string
    attributeValueId: string[]
    categoryId: string
    collectionId: string[]
    prices: Price[]
    tax: number
    variants: string[]
    status: Status

    constructor(data: ProductType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productId = data.productId ? data.productId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.url = data.url ? data.url : ''
        this.imageUrl = data.imageUrl ? data.imageUrl : ''
        this.thumbnailUrls = data.thumbnailUrls ? data.thumbnailUrls : []
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.attributeId = data.attributeId ? data.attributeId : ''
        this.attributeValueId = data.attributeValueId ? data.attributeValueId : []
        this.categoryId = data.categoryId ? data.categoryId : ''
        this.collectionId = data.collectionId ? data.collectionId : []
        this.prices = data.prices ? data.prices : []
        this.tax = data.tax ? data.tax : 0
        this.variants = data.variants ? data.variants : []
        this.status = data.status ? data.status : 'active'
    }

    get(): ProductInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productId: this.productId,
            name: this.name,
            description: this.description,
            url: this.url,
            imageUrl: this.imageUrl,
            thumbnailUrls: this.thumbnailUrls,
            productTypeId: this.productTypeId,
            attributeId: this.attributeId,
            attributeValueId: this.attributeValueId,
            categoryId: this.categoryId,
            collectionId: this.collectionId,
            prices: this.prices,
            tax: this.tax,
            variants: this.variants,
            status: this.status
        }
    }

}