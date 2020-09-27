import { Common, CommonInterface, CommonType, Address, Condition } from '../common/schema'

export interface WarehouseInterface extends CommonInterface {
    shopId: string
    warehouseId: string
    name: string
    address: Address | null
    shippingId: string
}

export type WarehouseType = CommonType & {
    shopId: string
    warehouseId?: string
    name?: string
    address?: Address | null
    shippingId?: string
}

export class Warehouse extends Common implements WarehouseInterface {
    shopId: string
    warehouseId: string
    name: string
    address: Address | null
    shippingId: string

    constructor(data: WarehouseType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.warehouseId = data.warehouseId ? data.warehouseId : ''
        this.name = data.name ? data.name : ''
        this.address = data.address ? data.address : null
        this.shippingId = data.shippingId ? data.shippingId : ''
    }

    get(): WarehouseInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            warehouseId: this.warehouseId,
            name: this.name,
            address: this.address,
            shippingId: this.shippingId
        }
    }

}

export type WarehouseCondition = Condition & {
    field: WarehouseFields
    parentFields?: (keyof WarehouseType)[]
}

type WarehouseFields = keyof (WarehouseType & Address)
