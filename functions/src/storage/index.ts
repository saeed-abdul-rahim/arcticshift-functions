import * as admin from 'firebase-admin'

const bucket = admin.storage().bucket()

export async function remove(path: string) {
    try {
        const file = bucket.file(path)
        return await file.delete()
    } catch (err) {
        return null
    }
}
