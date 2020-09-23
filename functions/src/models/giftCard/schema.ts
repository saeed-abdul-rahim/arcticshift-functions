import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'

export interface GiftCardInterface extends CommonInterface {
    shopId: string
    giftCardId: string
    userId: string
    name: string
    code: string
    lastUsed: number
    initialBalance: number
    currentBalance: number
}

export type GiftCardType = CommonType & {
    shopId: string
    giftCardId?: string
    userId?: string
    name?: string
    code?: string
    lastUsed?: number
    initialBalance?: number
    currentBalance?: number
}

export class GiftCard extends Common implements GiftCardInterface {
    shopId: string
    giftCardId: string
    userId: string
    name: string
    code: string
    lastUsed: number
    initialBalance: number
    currentBalance: number

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
            currentBalance: this.currentBalance
        }
    }

}
