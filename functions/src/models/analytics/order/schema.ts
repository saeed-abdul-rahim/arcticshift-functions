import { Timestamp, TimestampInterface, TimestampType } from "../../common/schema"

export type SaleAnalyticsGroupType = {
    sales?: SaleAnalyticsInterface[]
}

export interface SaleAnalyticsGroupInterface {
    sales: SaleAnalyticsInterface[]
}

export type SaleAnalyticsType = TimestampType & {
    variantId?: string[],
    sale?: number
}

export interface SaleAnalyticsInterface extends TimestampInterface {
    variantId: string[]
    sale: number
}

export class SaleAnalyticsGroup implements SaleAnalyticsGroupInterface {
    sales: SaleAnalyticsInterface[]

    constructor(data: SaleAnalyticsGroupType) {
        this.sales = data.sales && data.sales.length > 0 ? data.sales.map(sale => new SaleAnalytics(sale)) : []
    }

    get(): SaleAnalyticsGroupInterface {
        return {
            sales: this.sales
        }
    }
}

export class SaleAnalytics extends Timestamp implements SaleAnalyticsType {
    variantId: string[]
    sale: number

    constructor(data: SaleAnalyticsType) {
        super(data)
        this.variantId = data.variantId ? data.variantId : []
        this.sale = data.sale ? data.sale : 0
    }

    get(): SaleAnalyticsInterface {
        return {
            ...super.get(),
            variantId: this.variantId,
            sale: this.sale
        }
    }
}
