import { Common, CommonInterface, CommonType, Address, ContentStorage, AuthTypeImp, AuthType, ObjNumber } from '../common/schema'
import { uniqueArr } from '../../utils/arrayUtils'

export const genders: Gender[] = [ 'Male', 'Female', 'Transgender' ]

export interface UserInterface extends CommonInterface, AuthTypeImp {
    uid: string
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
    phoneCode: string
    dob: number
    gender: Gender
    image: ContentStorage | null
    online: boolean
    lastSeen: number
    shopId: string[]
    shopInvite: string[]
    access: string[]
    paymentMethods: PaymentMethod[]
    voucherUsed: ObjNumber
    orderId: string[]
    billingAddress: Address | null
    shippingAddress: Address | null
    addresses: Address[]
    wishlist: string[]
    cart: string[]
    likes: string[]
}

export type UserType = CommonType & AuthType & {
    uid: string
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    phoneCode?: string
    dob?: number
    gender?: Gender
    image?: ContentStorage | null
    online?: boolean
    lastSeen?: number
    shopId?: string[]
    shopInvite?: string[]
    access?: string[]
    paymentMethods?: PaymentMethod[]
    voucherUsed?: ObjNumber
    orderId?: string[]
    billingAddress?: Address | null
    shippingAddress?: Address | null
    addresses?: Address[]
    wishlist?: string[]
    cart?: string[]
    likes?: string[]
}

export class User extends Common implements UserInterface {
    uid: string
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
    phoneCode: string
    dob: number
    gender: Gender
    image: ContentStorage | null
    online: boolean
    lastSeen: number
    shopId: string[]
    shopInvite: string[]
    access: string[]
    admin: string[]
    staff: string[]
    paymentMethods: PaymentMethod[]
    voucherUsed: ObjNumber
    orderId: string[]
    billingAddress: Address | null
    shippingAddress: Address | null
    addresses: Address[]
    wishlist: string[]
    cart: string[]
    likes: string[]

    constructor(data: UserType) {
        super(data)
        this.uid = data.uid
        this.name = data.name ? data.name : ''
        this.firstName = data.firstName ? data.firstName : ''
        this.lastName = data.lastName ? data.lastName : ''
        this.email = data.email ? data.email : ''
        this.phone = data.phone ? data.phone : ''
        this.phoneCode = data.phoneCode ? data.phoneCode : ''
        this.dob = data.dob ? data.dob : 0
        this.gender = data.gender ? data.gender : ''
        this.image = data.image ? data.image : null
        this.online = data.online ? true : false
        this.lastSeen = data.lastSeen ? data.lastSeen : 0
        this.shopId = data.shopId ? uniqueArr(data.shopId) : []
        this.shopInvite = data.shopInvite ? uniqueArr(data.shopInvite) : []
        this.access = data.access ? uniqueArr(data.access) : []
        this.admin = data.admin ? uniqueArr(data.admin) : []
        this.staff = data.staff ? uniqueArr(data.staff) : []
        this.paymentMethods = data.paymentMethods ? data.paymentMethods : []
        this.voucherUsed = data.voucherUsed ? data.voucherUsed : null
        this.orderId = data.orderId ? uniqueArr(data.orderId) : []
        this.billingAddress = data.billingAddress ? data.billingAddress : null
        this.shippingAddress = data.shippingAddress ? data.shippingAddress : null
        this.addresses = data.addresses ? data.addresses : []
        this.wishlist = data.wishlist ? uniqueArr(data.wishlist) : []
        this.cart = data.cart ? uniqueArr(data.cart) : []
        this.likes = data.likes ? uniqueArr(data.likes) : []
    }

    get(): UserInterface {
        return {
            ...super.get(),
            uid: this.uid,
            name: this.name,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            phoneCode: this.phoneCode,
            dob: this.dob,
            gender: this.gender,
            image: this.image,
            online: this.online,
            lastSeen: this.lastSeen,
            shopId: this.shopId,
            shopInvite: this.shopInvite,
            access: this.access,
            admin: this.admin,
            staff: this.staff,
            paymentMethods: this.paymentMethods,
            voucherUsed: this.voucherUsed,
            orderId: this.orderId,
            billingAddress: this.billingAddress,
            shippingAddress: this.shippingAddress,
            addresses: this.addresses,
            wishlist: this.wishlist,
            cart: this.cart,
            likes: this.likes
        }
    }

}

type PaymentMethod = {
    type: 'razorpay' | 'stripe' | 'paypal' | 'gpay' | 'klarna' | 'lazypay'
    id: string
    paymentMethodIds: string[]
}

type Gender = 'Male' | 'Female' | 'Transgender' | ''
