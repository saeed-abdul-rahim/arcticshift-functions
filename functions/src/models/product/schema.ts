import { TimestampInterface, TimestampType, Status, Condition, ContentStorage, Tax } from '../common/schema'
import { Timestamp } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

type Thumbnail = {
    size: string
    image: ContentStorage | null
}

type Price = {
    name: string
    value: string
}

type AttributeValue = {
    [key: string]: boolean
} | null

export interface ProductInterface extends TimestampInterface {
    shopId: string
    productId: string
    name: string
    description: string
    keywords: string[]
    url: string
    image: ContentStorage | null
    thumbnailUrls: Thumbnail[]
    productTypeId: string
    attribute: AttributeValue
    attributeValue: AttributeValue
    categoryId: string
    collectionId: string[]
    prices: Price[]
    price: number
    tax: Tax | null
    variantId: string[]
    saleDiscountId: string
    voucherId: string
    status: Status
    like: number
    rating: number
}

export type ProductType = TimestampType & {
    shopId?: string
    productId?: string
    name?: string
    description?: string
    keywords?: string[]
    url?: string
    image?: ContentStorage | null
    thumbnailUrls?: Thumbnail[]
    productTypeId?: string
    attribute?: AttributeValue
    attributeValue?: AttributeValue
    categoryId?: string
    collectionId?: string[]
    prices?: Price[]
    price?: number
    tax?: Tax | null
    variantId?: string[]
    saleDiscountId?: string
    voucherId?: string
    status?: Status
    like?: number
    rating?: number
}

export class Product extends Timestamp implements ProductInterface {
    shopId: string
    productId: string
    name: string
    description: string
    keywords: string[]
    url: string
    image: ContentStorage | null
    thumbnailUrls: Thumbnail[]
    productTypeId: string
    attribute: AttributeValue
    attributeValue: AttributeValue
    categoryId: string
    collectionId: string[]
    prices: Price[]
    price: number
    tax: Tax | null
    variantId: string[]
    saleDiscountId: string
    voucherId: string
    status: Status
    like: number
    rating: number

    constructor(data: ProductType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productId = data.productId ? data.productId : ''
        this.name = data.name ? data.name : ''
        this.description = data.description ? data.description : ''
        this.keywords = data.keywords ? data.keywords : []
        this.url = data.url ? data.url : ''
        this.image = data.image ? data.image : null
        this.thumbnailUrls = data.thumbnailUrls ? data.thumbnailUrls : []
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.attribute = data.attribute ? data.attribute : null
        this.attributeValue = data.attributeValue ? data.attributeValue : null
        this.categoryId = data.categoryId ? data.categoryId : ''
        this.collectionId = data.collectionId ? uniqueArr(data.collectionId) : []
        this.prices = data.prices ? data.prices : []
        this.price = data.price ? data.price : 0
        this.tax = data.tax ? data.tax : null
        this.variantId = data.variantId ? uniqueArr(data.variantId) : []
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.voucherId = data.voucherId ? data.voucherId : ''
        this.status = data.status ? data.status : 'active'
        this.like = data.like ? data.like : 0
        this.rating = data.rating ? data.rating : 0
    }

    get(): ProductInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productId: this.productId,
            name: this.name,
            description: this.description,
            keywords: this.keywords,
            url: this.url,
            image: this.image,
            thumbnailUrls: this.thumbnailUrls,
            productTypeId: this.productTypeId,
            attribute: this.attribute,
            attributeValue: this.attributeValue,
            categoryId: this.categoryId,
            collectionId: this.collectionId,
            prices: this.prices,
            price: this.price,
            tax: this.tax,
            variantId: this.variantId,
            saleDiscountId: this.saleDiscountId,
            voucherId: this.voucherId,
            status: this.status,
            like: this.like,
            rating: this.rating
        }
    }

}

export type ProductCondition = Condition & {
    field: keyof ProductType
}
