import { Condition, Common, CommonInterface, CommonType } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'

export interface ProductTypeInterface extends CommonInterface {
    shopId: string
    productTypeId: string
    name: string
    productId: string[]
    productAttributeId: string[]
    variantAttributeId: string[]
    taxId: string
    weight: number
}

export type ProductTypeType = CommonType & {
    shopId: string
    productTypeId?: string
    name?: string
    productId?: string[]
    productAttributeId?: string[]
    variantAttributeId?: string[]
    taxId?: string
    weight?: number
}

export class ProductType extends Common implements ProductTypeInterface {
    shopId: string
    productTypeId: string
    name: string
    productId: string[]
    productAttributeId: string[]
    variantAttributeId: string[]
    taxId: string
    weight: number

    constructor(data: ProductTypeType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.productTypeId = data.productTypeId ? data.productTypeId : ''
        this.name = data.name ? data.name : ''
        this.productId = data.productId ? uniqueArr(data.productId) : []
        this.productAttributeId = data.productAttributeId ? uniqueArr(data.productAttributeId) : []
        this.variantAttributeId = data.variantAttributeId ? uniqueArr(data.variantAttributeId) : []
        this.taxId = data.taxId ? data.taxId : ''
        this.weight = data.weight ? data.weight : -1
    }

    get(): ProductTypeInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            productTypeId: this.productTypeId,
            name: this.name,
            productId: this.productId,
            productAttributeId: this.productAttributeId,
            variantAttributeId: this.variantAttributeId,
            taxId: this.taxId,
            weight: this.weight
        }
    }

}

export type ProductTypeCondition = Condition & {
    field: keyof ProductTypeType
}
