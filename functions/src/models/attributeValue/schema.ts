import { Common, CommonInterface, CommonType, Condition } from '../common/schema'

export interface AttributeValueInterface extends CommonInterface {
    shopId: string
    productTypeId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string
}

export type AttributeValueType = CommonType & {
    shopId?: string
    productTypeId?: string
    attributeId?: string
    code?: string
    name?: string
    attributeValueId?: string
}

export class AttributeValue extends Common implements AttributeValueInterface {
    shopId: string
    productTypeId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string

    constructor(data: AttributeValueType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.attributeId = data.attributeId ? data.attributeId : ''
        this.code = data.code ? data.code : ''
        this.name = data.name ? data.name : ''
        this.attributeValueId = data.attributeValueId ? data.attributeValueId : ''
    }

    get(): AttributeValueInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productTypeId: this.productTypeId,
            attributeId: this.attributeId,
            code: this.code,
            name: this.name,
            attributeValueId: this.attributeValueId
        }
    }

}

export type AttributeValueCondition = Condition & {
    field: keyof AttributeValueType
}
