import * as functions from 'firebase-functions'

import { tmpdir } from 'os'
import { join, dirname } from 'path'

import * as sharp from 'sharp'
import * as fs from 'fs-extra'
import { Metadata } from '../../models/storage/schema'
import * as product from '../../models/product'
import * as variant from '../../models/variant'
import * as category from '../../models/category'
import { download, getUrl, upload } from '../../storage'
import { Content, ContentStorage } from '../../models/common/schema'
import { isDefined } from '../../utils/isDefined'
import { CATEGORY, PRODUCT, VARIANT } from '../../config/constants'

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
        if (type === PRODUCT) {
            const productData = await product.get(id)
            images = productData && productData.images
        } else if (type === VARIANT) {
            const variantData = await variant.get(id)
            images = variantData && variantData.images
        } else if (type === CATEGORY) {
            const categoryData = await category.get(id)
            images = categoryData && categoryData.images
        } else {
            return false
        }
        
        const bucketDir = dirname(filePath)

        const workingDir = join(tmpdir(), 'thumbs')
        const tmpFilePath = join(workingDir, fileName)

        await fs.ensureDir(workingDir)

        await download(filePath, tmpFilePath)

        const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

        const uploadPromises = sizes.map(async size => {
            const thumbName = `thumb@${size}_${fileName}`
            const thumbPath = join(workingDir, thumbName)
            const destination = join(bucketDir, thumbName)

            try {
                await sharp(tmpFilePath)
                    .resize(size, null, {
                        fit: 'contain',
                        background: {
                            r: 0, g: 0, b: 0, alpha: 0
                        }
                    })
                    .png({ progressive: true })
                    .toFile(thumbPath)
            } catch (err) {
                console.error(err)
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

        const image: Content = {
            content: {
                path: filePath,
                url: getUrl(filePath)
            },
            thumbnails: allUploads.filter(isDefined)
        }
        images.push(image)

        if (type === PRODUCT) {
            await product.update(id, { images })
        } else if (type === VARIANT) {
            await variant.update(id, { images })
        } else if (type === CATEGORY) {
            await category.update(id, { images })
        }

        await fs.remove(workingDir)

        return true

    } catch (err) {
        throw err
    }

}
