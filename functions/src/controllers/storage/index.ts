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
import { download, getUrl, remove, upload, uploadText } from '../../storage'
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
import { createManifest } from '../../config/manifest'
import { ProductInterface } from '../../models/product/schema'

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
        
        let images: Content[] = []
        let data: any

        await db.runTransaction(async transaction => {
            switch (type) {

                case PRODUCT:
                    data = await product.get(id, transaction)
                    images = data && data.images
                    break

                case VARIANT:
                    data = await variant.get(id, transaction)
                    images = data && data.images
                    break

                case CATEGORY:
                    data = await category.get(id, transaction)
                    images = data && data.images
                    break

                case COLLECTION:
                    data = await collection.get(id, transaction)
                    images = data && data.images
                    break
                
                case SETTINGS:
                    data = await settings.getGeneralSettings()
                    images = data && data.images
                    break

                default:
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
                    let width: number | null = null
                    let height: number | null = null
                    if (type === SETTINGS || type === COLLECTION) {
                        height = size
                    } else {
                        width = size
                    }
                    await sharp(tmpFilePath)
                        .resize(width, height, {
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
                if (SETTINGS && id === 'logo' && data && size === IMAGE_XXS) {
                    const favicon = 'favicon.png'
                    try {
                        try {
                            await remove(favicon)
                        } catch (err) {
                            console.error(`${functionPath}/${callerName()}`, err)
                        }
                        await upload(thumbPath, favicon)
                    } catch (err) {
                        console.error(`${functionPath}/${callerName()}`, err)
                    }
                }
                return {
                    dimension: size,
                    name: thumbName,
                    path: destination,
                    url: fileUrl
                } as ContentStorage
            })

            const allUploads = await Promise.all(uploadPromises)

            if (SETTINGS && id === 'logo' && data) {
                const manifestPath = 'manifest.webmanifest'
                try {
                    await remove(manifestPath)
                } catch (err) {
                    console.error(`${functionPath}/${callerName()}`, err)
                }
                try {
                    const content = createManifest(data.name.split(' ').join('-'), allUploads.filter(isDefined))
                    await uploadText(manifestPath, content)
                } catch (err) {
                    console.error(`${functionPath}/${callerName()}`, err)
                }
            }

            await fs.remove(workingDir)


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
                    images = images.filter(img => img.id !== id)
                }
                images = pushContent(images, filePath, allUploads.filter(isDefined), id)
            }

            switch (type) {

                case PRODUCT:
                    product.transactionUpdate(transaction, id, { images })
                    const { variantId } = data as ProductInterface
                    if (variantId && variantId.length > 0) {
                        await Promise.all(variantId.map(async vId => {
                            try {
                                const variantData = await variant.get(vId)
                                variantData.images.push(getContent(filePath, allUploads.filter(isDefined), PRODUCT))
                                await variant.set(vId, variantData)
                            } catch (err) {
                                console.error(`${functionPath}/${callerName()}`, err)
                            }
                        }))
                    }
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
        console.error(`${functionPath}/${callerName()}`, err)
        throw err
    }

}

function pushContent(images: Content[], filePath: string, thumbnails: ContentStorage[] = [], id?: string) {
    images.push(getContent(filePath, thumbnails, id))
    return images
}

function getContent(filePath: string, thumbnails: ContentStorage[] = [], id?: string): Content {
    return {
        id: id || '',
        content: {
            path: filePath,
            url: getUrl(filePath)
        },
        thumbnails
    }
}
