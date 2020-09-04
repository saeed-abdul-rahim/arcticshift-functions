import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

export interface ProductTypeInterface extends TimestampInterface {
    shopId: string
    productTypeId: string
    name: string
    attributeId: string[]
    taxId: string
}

export type ProductTypeType = TimestampType & {
    shopId: string
    productTypeId?: string
    name?: string
    attributeId?: string[]
    taxId?: string
}

export class ProductType extends Timestamp implements ProductTypeInterface {
    shopId: string
    productTypeId: string
    name: string
    attributeId: string[]
    taxId: string

    constructor(data: ProductTypeType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.name = data.name ? data.name : ''
        this.attributeId = data.attributeId ? data.attributeId : []
        this.taxId = data.taxId ? data.taxId : ''
    }

    get(): ProductTypeInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productTypeId: this.productTypeId,
            name: this.name,
            attributeId: this.attributeId,
            taxId: this.taxId
        }
    }

}
