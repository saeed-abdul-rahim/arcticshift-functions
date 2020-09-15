import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

type TaxValueType = 'fixed' | 'percent' | ''

export interface TaxInterface extends TimestampInterface {
    shopId: string
    taxId: string
    name: string
    value: number
    type: TaxValueType
}

export type TaxType = TimestampType & {
    shopId?: string
    taxId?: string
    name?: string
    value?: number
    type?: TaxValueType
}

export class Tax extends Timestamp implements TaxInterface {
    shopId: string
    taxId: string
    name: string
    value: number
    type: TaxValueType

    constructor(data: TaxType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.taxId = data.taxId ? data.taxId : ''
        this.name = data.name ? data.name : ''
        this.value = data.value ? data.value : 0
        this.type = data.type ? data.type : ''
    }

    get(): TaxInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            taxId: this.taxId,
            name: this.name,
            value: this.value,
            type: this.type
        }
    }

}
