import { Common, CommonInterface, CommonType, Address, Condition, OrderBy } from '../common/schema'

export type OrderStatus = 'draft' | 'unfulfilled' | 'partiallyFulfilled' | 'fulfilled' | 'cancelled' | ''
export type PaymentStatus = 'notCharged' | 'partiallyCharged' | 'fullyCharged' | 'partiallyRefunded' | 'fullyRefunded' | ''

export type VariantQuantity = {
    variantId: string
    quantity: number
}

export interface OrderInterface extends CommonInterface {
    shopId: string
    userId: string
    customerName: string
    orderId: string
    orderNo: number
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    billingAddress: Address | null
    shippingAddress: Address | null
    shippingRateId: string
    voucherId: string
    giftCardId: string
    shippingId: string
    variants: VariantQuantity[]
    fullfilled: Fulfilled[]
    subTotal: number
    saleDiscount: number
    voucherDiscount: number
    giftCardDiscount: number
    taxCharge: number
    shippingCharge: number
    total: number
    payment: Payment[]
    data: any
}

export type OrderType = CommonType & {
    shopId?: string
    userId?: string
    customerName?: string
    orderId?: string
    orderNo?: number
    orderStatus?: OrderStatus
    paymentStatus?: PaymentStatus
    billingAddress?: Address | null
    shippingAddress?: Address | null
    shippingRateId?: string
    voucherId?: string
    giftCardId?: string
    shippingId?: string
    variants?: VariantQuantity[]
    fullfilled?: Fulfilled[]
    subTotal?: number
    saleDiscount?: number
    voucherDiscount?: number
    giftCardDiscount?: number
    taxCharge?: number
    shippingCharge?: number
    total?: number
    payment?: Payment[]
    data?: any
}

export class Order extends Common implements OrderInterface {
    shopId: string
    userId: string
    customerName: string
    orderId: string
    orderNo: number
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    billingAddress: Address | null
    shippingAddress: Address | null
    shippingRateId: string
    voucherId: string
    giftCardId: string
    shippingId: string
    variants: VariantQuantity[]
    fullfilled: Fulfilled[]
    subTotal: number
    saleDiscount: number
    voucherDiscount: number
    giftCardDiscount: number
    taxCharge: number
    shippingCharge: number
    total: number
    payment: Payment[]
    data: any

    constructor(data: OrderType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.userId = data.userId ? data.userId : ''
        this.customerName = data.customerName ? data.customerName : ''
        this.orderId = data.orderId ? data.orderId : ''
        this.orderNo = data.orderNo ? data.orderNo : 0
        this.orderStatus = data.orderStatus ? data.orderStatus : ''
        this.paymentStatus = data.paymentStatus ? data.paymentStatus : ''
        this.billingAddress = data.billingAddress ? data.billingAddress : null
        this.shippingAddress = data.shippingAddress ? data.shippingAddress : null
        this.shippingRateId = data.shippingRateId ? data.shippingRateId : ''
        this.voucherId = data.voucherId ? data.voucherId : ''
        this.giftCardId = data.giftCardId ? data.giftCardId : ''
        this.shippingId = data.shippingId ? data.shippingId : ''
        this.variants = data.variants ? data.variants : []
        this.fullfilled = data.fullfilled ? data.fullfilled : []
        this.subTotal = data.subTotal ? data.subTotal : 0
        this.saleDiscount = data.saleDiscount ? data.saleDiscount : 0
        this.voucherDiscount = data.voucherDiscount ? data.voucherDiscount : 0
        this.giftCardDiscount = data.giftCardDiscount ? data.giftCardDiscount : 0
        this.taxCharge = data.taxCharge ? data.taxCharge : 0
        this.shippingCharge = data.shippingCharge ? data.shippingCharge : 0
        this.total = data.total ? data.total : 0
        this.payment = data.payment ? data.payment : []
        this.data = data.data ? data.data : null
    }

    get(): OrderInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            userId: this.userId,
            customerName: this.customerName,
            orderId: this.orderId,
            orderNo: this.orderNo,
            orderStatus: this.orderStatus,
            paymentStatus: this.paymentStatus,
            billingAddress: this.billingAddress,
            shippingAddress: this.shippingAddress,
            shippingRateId: this.shippingRateId,
            voucherId: this.voucherId,
            giftCardId: this.giftCardId,
            shippingId: this.shippingId,
            variants: this.variants,
            fullfilled: this.fullfilled,
            subTotal: this.subTotal,
            saleDiscount: this.saleDiscount,
            voucherDiscount: this.voucherDiscount,
            giftCardDiscount: this.giftCardDiscount,
            taxCharge: this.taxCharge,
            shippingCharge: this.shippingCharge,
            total: this.total,
            payment: this.payment,
            data: this.data
        }
    }

}

export type OrderCondition = Condition & {
    field: AllOrderFields
    parentFields?: OrderFields[]
}

export type OrderOrderBy = OrderBy & {
    field: OrderFields
}

type OrderFields = keyof OrderType

type AllOrderFields = keyof (OrderType & Address)

type Fulfilled = VariantQuantity & {
    inventoryId: string
}
type Payment = {
    type: 'charge' | 'refund'
    amount: number
}
