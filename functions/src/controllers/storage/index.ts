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
import { download, getUrl, upload } from '../../storage'
import { Content, ContentStorage } from '../../models/common/schema'
import { isDefined } from '../../utils/isDefined'
import { CATEGORY, COLLECTION, PRODUCT, VARIANT } from '../../config/constants'

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

        switch (type) {

            case PRODUCT:
                const productData = await product.get(id)
                images = productData && productData.images
                break

            case VARIANT:
                const variantData = await variant.get(id)
                images = variantData && variantData.images
                break

            case CATEGORY:
                const categoryData = await category.get(id)
                images = categoryData && categoryData.images
                break

            case COLLECTION:
                const collectionData = await collection.get(id)
                images = collectionData && collectionData.images
                break

            default:
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

        images = pushContent(images, filePath, allUploads.filter(isDefined))

        switch (type) {

            case PRODUCT:
                await product.update(id, { images })
                break
            
            case VARIANT:
                await variant.update(id, { images })
            
            case CATEGORY:
                await category.update(id, { images })
            
            case COLLECTION:
                await collection.update(id, { images })

        }

        await fs.remove(workingDir)

        return true

    } catch (err) {
        throw err
    }

}

function pushContent(images: Content[], filePath: string, thumbnails: ContentStorage[] = []) {
    images.push({
        content: {
            path: filePath,
            url: getUrl(filePath)
        },
        thumbnails
    })
    return images
}
