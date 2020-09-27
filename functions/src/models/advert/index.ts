import { advertsRef } from '../../config/db'
import { decrementAdvert, incrementAdvert } from '../analytics/advert'
import { AdvertInterface, AdvertType, Advert } from './schema'

export async function get(advertId: string): Promise<AdvertInterface> {
    try {
        const doc = await advertsRef.doc(advertId).get()
        if (!doc.exists) throw new Error('Advert not found')
        const data = <AdvertInterface>doc.data()
        data.advertId = doc.id
        return new Advert(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(advert: AdvertType): Promise<string> {
    try {
        const id = advertsRef.doc().id
        advert.advertId = id
        await set(id, advert)
        await incrementAdvert()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(advertTypeId: string, advert: AdvertType): Promise<boolean> {
    try {
        const dataToInsert = new Advert(advert).get()
        dataToInsert.updatedAt = Date.now()
        await advertsRef.doc(advertTypeId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(advertTypeId: string, advert: AdvertType): Promise<boolean> {
    try {
        await advertsRef.doc(advertTypeId).update({ ...advert, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(advertTypeId: string): Promise<boolean> {
    try {
        await advertsRef.doc(advertTypeId).delete()
        await decrementAdvert()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return advertsRef.doc(id)
    } else {
        return advertsRef
    }
}
