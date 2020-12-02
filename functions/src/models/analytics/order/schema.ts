import { Timestamp, TimestampInterface, TimestampType } from "../../common/schema"

export type SaleAnalyticsGroupType = {
    sale?: SaleAnalyticsInterface[]
}

export interface SaleAnalyticsGroupInterface {
    sale: SaleAnalyticsInterface[]
}

export type SaleAnalyticsType = TimestampType & {
    variantId?: string[],
    sale?: number
    orderId?: string
}

export interface SaleAnalyticsInterface extends TimestampInterface {
    variantId: string[]
    sale: number
    orderId: string
}

export class SaleAnalyticsGroup implements SaleAnalyticsGroupInterface {
    sale: SaleAnalyticsInterface[]

    constructor(data: SaleAnalyticsGroupType) {
        this.sale = data.sale && data.sale.length > 0 ? data.sale.map(sale => new SaleAnalytics(sale)) : []
    }

    get(): SaleAnalyticsGroupInterface {
        return {
            sale: this.sale
        }
    }
}

export class SaleAnalytics extends Timestamp implements SaleAnalyticsType {
    variantId: string[]
    sale: number
    orderId: string

    constructor(data: SaleAnalyticsType) {
        super(data)
        this.variantId = data.variantId ? data.variantId : []
        this.sale = data.sale ? data.sale : 0
        this.orderId = data.orderId ? data.orderId : ''
    }

    get(): SaleAnalyticsInterface {
        return {
            ...super.get(),
            variantId: this.variantId,
            sale: this.sale,
            orderId: this.orderId
        }
    }
}
