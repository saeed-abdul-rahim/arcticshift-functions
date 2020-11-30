import { MODELS } from '../../config/constants'
import { usersRef } from '../../config/db'
import { callerName } from '../../utils/functionUtils'
import { UserInterface, UserType, User } from './schema'

const functionPath = `${MODELS}/user`

export async function get(uid: string, transaction?: FirebaseFirestore.Transaction): Promise<UserInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(uid))
        } else {
            doc = await getRef(uid).get()
        }
        if (!doc.exists) throw new Error('User not found')
        const data = <UserInterface>doc.data()
        data.uid = doc.id
        return new User(data).get()
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function set(uid: string, user: UserType): Promise<UserInterface> {
    try {
        const dataToInsert = new User(user).get()
        dataToInsert.updatedAt = Date.now()
        await getRef(uid).set(dataToInsert)
        return dataToInsert
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function update(user: UserType): Promise<boolean> {
    try {
        const { uid } = user
        await getRef(uid).update({ ...user, updatedAt: Date.now() })
        return true
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export async function getByEmail(email: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('email', email)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export async function getByPhone(phone: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('phone', phone)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export async function getByStripeId(stripeId: string): Promise<UserInterface> {
    try {
        return await getOneByCondition('stripeId', stripeId)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err;
    }
}

export function getRef(id: string) {
    return usersRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, userId: string, user: UserType) {
    try {
        const dataToInsert = new User(user).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(userId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, userId: string, user: UserType) {
    try {
        return batch.update(getRef(userId), { ...user, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, userId: string, user: UserType) {
    try {
        const dataToInsert = new User(user).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(userId), dataToInsert)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, userId: string, user: UserType) {
    try {
        return transaction.update(getRef(userId), { ...user, updatedAt: Date.now() })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, userId: string) {
    try {
        return transaction.delete(getRef(userId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, userId: string) {
    try {
        return batch.delete(getRef(userId))
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }
}
