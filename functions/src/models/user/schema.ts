import { CommonInterface, CommonType } from '../common/schema'
import { Common } from '../common'
import { uniqueArr } from '../../utils/uniqueArr'

type Gender = 'Male' | 'Female' | 'Transgender' | ''

type PaymentMethod = {
    type: 'razorpay' | 'stripe' | 'paypal' | 'gpay' | 'klarna' | 'lazypay'
    id: string
    paymentMethodIds: string[]
}

export interface UserInterface extends CommonInterface {
    uid: string
    name: string
    email: string
    phone: string
    dob: string
    gender: Gender
    photoUrl: string
    online: boolean
    lastSeen: number
    shopId: string[]
    paymentMethods: PaymentMethod[]
}

export type UserType = CommonType & {
    uid: string
    name?: string
    email?: string
    phone?: string
    dob?: string
    gender?: Gender
    photoUrl?: string
    online?: boolean
    lastSeen?: number
    shopId?: string[]
    paymentMethods?: PaymentMethod[]
}

export class User extends Common implements UserInterface {
    uid: string
    name: string
    email: string
    phone: string
    dob: string
    gender: Gender
    photoUrl: string
    online: boolean
    lastSeen: number
    shopId: string[]
    paymentMethods: PaymentMethod[]

    constructor(data: UserType) {
        super(data)
        this.uid = data.uid
        this.name = data.name ? data.name : ''
        this.email = data.email ? data.email : ''
        this.phone = data.phone ? data.phone : ''
        this.dob = data.dob ? data.dob : ''
        this.gender = data.gender ? data.gender : ''
        this.photoUrl = data.photoUrl ? data.photoUrl : ''
        this.online = data.online ? true : false
        this.lastSeen = data.lastSeen ? data.lastSeen : 0
        this.shopId = data.shopId ? uniqueArr(data.shopId) : []
        this.paymentMethods = data.paymentMethods ? data.paymentMethods : []
    }

    get(): UserInterface {
        return {
            ...super.get(),
            uid: this.uid,
            name: this.name,
            email: this.email,
            phone: this.phone,
            dob: this.dob,
            gender: this.gender,
            photoUrl: this.photoUrl,
            online: this.online,
            lastSeen: this.lastSeen,
            shopId: this.shopId,
            paymentMethods: this.paymentMethods
        }
    }

}
