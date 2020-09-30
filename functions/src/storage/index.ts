import * as admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import { appId } from '../config'
import { ContentStorage } from '../models/common/schema'

export const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${appId}/o/`
export const bucket = admin.storage().bucket()

export async function remove(path: string) {
    try {
        const file = bucket.file(path)
        return await file.delete()
    } catch (err) {
        console.error(err)
        return null
    }
}

export async function removeMultiple(contents: ContentStorage[]) {
    await Promise.all(contents.map(async content => {
        try {
            await remove(content.path)
        } catch (err) {
            console.error(err)
        }
    }))
}

export async function upload(localPath: string, destination: string): Promise<string> {
    try {
        return await bucket.upload(localPath, {
            destination,
            metadata: {
                metadata: {
                    firebaseStorageDownloadTokens: uuidv4()
                }
            }
        }).then(_ => {
            return getUrl(destination)
        })
    } catch (err) {
        console.error(err)
        return ''
    }
}

export async function download(remotePath: string, destination: string) {
    try {
        return await bucket.file(remotePath).download({ destination })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function getUrl(path: string) {
    const urlPath = encodeURIComponent(path)
    return storageUrl + `${urlPath}?alt=media`
}
