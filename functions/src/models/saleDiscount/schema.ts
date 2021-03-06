import { Common, CommonInterface, CommonType, Condition, ValueType } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'

export interface SaleDiscountInterface extends CommonInterface {
    shopId: string
    saleDiscountId: string
    name: string
    valueType: ValueType
    value: number
    categoryId: string[]
    collectionId: string[]
    productId: string[]
    startDate: number
    endDate: number
}

export type SaleDiscountType = CommonType & {
    shopId: string
    saleDiscountId?: string
    name?: string
    valueType?: ValueType
    value?: number
    categoryId?: string[]
    collectionId?: string[]
    productId?: string[]
    startDate?: number
    endDate?: number
}

export class SaleDiscount extends Common implements SaleDiscountInterface {
    shopId: string
    saleDiscountId: string
    name: string
    valueType: ValueType
    value: number
    categoryId: string[]
    collectionId: string[]
    productId: string[]
    startDate: number
    endDate: number

    constructor(data: SaleDiscountType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.name = data.name ? data.name : ''
        this.valueType = data.valueType ? data.valueType : 'fixed'
        this.value = data.value ? data.value : 0
        this.categoryId = data.categoryId ? uniqueArr(data.categoryId) : []
        this.collectionId = data.collectionId ? uniqueArr(data.collectionId) : []
        this.productId = data.productId ? uniqueArr(data.productId) : []
        this.startDate = data.startDate ? data.startDate : -1
        this.endDate = data.endDate ? data.endDate : -1
    }

    get(): SaleDiscountInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            saleDiscountId: this.saleDiscountId,
            name: this.name,
            valueType: this.valueType,
            value: this.value,
            categoryId: this.categoryId,
            collectionId: this.collectionId,
            productId: this.productId,
            startDate: this.startDate,
            endDate: this.endDate
        }
    }

}

export type SaleDiscountCondition = Condition & {
    field: SaleDiscountFields
}

type SaleDiscountFields = keyof (SaleDiscountType)
