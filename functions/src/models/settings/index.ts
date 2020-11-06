import { settingsRef } from '../../config/db'
import { SettingInterface, SettingType, Setting, GeneralSettingType, GeneralSettingInterface } from './schema'

export async function get(settingId: string): Promise<SettingInterface> {
    try {
        const doc = await settingsRef.doc(settingId).get()
        if (!doc.exists) throw new Error('Setting not found')
        const data = <SettingInterface>doc.data()
        data.settingId = doc.id
        return new Setting(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(setting: SettingType): Promise<string> {
    try {
        const id = settingsRef.doc().id
        setting.settingId = id
        await set(id, setting)
        return id
    } catch (err) {
        throw err
    }
}

export async function set(settingId: string, setting: SettingType): Promise<boolean> {
    try {
        const dataToInsert = new Setting(setting).get()
        dataToInsert.updatedAt = Date.now()
        await settingsRef.doc(settingId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(settingId: string, setting: SettingType): Promise<boolean> {
    try {
        await settingsRef.doc(settingId).update({ ...setting, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(settingId: string): Promise<boolean> {
    try {
        await settingsRef.doc(settingId).delete()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return settingsRef.doc(id)
    } else {
        return settingsRef
    }
}


export async function getGeneralSettings(): Promise<GeneralSettingInterface> {
    try {
        return await get('general') as GeneralSettingInterface
    } catch (err) {
        throw err
    }
}

export async function setGeneralSettings(setting: GeneralSettingType) {
    try {
        return await set('general', setting)
    } catch (err) {
        throw err
    }
}
