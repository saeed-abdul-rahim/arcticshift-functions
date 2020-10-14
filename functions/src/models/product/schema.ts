import { Common, CommonInterface, CommonType, Status, Condition, Tax, Content } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'

export interface ProductInterface extends CommonInterface {
    shopId: string
    productId: string
    name: string
    description: string
    keywords: string[]
    url: string
    images: Content[]
    productTypeId: string
    attributeId: string[]
    attributeValueId: string[]
    categoryId: string
    collectionId: string[]
    prices: Price[]
    price: number
    chargeTax: boolean
    tax: Tax | null
    variantId: string[]
    saleDiscountId: string
    voucherId: string
    status: Status
    like: number
    rating: number
}

export type ProductType = CommonType & {
    shopId?: string
    productId?: string
    name?: string
    description?: string
    keywords?: string[]
    url?: string
    images?: Content[]
    productTypeId?: string
    attributeId?: string[]
    attributeValueId?: string[]
    categoryId?: string
    collectionId?: string[]
    prices?: Price[]
    price?: number
    chargeTax?: boolean
    tax?: Tax | null
    variantId?: string[]
    saleDiscountId?: string
    voucherId?: string
    status?: Status
    like?: number
    rating?: number
}

export class Product extends Common implements ProductInterface {
    shopId: string
    productId: string
    name: string
    description: string
    keywords: string[]
    url: string
    images: Content[]
    productTypeId: string
    attributeId: string[]
    attributeValueId: string[]
    categoryId: string
    collectionId: string[]
    prices: Price[]
    price: number
    chargeTax: boolean
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
        this.images = data.images ? data.images : []
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.attributeId = data.attributeId ? data.attributeId : []
        this.attributeValueId = data.attributeValueId ? data.attributeValueId : []
        this.categoryId = data.categoryId ? data.categoryId : ''
        this.collectionId = data.collectionId ? uniqueArr(data.collectionId) : []
        this.prices = data.prices ? data.prices : []
        this.price = data.price ? data.price : 0
        this.chargeTax = data.chargeTax ? data.chargeTax : false
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
            images: this.images,
            productTypeId: this.productTypeId,
            attributeId: this.attributeId,
            attributeValueId: this.attributeValueId,
            categoryId: this.categoryId,
            collectionId: this.collectionId,
            prices: this.prices,
            price: this.price,
            chargeTax: this.chargeTax,
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
    field: ProductFields
    parentFields?: (keyof ProductType)[]
}

type ProductFields = keyof (ProductType & Price & Content)

type Price = {
    name: string
    value: string
}
