import { TimestampInterface, TimestampType, Datetime } from '../common/schema'
import { Timestamp } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

type SalesDiscountTypeType = 'percentage' | 'fixed' | ''

export interface SalesDiscountInterface extends TimestampInterface {
    shopId: string
    saleDiscountId: string
    name: string
    type: SalesDiscountTypeType
    value: number
    categoryId: string[]
    collectionId: string[]
    productId: string[]
    startDate: Datetime | null
    endDate: Datetime | null
}

export type SalesDiscountType = TimestampType & {
    shopId: string
    saleDiscountId?: string
    name?: string
    type?: SalesDiscountTypeType
    value?: number
    categoryId?: string[]
    collectionId?: string[]
    productId?: string[]
    startDate?: Datetime | null
    endDate?: Datetime | null
}

export class SalesDiscount extends Timestamp implements SalesDiscountInterface {
    shopId: string
    saleDiscountId: string
    name: string
    type: SalesDiscountTypeType
    value: number
    categoryId: string[]
    collectionId: string[]
    productId: string[]
    startDate: Datetime | null
    endDate: Datetime | null

    constructor(data: SalesDiscountType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.name = data.name ? data.name : ''
        this.type = data.type ? data.type : ''
        this.value = data.value ? data.value : 0
        this.categoryId = data.categoryId ? uniqueArr(data.categoryId) : []
        this.collectionId = data.collectionId ? uniqueArr(data.collectionId) : []
        this.productId = data.productId ? uniqueArr(data.productId) : []
        this.startDate = data.startDate ? data.startDate : null
        this.endDate = data.endDate ? data.endDate : null
    }

    get(): SalesDiscountInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            saleDiscountId: this.saleDiscountId,
            name: this.name,
            type: this.type,
            value: this.value,
            categoryId: this.categoryId,
            collectionId: this.collectionId,
            productId: this.productId,
            startDate: this.startDate,
            endDate: this.endDate
        }
    }

}
