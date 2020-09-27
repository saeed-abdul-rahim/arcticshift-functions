import { Common, CommonInterface, CommonType, Datetime, ValueType } from '../common/schema'
import { valueTypes } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

type VoucherTypeType = ValueType | 'shipping'
type MinimumRequirementType = 'orderValue' | 'quantity'

type MinimumRequirement = {
    type: MinimumRequirementType
    value: number
} | null

export const voucherValueTypes: VoucherTypeType[] = [ ...valueTypes, 'shipping' ]
export const minimumRequirementTypes: MinimumRequirementType[] = [ 'orderValue', 'quantity' ]

export interface VoucherInterface extends CommonInterface {
    shopId: string
    voucherId: string
    code: string
    valueType: VoucherTypeType
    value: number
    entireOrder: boolean
    oncePerOrder: boolean
    categoryId: string[]
    collectionId: string[]
    productId: string[]
    minimumRequirement: MinimumRequirement
    totalUsage: number
    onePerUser: boolean
    startDate: Datetime | null
    endDate: Datetime | null
}

export type VoucherType = CommonType & {
    shopId: string
    voucherId?: string
    code?: string
    valueType?: VoucherTypeType
    value?: number
    entireOrder?: boolean
    oncePerOrder?: boolean
    categoryId?: string[]
    collectionId?: string[]
    productId?: string[]
    minimumRequirement?: MinimumRequirement
    totalUsage?: number
    onePerUser?: boolean
    startDate?: Datetime | null
    endDate?: Datetime | null
}

export class Voucher extends Common implements VoucherInterface {
    shopId: string
    voucherId: string
    code: string
    valueType: VoucherTypeType
    value: number
    entireOrder: boolean
    oncePerOrder: boolean
    categoryId: string[]
    collectionId: string[]
    productId: string[]
    minimumRequirement: MinimumRequirement
    totalUsage: number
    onePerUser: boolean
    startDate: Datetime | null
    endDate: Datetime | null

    constructor(data: VoucherType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.voucherId = data.voucherId ? data.voucherId : ''
        this.code = data.code ? data.code : ''
        this.valueType = data.valueType ? data.valueType : 'fixed'
        this.value = data.value ? data.value : 0
        this.entireOrder = data.entireOrder ? data.entireOrder : true
        this.oncePerOrder = data.oncePerOrder ? data.oncePerOrder : false
        this.categoryId = data.categoryId ? uniqueArr(data.categoryId) : []
        this.collectionId = data.collectionId ? uniqueArr(data.collectionId) : []
        this.productId = data.productId ? uniqueArr(data.productId) : []
        this.minimumRequirement = data.minimumRequirement ? data.minimumRequirement : null
        this.totalUsage = data.totalUsage ? data.totalUsage : -1
        this.onePerUser = data.onePerUser ? data.onePerUser : false
        this.startDate = data.startDate ? data.startDate : null
        this.endDate = data.endDate ? data.endDate : null
    }

    get(): VoucherInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            voucherId: this.voucherId,
            code: this.code,
            valueType: this.valueType,
            value: this.value,
            entireOrder: this.entireOrder,
            oncePerOrder: this.oncePerOrder,
            categoryId: this.categoryId,
            collectionId: this.collectionId,
            productId: this.productId,
            minimumRequirement: this.minimumRequirement,
            totalUsage: this.totalUsage,
            onePerUser: this.onePerUser,
            startDate: this.startDate,
            endDate: this.endDate
        }
    }

}
