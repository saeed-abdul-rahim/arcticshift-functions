import { TimestampInterface, TimestampType } from '../common/schema'
import { Timestamp } from '../common'

type WarehouseInventory = {
    warehouseId: string
    quantity: number
}

export interface InventoryInterface extends TimestampInterface {
    shopId: string
    variantId: string
    warehouse: WarehouseInventory[]
    totalWarehouseQuantity: number
    bookedQuantity: number
}

export type InventoryType = TimestampType & {
    shopId: string
    variantId: string
    warehouse: WarehouseInventory[]
    totalWarehouseQuantity?: number
    bookedQuantity?: number
}

export class Inventory extends Timestamp implements InventoryInterface {
    shopId: string
    variantId: string
    warehouse: WarehouseInventory[]
    totalWarehouseQuantity: number
    bookedQuantity: number

    constructor(data: InventoryType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.variantId = data.variantId
        this.warehouse = data.warehouse ? data.warehouse : []
        this.totalWarehouseQuantity = data.totalWarehouseQuantity ? data.totalWarehouseQuantity : 0
        this.bookedQuantity = data.bookedQuantity ? data.bookedQuantity : 0
    }

    get(): InventoryInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            variantId: this.variantId,
            warehouse: this.warehouse,
            totalWarehouseQuantity: this.totalWarehouseQuantity,
            bookedQuantity: this.bookedQuantity
        }
    }

}
