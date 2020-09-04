import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

export interface AttributeInterface extends TimestampInterface {
    shopId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string[]
}

export type AttributeType = TimestampType & {
    shopId: string
    attributeId?: string
    code?: string
    name?: string
    attributeValueId?: string[]
}

export class Attribute extends Timestamp implements AttributeInterface {
    shopId: string
    attributeId: string
    code: string
    name: string
    attributeValueId: string[]

    constructor(data: AttributeType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.attributeId = data.attributeId ? data.attributeId : ''
        this.code = data.code ? data.code : ''
        this.name = data.name ? data.name : ''
        this.attributeValueId = data.attributeValueId ? data.attributeValueId : []
    }

    get(): AttributeInterface {
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
