import { giftCardsRef } from '../../config/db'
import { decrementGiftCard, incrementGiftCard } from '../analytics/giftCard'
import { GiftCardInterface, GiftCardType, GiftCard } from './schema'

export async function get(giftCardId: string): Promise<GiftCardInterface> {
    try {
        const doc = await giftCardsRef.doc(giftCardId).get()
        if (!doc.exists) throw new Error('GiftCard not found')
        const data = <GiftCardInterface>doc.data()
        data.giftCardId = doc.id
        return new GiftCard(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(giftCard: GiftCardType): Promise<string> {
    try {
        const id = giftCardsRef.doc().id
        giftCard.giftCardId = id
        await set(id, giftCard)
        await incrementGiftCard()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(giftCardId: string, giftCard: GiftCardType): Promise<boolean> {
    try {
        const dataToInsert = new GiftCard(giftCard).get()
        dataToInsert.updatedAt = Date.now()
        await giftCardsRef.doc(giftCardId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(giftCardId: string, giftCard: GiftCardType): Promise<boolean> {
    try {
        await giftCardsRef.doc(giftCardId).update({ ...giftCard, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(giftCardId: string): Promise<boolean> {
    try {
        await giftCardsRef.doc(giftCardId).delete()
        await decrementGiftCard()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return giftCardsRef.doc(id)
    } else {
        return giftCardsRef
    }
}
