import { usersRef } from '../../config/db'
import { UserInterface, UserType, User } from './schema'

export async function get(uid: string): Promise<UserInterface> {
    try {
        const doc = await usersRef.doc(uid).get()
        if (!doc.exists) throw new Error('User not found')
        const data = <UserInterface>doc.data()
        data.uid = doc.id
        return new User(data).get()
    } catch (err) {
        throw err
    }
}

export async function set(uid: string, user: UserType): Promise<UserInterface> {
    try {
        const dataToInsert = new User(user).get()
        dataToInsert.updatedAt = Date.now()
        await usersRef.doc(uid).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        throw err
    }
}

export async function update(user: UserType): Promise<boolean> {
    try {
        const { uid } = user
        await usersRef.doc(uid).update({ ...user, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function getByIds(uids: string[]): Promise<(UserInterface | null)[]> {
    try {
        return await Promise.all(uids.map(async id => {
            try {
                return await get(id)
            } catch (_) {
                return null
            }
        }))        
    } catch (err) {
        throw err
    }
}

export async function getByEmail(email: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('email', email)
    } catch (err) {
        throw err;
    }
}

export async function getByPhone(phone: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('phone', phone)
    } catch (err) {
        throw err;
    }
}

export async function getByStripeId(stripeId: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('stripeId', stripeId)
    } catch (err) {
        throw err;
    }
}

async function getOneByCondition(field: string, value: string): Promise<UserInterface> {
    try {
        const doc = await usersRef.where(field, '==', value).get()
        if (doc.empty) throw new Error('User not found')
        const user = doc.docs[0].data()
        const data = <UserType>user
        data.uid = doc.docs[0].id
        return new User(data).get()
    } catch (err) {
        throw err;
    }
}

export async function getRef(id?: string) {
    if (id) {
        return usersRef.doc(id)
    } else {
        return usersRef
    }
}
