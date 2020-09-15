import { TimestampInterface, TimestampType, Status } from '../common/schema'
import { Timestamp } from '../common'

export interface GiftCardInterface extends TimestampInterface {
    shopId: string
    giftCardId: string
    userId: string
    name: string
    code: string
    lastUsed: number
    initialBalance: number
    currentBalance: number
    status: Status
}

export type GiftCardType = TimestampType & {
    shopId: string
    giftCardId?: string
    userId?: string
    name?: string
    code?: string
    lastUsed?: number
    initialBalance?: number
    currentBalance?: number
    status?: Status
}

export class GiftCard extends Timestamp implements GiftCardInterface {
    shopId: string
    giftCardId: string
    userId: string
    name: string
    code: string
    lastUsed: number
    initialBalance: number
    currentBalance: number
    status: Status

    constructor(data: GiftCardType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.giftCardId = data.giftCardId ? data.giftCardId : ''
        this.userId = data.userId ? data.userId : ''
        this.name = data.name ? data.name : ''
        this.code = data.code ? data.code : ''
        this.lastUsed = data.lastUsed ? data.lastUsed : -1
        this.initialBalance = data.initialBalance ? data.initialBalance : 0
        this.currentBalance = data.currentBalance ? data.currentBalance : 0
        this.status = data.status ? data.status : 'active'
    }

    get(): GiftCardInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            giftCardId: this.giftCardId,
            userId: this.userId,
            name: this.name,
            code: this.code,
            lastUsed: this.lastUsed,
            initialBalance: this.initialBalance,
            currentBalance: this.currentBalance,
            status: this.status
        }
    }

}
