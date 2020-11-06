import { Common, CommonInterface, CommonType } from '../common/schema'

export interface SettingInterface extends CommonInterface {
    settingId: string
}

export type SettingType = CommonType & {
    settingId?: string
}

export class Setting extends Common implements SettingInterface {
    settingId: string

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
}

export type GeneralSettingType = SettingType & {
    accentColor?: string
    currency?: string
    weightUnit?: string
}

export class GeneralSetting extends Setting {
    accentColor: string
    currency: string
    weightUnit: string

    constructor(data: GeneralSettingType) {
        super(data)
        this.accentColor = data.accentColor ? data.accentColor : ''
        this.currency = data.currency ? data.currency : ''
        this.weightUnit = data.weightUnit ? data.weightUnit : ''
    }

    get(): GeneralSettingInterface {
        return {
            ...super.get(),
            settingId: this.settingId,
            accentColor: this.accentColor,
            currency: this.currency,
            weightUnit: this.weightUnit
        }
    }

}