import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'

export interface AttributeValueInterface extends CommonInterface {
    shopId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string
}

export type AttributeValueType = CommonType & {
    shopId?: string
    attributeId?: string
    code?: string
    name?: string
    attributeValueId?: string
}

export class AttributeValue extends Common implements AttributeValueInterface {
    shopId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string

    constructor(data: AttributeValueType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.attributeId = data.attributeId ? data.attributeId : ''
        this.code = data.code ? data.code : ''
        this.name = data.name ? data.name : ''
        this.attributeValueId = data.attributeValueId ? data.attributeValueId : ''
    }

    get(): AttributeValueInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            attributeId: this.attributeId,
            code: this.code,
            name: this.name,
            attributeValueId: this.attributeValueId
        }
    }

}
