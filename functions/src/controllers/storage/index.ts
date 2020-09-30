import * as functions from 'firebase-functions'

import { tmpdir } from 'os'
import { join, dirname } from 'path'

import * as sharp from 'sharp'
import * as fs from 'fs-extra'
import { Metadata } from '../../models/storage/schema'
import * as product from '../../models/product'
import { download, getUrl, upload } from '../../storage'
import { Content, ContentStorage } from '../../models/common/schema'
import { isDefined } from '../../utils/isDefined'

export async function generateThumbnails(object: functions.storage.ObjectMetadata) {
    const { name, contentType, metadata } = object
    const filePath = name
    if (!filePath) {
        return false
    }
    const fileName = filePath.split('/').pop()
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
    if (type !== 'product') {
        return false
    }

    const productData = await product.get(id)
    let { images } = productData
    if (!images) {
        images = []
    }

    const bucketDir = dirname(filePath)

    const workingDir = join(tmpdir(), 'thumbs')
    const tmpFilePath = join(workingDir, 'source.png')

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

    await product.update(id, { images })

    return fs.remove(workingDir)
}
