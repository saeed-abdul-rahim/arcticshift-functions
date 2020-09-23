import { Condition, CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'

export interface InventoryInterface extends CommonInterface {
    shopId: string
    variantId: string
    warehouse: WarehouseInventory[]
    totalWarehouseQuantity: number
    bookedQuantity: number
}

export type InventoryType = CommonType & {
    shopId: string
    variantId: string
    warehouse: WarehouseInventory[]
    totalWarehouseQuantity?: number
    bookedQuantity?: number
}

export class Inventory extends Common implements InventoryInterface {
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

export type InventoryCondition = Condition & {
    field: InventoryFields
    parentFields?: (keyof InventoryType)[]
}

type InventoryFields = keyof (InventoryType & WarehouseInventory)

type WarehouseInventory = {
    warehouseId: string
    quantity: number
}
