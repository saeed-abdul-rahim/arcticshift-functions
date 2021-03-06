import { uniqueArr } from '../../utils/arrayUtils'
import { Common, CommonInterface, CommonType, Address, Condition } from '../common/schema'

export interface WarehouseInterface extends CommonInterface {
    shopId: string
    warehouseId: string
    name: string
    address: Address | null
    shippingId: string[]
    pointLocation: Point | null
}

export type WarehouseType = CommonType & {
    shopId: string
    warehouseId?: string
    name?: string
    address?: Address | null
    shippingId?: string[]
    pointLocation?: Point | null
}

export class Warehouse extends Common implements WarehouseInterface {
    shopId: string
    warehouseId: string
    name: string
    address: Address | null
    shippingId: string[]
    pointLocation: Point | null

    constructor(data: WarehouseType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.warehouseId = data.warehouseId ? data.warehouseId : ''
        this.name = data.name ? data.name : ''
        this.address = data.address ? data.address : null
        this.shippingId = data.shippingId ? uniqueArr(data.shippingId) : []
        this.pointLocation = data.pointLocation ? data.pointLocation : null
    }

    get(): WarehouseInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            warehouseId: this.warehouseId,
            name: this.name,
            address: this.address,
            shippingId: this.shippingId,
            pointLocation: this.pointLocation
        }
    }

}

export type WarehouseCondition = Condition & {
    field: WarehouseFields
    parentFields?: (keyof WarehouseType)[]
}

type WarehouseFields = keyof (WarehouseType & Address)

type Point = {
    lat: number,
    lon: number
}