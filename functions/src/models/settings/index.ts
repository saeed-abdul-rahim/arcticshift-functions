import { MODELS } from '../../config/constants'
import { settingsRef } from '../../config/db'
import { callerName } from '../../utils/functionUtils'
import { GeneralSettingInterface, GeneralSettingType, GeneralSetting } from './schema'

const functionPath = `${MODELS}/settings`

export async function get(settingId: string): Promise<GeneralSettingInterface> {
    try {
        const doc = await settingsRef.doc(settingId).get()
        if (!doc.exists) throw new Error('GeneralSetting not found')
        const data = <GeneralSettingInterface>doc.data()
        data.settingId = doc.id
        return new GeneralSetting(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function add(setting: GeneralSettingType): Promise<string> {
    try {
        const id = settingsRef.doc().id
        setting.settingId = id
        await set(id, setting)
        return id
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function set(settingId: string, setting: GeneralSettingType): Promise<boolean> {
    try {
        const dataToInsert = new GeneralSetting(setting).get()
        dataToInsert.updatedAt = Date.now()
        await settingsRef.doc(settingId).set(dataToInsert)
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(settingId: string, setting: GeneralSettingType): Promise<boolean> {
    try {
        await settingsRef.doc(settingId).update({ ...setting, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function remove(settingId: string): Promise<boolean> {
    try {
        await settingsRef.doc(settingId).delete()
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        return await get('general')
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function setGeneralSettings(setting: GeneralSettingType) {
    try {
        return await set('general', setting)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function updateGeneralSettings(setting: GeneralSettingType) {
    try {
        return await update('general', setting)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}
