import { Common, CommonInterface, CommonType, Condition } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'

export interface AttributeInterface extends CommonInterface {
    shopId: string
    productTypeId: string[]
    productId: string[]
    variantId: string[]
    attributeId: string
    code: string
    name: string
    attributeValueId: string[]
}

export type AttributeType = CommonType & {
    shopId?: string
    productTypeId?: string[]
    productId?: string[]
    variantId?: string[]
    attributeId?: string
    code?: string
    name?: string
    attributeValueId?: string[]
}

export class Attribute extends Common implements AttributeInterface {
    shopId: string
    productTypeId: string[]
    productId: string[]
    variantId: string[]
    attributeId: string
    code: string
    name: string
    attributeValueId: string[]

    constructor(data: AttributeType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productTypeId = data.productTypeId ? uniqueArr(data.productTypeId) : []
        this.productId = data.productId ? uniqueArr(data.productId) : []
        this.variantId = data.variantId ? uniqueArr(data.variantId) : []
        this.attributeId = data.attributeId ? data.attributeId : ''
        this.code = data.code ? data.code : ''
        this.name = data.name ? data.name : ''
        this.attributeValueId = data.attributeValueId ? uniqueArr(data.attributeValueId) : []
    }

    get(): AttributeInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productTypeId: this.productTypeId,
            productId: this.productId,
            variantId: this.variantId,
            attributeId: this.attributeId,
            code: this.code,
            name: this.name,
            attributeValueId: this.attributeValueId
        }
    }

}

export type AttributeCondition = Condition & {
    field: keyof AttributeType
}
