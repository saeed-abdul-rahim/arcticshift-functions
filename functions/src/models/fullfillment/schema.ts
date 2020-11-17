import { uniqueArr } from "../../utils/arrayUtils";
import { Common, CommonInterface, CommonType, Condition, FullfillmentStatus, OrderBy } from "../common/schema";

export interface FullfillmentInterface extends CommonInterface {
    orderId: string
    fullfillmentId: string
    fullfillmentStatus: FullfillmentStatus
    warehouseId: string
    variantId: string[]
    trackingId: string
}

export type FullfillmentType = CommonType & {
    orderId?: string
    fullfillmentId?: string
    fullfillmentStatus?: FullfillmentStatus
    warehouseId?: string
    variantId?: string[]
    trackingId?: string
}

export class Fullfillment extends Common implements FullfillmentInterface {
    orderId: string
    fullfillmentId: string
    fullfillmentStatus: FullfillmentStatus
    warehouseId: string
    variantId: string[]
    trackingId: string

    constructor(data: FullfillmentType) {
        super(data)
        this.orderId = data.orderId ? data.orderId : ''
        this.fullfillmentId = data.fullfillmentId ? data.fullfillmentId : ''
        this.fullfillmentStatus = data.fullfillmentStatus ? data.fullfillmentStatus : 'unfullfilled'
        this.warehouseId = data.warehouseId ? data.warehouseId : ''
        this.variantId = data.variantId ? uniqueArr(data.variantId) : []
        this.trackingId = data.trackingId ? data.trackingId : ''
    }

    get(): FullfillmentInterface {
        return {
            ...super.get(),
            orderId: this.orderId,
            fullfillmentId: this.fullfillmentId,
            fullfillmentStatus: this.fullfillmentStatus,
            warehouseId: this.warehouseId,
            variantId: this.variantId,
            trackingId: this.trackingId
        }
    }
}

export type FullfillmentCondition = Condition & {
    field: FullfillmentFields
}

export type FullfillmentOrderBy = OrderBy & {
    field: FullfillmentFields
}

type FullfillmentFields = keyof FullfillmentInterface
