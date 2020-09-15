import { TimestampInterface, TimestampType, Address } from '../common/schema'
import { Timestamp } from '../common'

type OrderStatus = 'draft' | 'unfulfilled' | 'partiallyFulfilled' | 'fulfilled' | 'cancelled' | ''
type PaymentStatus = 'notCharged' | 'partiallyCharged' | 'fullyCharged' | 'partiallyRefunded' | 'fullyRefunded' | ''

type Product = {
    productId: string
    quantity: number
}
type Fulfilled = Product & {
    inventoryId: string
}
type Payment = {
    type: 'charge' | 'refund'
    amount: number
}

export interface OrderInterface extends TimestampInterface {
    shopId: string
    email: string
    phone: string
    orderId: string
    orderNo: number
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    billingAddress: Address | null
    shippingAddress: Address | null
    voucherId: string
    saleDiscountId: string
    giftCardId: string
    shippingId: string
    products: Product[]
    fullfilled: Fulfilled[]
    subtotal: number
    total: number
    payment: Payment[]
}

export type OrderType = TimestampType & {
    shopId: string
    email?: string
    phone?: string
    orderId?: string
    orderNo?: number
    orderStatus?: OrderStatus
    paymentStatus?: PaymentStatus
    billingAddress?: Address | null
    shippingAddress?: Address | null
    voucherId?: string
    saleDiscountId?: string
    giftCardId?: string
    shippingId?: string
    products?: Product[]
    fullfilled?: Fulfilled[]
    subtotal?: number
    total?: number
    payment?: Payment[]
}

export class Order extends Timestamp implements OrderInterface {
    shopId: string
    email: string
    phone: string
    orderId: string
    orderNo: number
    orderStatus: OrderStatus
    paymentStatus: PaymentStatus
    billingAddress: Address | null
    shippingAddress: Address | null
    voucherId: string
    saleDiscountId: string
    giftCardId: string
    shippingId: string
    products: Product[]
    fullfilled: Fulfilled[]
    subtotal: number
    total: number
    payment: Payment[]

    constructor(data: OrderType) {
        super(data)
        this.shopId = data.shopId ? data.shopId : ''
        this.email = data.email ? data.email : ''
        this.phone = data.phone ? data.phone : ''
        this.orderId = data.orderId ? data.orderId : ''
        this.orderNo = data.orderNo ? data.orderNo : 0
        this.orderStatus = data.orderStatus ? data.orderStatus : ''
        this.paymentStatus = data.paymentStatus ? data.paymentStatus : ''
        this.billingAddress = data.billingAddress ? data.billingAddress : null
        this.shippingAddress = data.shippingAddress ? data.shippingAddress : null
        this.voucherId = data.voucherId ? data.voucherId : ''
        this.saleDiscountId = data.saleDiscountId ? data.saleDiscountId : ''
        this.giftCardId = data.giftCardId ? data.giftCardId : ''
        this.shippingId = data.shippingId ? data.shippingId : ''
        this.products = data.products ? data.products : []
        this.fullfilled = data.fullfilled ? data.fullfilled : []
        this.subtotal = data.subtotal ? data.subtotal : 0
        this.total = data.total ? data.total : 0
        this.payment = data.payment ? data.payment : []
    }

    get(): OrderInterface {
        return {
            ...super.get(),
            shopId: this.shopId,
            email: this.email,
            phone: this.phone,
            orderId: this.orderId,
            orderNo: this.orderNo,
            orderStatus: this.orderStatus,
            paymentStatus: this.paymentStatus,
            billingAddress: this.billingAddress,
            shippingAddress: this.shippingAddress,
            voucherId: this.voucherId,
            saleDiscountId: this.saleDiscountId,
            giftCardId: this.giftCardId,
            shippingId: this.shippingId,
            products: this.products,
            fullfilled: this.fullfilled,
            subtotal: this.subtotal,
            total: this.total,
            payment: this.payment
        }
    }

}
