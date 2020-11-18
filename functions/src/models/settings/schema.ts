import { Common, CommonInterface, CommonType, PaymentGateway } from '../common/schema'

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
}

export type GeneralSettingType = SettingType & {
    accentColor?: string
    currency?: string
    weightUnit?: string
    paymentGateway?: PaymentGateway
}

export class GeneralSetting extends Setting {
    accentColor: string
    currency: string
    weightUnit: string
    paymentGateway: PaymentGateway

    constructor(data: GeneralSettingType) {
        super(data)
        this.accentColor = data.accentColor ? data.accentColor : ''
        this.currency = data.currency ? data.currency : ''
        this.weightUnit = data.weightUnit ? data.weightUnit : ''
        this.paymentGateway = data.paymentGateway ? data.paymentGateway : 'razorpay'
    }

    get(): GeneralSettingInterface {
        return {
            ...super.get(),
            settingId: this.settingId,
            accentColor: this.accentColor,
            currency: this.currency,
            weightUnit: this.weightUnit,
            paymentGateway: this.paymentGateway
        }
    }

}
