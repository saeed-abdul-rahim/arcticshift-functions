import { Condition, CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

export interface ProductTypeInterface extends CommonInterface {
    shopId: string
    productTypeId: string
    name: string
    productAttributeId: string[]
    variantAttributeId: string[]
    taxId: string
}

export type ProductTypeType = CommonType & {
    shopId: string
    productTypeId?: string
    name?: string
    productAttributeId?: string[]
    variantAttributeId?: string[]
    taxId?: string
}

export class ProductType extends Common implements ProductTypeInterface {
    shopId: string
    productTypeId: string
    name: string
    productAttributeId: string[]
    variantAttributeId: string[]
    taxId: string

    constructor(data: ProductTypeType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.name = data.name ? data.name : ''
        this.productAttributeId = data.productAttributeId ? uniqueArr(data.productAttributeId) : []
        this.variantAttributeId = data.variantAttributeId ? uniqueArr(data.variantAttributeId) : []
        this.taxId = data.taxId ? data.taxId : ''
    }

    get(): ProductTypeInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productTypeId: this.productTypeId,
            name: this.name,
            productAttributeId: this.productAttributeId,
            variantAttributeId: this.variantAttributeId,
            taxId: this.taxId
        }
    }

}

export type ProductTypeCondition = Condition & {
    field: keyof ProductTypeType
}
