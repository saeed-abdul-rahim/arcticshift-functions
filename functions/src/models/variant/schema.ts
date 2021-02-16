import { ObjString, Common, CommonInterface, CommonType, Condition, Content, ObjNumber, Price } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'
import { SaleDiscountInterface } from '../saleDiscount/schema'

export interface VariantInterface extends CommonInterface {
    shopId: string
    productId: string
    variantId: string
    sku: string
    name: string
    productName: string
    description: string
    keywords: string[]
    url: string
    images: Content[]
    productTypeId: string
    attributes: ObjString
    prices: Price[]
    price: number
    saleDiscountId: string
    saleDiscount: SaleDiscountInterface | null
    variantIds: string[]
    like: number
    rating: number
    trackInventory: boolean
    warehouseQuantity: ObjNumber
    quantity: number
    bookedQuantity: number
}

export type VariantType = CommonType & {
    shopId?: string
    productId?: string
    variantId?: string
    sku?: string
    name?: string
    productName?: string
    description?: string
    keywords?: string[]
    url?: string
    images?: Content[]
    productTypeId?: string
    attributes?: ObjString
    prices?: Price[]
    price?: number
    saleDiscountId?: string
    saleDiscount?: SaleDiscountInterface | null
    variantIds?: string[]
    like?: number
    rating?: number
    trackInventory?: boolean
    warehouseQuantity?: ObjNumber
    quantity?: number
    bookedQuantity?: number
}

export class Variant extends Common implements VariantInterface {
    shopId: string
    productId: string
    variantId: string
    sku: string
    name: string
    productName: string
    description: string
    keywords: string[]
    url: string
    images: Content[]
    productTypeId: string
    attributes: ObjString
    prices: Price[]
    price: number
    saleDiscountId: string
    saleDiscount: SaleDiscountInterface | null
    variantIds: string[]
    like: number
    rating: number
    trackInventory: boolean
    warehouseQuantity: ObjNumber
    quantity: number
    bookedQuantity: number

    constructor(data: VariantType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productId = data.productId ? data.productId : ''
        this.variantId = data.variantId ? data.variantId : ''
        this.sku = data.sku ? data.sku : ''
        this.name = data.name ? data.name : ''
        this.productName = data.productName ? data.productName : ''
        this.description = data.description ? data.description : ''
        this.keywords = data.keywords ? data.keywords : []
        this.url = data.url ? data.url : ''
        this.images = data.images ? data.images : []
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.attributes = data.attributes ? data.attributes : null
        this.prices = data.prices ? data.prices : []
        this.price = data.price ? data.price : 0
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.saleDiscount = data.saleDiscount ? data.saleDiscount : null
        this.variantIds = data.variantIds ? uniqueArr(data.variantIds) : []
        this.like = data.like ? data.like : 0
        this.rating = data.rating ? data.rating : 0
        this.trackInventory = data.trackInventory ? data.trackInventory : false
        this.warehouseQuantity = data.warehouseQuantity ? data.warehouseQuantity : null
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
            productName: this.productName,
            description: this.description,
            keywords: this.keywords,
            url: this.url,
            images: this.images,
            productTypeId: this.productTypeId,
            attributes: this.attributes,
            prices: this.prices,
            price: this.price,
            saleDiscountId: this.saleDiscountId,
            saleDiscount: this.saleDiscount,
            variantIds: this.variantIds,
            like: this.like,
            rating: this.rating,
            trackInventory: this.trackInventory,
            warehouseQuantity: this.warehouseQuantity,
            quantity: this.quantity,
            bookedQuantity: this.bookedQuantity
        }
    }

}

export type VariantCondition = Condition & {
    field: VariantFields
    parentFields?: (keyof VariantType)[]
}

type VariantFields = keyof (VariantType) | string
