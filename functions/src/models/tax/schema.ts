import { Common, CommonInterface, CommonType, ValueType } from '../common/schema'

export type TaxObjectType = 'shop' | 'shipping' | 'product' | ''

export interface TaxInterface extends CommonInterface {
    shopId: string
    taxId: string
    name: string
    value: number
    valueType: ValueType
    type: TaxObjectType
}

export type TaxType = CommonType & {
    shopId?: string
    taxId?: string
    name?: string
    value?: number
    valueType?: ValueType
    type?: TaxObjectType
}

export class Tax extends Common implements TaxInterface {
    shopId: string
    taxId: string
    name: string
    value: number
    valueType: ValueType
    type: TaxObjectType

    constructor(data: TaxType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.taxId = data.taxId ? data.taxId : ''
        this.name = data.name ? data.name : ''
        this.value = data.value ? data.value : 0
        this.valueType = data.valueType ? data.valueType : 'fixed'
        this.type = data.type ? data.type : ''
    }

    get(): TaxInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            taxId: this.taxId,
            name: this.name,
            value: this.value,
            valueType: this.valueType,
            type: this.type
        }
    }

}
