import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

export interface AttributeValueInterface extends TimestampInterface {
    shopId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string
}

export type AttributeValueType = TimestampType & {
    shopId?: string
    attributeId?: string
    code?: string
    name?: string
    attributeValueId?: string
}

export class AttributeValue extends Timestamp implements AttributeValueInterface {
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
