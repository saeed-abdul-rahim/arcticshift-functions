import { CommonInterface, CommonType, Condition, ContentStorage } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface VariantInterface extends CommonInterface {
    shopId: string
    productId: string
    variantId: string
    sku: string
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
    variantIds: string[]
    like: number
    rating: number
    trackInventory: boolean
    warehouse: WarehouseInventory[]
    quantity: number
    bookedQuantity: number
}

export type VariantType = CommonType & {
    shopId: string
    productId?: string
    variantId?: string
    sku?: string
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
    variantIds?: string[]
    like?: number
    rating?: number
    trackInventory?: boolean
    warehouse?: WarehouseInventory[]
    quantity?: number
    bookedQuantity?: number
}

export class Variant extends Common implements VariantInterface {
    shopId: string
    productId: string
    variantId: string
    sku: string
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
    variantIds: string[]
    like: number
    rating: number
    trackInventory: boolean
    warehouse: WarehouseInventory[]
    quantity: number
    bookedQuantity: number

    constructor(data: VariantType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productId = data.productId ? data.productId : ''
        this.variantId = data.variantId ? data.variantId : ''
        this.sku = data.sku ? data.sku : ''
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
        this.variantIds = data.variantIds ? uniqueArr(data.variantIds) : []
        this.like = data.like ? data.like : 0
        this.rating = data.rating ? data.rating : 0
        this.trackInventory = data.trackInventory ? data.trackInventory : false
        this.warehouse = data.warehouse ? data.warehouse : []
        this.quantity = data.quantity ? data.quantity : 0
        this.bookedQuantity = data.bookedQuantity ? data.bookedQuantity : 0
    }

    get(): VariantInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productId: this.productId,
            variantId: this.variantId,
            sku: this.sku,
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
            variantIds: this.variantIds,
            like: this.like,
            rating: this.rating,
            trackInventory: this.trackInventory,
            warehouse: this.warehouse,
            quantity: this.quantity,
            bookedQuantity: this.bookedQuantity
        }
    }

}

export type VariantCondition = Condition & {
    field: VariantFields
    parentFields?: (keyof VariantType)[]
}

type VariantFields = keyof (VariantType & Thumbnail & Price & AttributeValue)

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

type WarehouseInventory = {
    warehouseId: string
    quantity: number
}
