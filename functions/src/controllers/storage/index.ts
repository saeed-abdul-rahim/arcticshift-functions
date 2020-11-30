import * as functions from 'firebase-functions'

import { tmpdir } from 'os'
import { join, dirname } from 'path'

import sharp from 'sharp'
import * as fs from 'fs-extra'
import { Metadata } from '../../models/storage/schema'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as category from '../../models/category'
import * as collection from '../../models/collection'
import * as settings from '../../models/settings'
import { download, getUrl, remove, upload } from '../../storage'
import { Content, ContentStorage } from '../../models/common/schema'
import { isDefined } from '../../utils/isDefined'
import {
    CATEGORY,
    COLLECTION,
    PRODUCT,
    VARIANT,
    IMAGE_L,
    IMAGE_M,
    IMAGE_ML,
    IMAGE_S,
    IMAGE_SM,
    IMAGE_SS,
    IMAGE_XL,
    IMAGE_XS,
    IMAGE_XXS,
    IMAGE_FONT, SETTINGS, CONTROLLERS
} from '../../config/constants'
import { db } from '../../config/db'
import { callerName } from '../../utils/functionUtils'

const functionPath = `${CONTROLLERS}/storage/index`

export async function generateThumbnails(object: functions.storage.ObjectMetadata) {
    try {
        const { name, contentType, metadata } = object
        if (!name) {
            return false
        }
        const filePath = name
        const fileName = name.split('/').pop()
        if (!contentType) {
            return false
        }
        if (!metadata) {
            return false
        }
        if (!fileName) {
            return false
        }
        if (fileName.includes('thumb@') || !contentType.includes('image')) {
            return false
        }
        const storageMetadata = metadata as Metadata
        const { id, type } = storageMetadata
        if (!id) {
            return false
        }
        if (!type) {
            return false
        }
        
        const bucketDir = dirname(filePath)

        const workingDir = join(tmpdir(), 'thumbs')
        const tmpFilePath = join(workingDir, fileName)

        await fs.ensureDir(workingDir)

        await download(filePath, tmpFilePath)

        const sizes = [IMAGE_FONT, IMAGE_XXS, IMAGE_XS, IMAGE_SS, IMAGE_S, IMAGE_SM, IMAGE_M, IMAGE_ML, IMAGE_L, IMAGE_XL]

        const uploadPromises = sizes.map(async size => {
            const thumbName = `thumb@${size}_${fileName}`
            const thumbPath = join(workingDir, thumbName)
            const destination = join(bucketDir, thumbName)

            try {
                await sharp(tmpFilePath)
                    .resize(type === SETTINGS ? null : size, type === SETTINGS ? size : null, {
                        fit: 'contain',
                        background: {
                            r: 0, g: 0, b: 0, alpha: 0
                        }
                    })
                    .png({ progressive: true })
                    .toFile(thumbPath)
            } catch (err) {
                return undefined
            }

            const fileUrl = await upload(thumbPath, destination)
            return {
                dimension: size,
                name: thumbName,
                path: destination,
                url: fileUrl
            } as ContentStorage
        })

        const allUploads = await Promise.all(uploadPromises)
        await fs.remove(workingDir)

        let images: Content[] = []

        await db.runTransaction(async transaction => {
            switch (type) {

                case PRODUCT:
                    const productData = await product.get(id, transaction)
                    images = productData && productData.images
                    break

                case VARIANT:
                    const variantData = await variant.get(id, transaction)
                    images = variantData && variantData.images
                    break

                case CATEGORY:
                    const categoryData = await category.get(id, transaction)
                    images = categoryData && categoryData.images
                    break

                case COLLECTION:
                    const collectionData = await collection.get(id, transaction)
                    images = collectionData && collectionData.images
                    break
                
                case SETTINGS:
                    const settingsData = await settings.getGeneralSettings()
                    images = settingsData && settingsData.images
                    break

                default:
                    return false
            }

            if (type !== SETTINGS) {
                images = pushContent(images, filePath, allUploads.filter(isDefined))
            } else if (type === SETTINGS) {
                if (images.length > 0) {
                    const image = images.find(i => i.id === id)
                    if (image) {
                        if (image.content) {
                            try {
                                await remove(image.content.path)
                            } catch (err) {
                                console.error(`${functionPath}/${callerName()}`, err)
                            }
                        }
                        if (image.thumbnails && image.thumbnails.length > 0) {
                            await Promise.all(image.thumbnails.map(async thumbnail => {
                                try {
                                    await remove(thumbnail.path)
                                } catch (err) {
                                    console.error(`${functionPath}/${callerName()}`, err)
                                }
                            }))
                        }
                    }
                }
                images = pushContent(images, filePath, allUploads.filter(isDefined), id)
            }

            switch (type) {

                case PRODUCT:
                    product.transactionUpdate(transaction, id, { images })
                    break
                
                case VARIANT:
                    variant.transactionUpdate(transaction, id, { images })
                    break
                
                case CATEGORY:
                    category.transactionUpdate(transaction, id, { images })
                    break
                
                case COLLECTION:
                    collection.transactionUpdate(transaction, id, { images })
                    break

                case SETTINGS:
                    await settings.updateGeneralSettings({ images })
                    break

            }
            return
        })

        return true

    } catch (err) {
        throw err
    }

}

function pushContent(images: Content[], filePath: string, thumbnails: ContentStorage[] = [], id?: string) {
    images.push({
        id: id || '',
        content: {
            path: filePath,
            url: getUrl(filePath)
        },
        thumbnails
    })
    return images
}
