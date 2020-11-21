import { Common, CommonInterface, CommonType, Content, PaymentGateway } from '../common/schema'

export interface SettingInterface extends CommonInterface {
    settingId: string
    [key: string]: any
}

export type SettingType = CommonType & {
    settingId?: string
    [key: string]: any
}

export class Setting extends Common implements SettingInterface {
    settingId: string
    [key:string]: any

    constructor(data: SettingType) {
        super(data)
        this.settingId = data.settingId ? data.settingId : ''
    }

    get(): SettingInterface {
        return {
            ...super.get(),
            settingId: this.settingId
        }
    }

}

export interface GeneralSettingInterface extends SettingInterface {
    accentColor: string
    currency: string
    weightUnit: string
    paymentGateway: PaymentGateway
    logo: Content | null
    logoLong: Content | null
    name: string
    facebook: string
    instagram: string
    twitter: string
}

export type GeneralSettingType = SettingType & {
    accentColor?: string
    currency?: string
    weightUnit?: string
    paymentGateway?: PaymentGateway
    logo?: Content | null
    logoLong?: Content | null
    name?: string
    facebook?: string
    instagram?: string
    twitter?: string
}

export class GeneralSetting extends Setting {
    accentColor: string
    currency: string
    weightUnit: string
    paymentGateway: PaymentGateway
    logo: Content | null
    logoLong: Content | null
    name: string
    facebook: string
    instagram: string
    twitter: string

    constructor(data: GeneralSettingType) {
        super(data)
        this.accentColor = data.accentColor ? data.accentColor : ''
        this.currency = data.currency ? data.currency : ''
        this.weightUnit = data.weightUnit ? data.weightUnit : ''
        this.paymentGateway = data.paymentGateway ? data.paymentGateway : 'razorpay'
        this.logo = data.logo ? data.logo : null
        this.logoLong = data.logoLong ? data.logoLong : null
        this.name = data.name ? data.name : ''
        this.facebook = data.facebook ? data.facebook : ''
        this.instagram = data.instagram ? data.instagram : ''
        this.twitter = data.twitter ? data.twitter : ''
    }

    get(): GeneralSettingInterface {
        return {
            ...super.get(),
            settingId: this.settingId,
            accentColor: this.accentColor,
            currency: this.currency,
            weightUnit: this.weightUnit,
            paymentGateway: this.paymentGateway,
            logo: this.logo,
            logoLong: this.logo,
            name: this.name,
            facebook: this.facebook,
            instagram: this.instagram,
            twitter: this.twitter
        }
    }

}
