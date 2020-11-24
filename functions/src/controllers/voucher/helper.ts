import { CatalogType, CatalogTypeKey } from '../../models/common/schema'
import * as voucher from '../../models/voucher'
import * as category from '../../models/category'
import * as collection from '../../models/collection'
import * as product from '../../models/product'
import * as user from '../../models/user'
import { ProductInterface } from '../../models/product/schema'
import { VoucherInterface } from '../../models/voucher/schema'

export async function checkIfVoucherExists(code: string) {
    try {
        const voucherData = await voucher.getOneByCondition([{
            field: 'code', type: '==', value: code
        }])
        if (voucherData) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.log(err)
        throw err
    }
}

export async function updateCatalog(voucherId: string, catalog: CatalogType) {
    try {
        const { productId, categoryId, collectionId } = catalog
        if (collectionId) {
            await Promise.all(collectionId.map(async collId => {
                try {
                    const collectionData = await collection.get(collId)
                    const catProductIds = collectionData.productId
                    collectionData.voucherId = voucherId
                    if (collectionData.voucherId && collectionData.voucherId !== voucherId) {
                        await updatePrevSaleDiscount(collectionData.voucherId, 'collectionId', collId)
                    }
                    await collection.set(collId, collectionData)
                    await updateProduct(catProductIds, voucherId)
                } catch (_) { }
            }))
        }
        if (categoryId) {
            await updateCategory(categoryId, voucherId)
        }
        if (productId) {
            await updateProduct(productId, voucherId)
        }
    } catch (err) {
        console.error(err)
    }
}

async function updateProduct(productId: string[], voucherId: string) {
    try {
        await Promise.all(productId.map(async pId => {
            try {
                const productData = await product.get(pId)
                if (productData.voucherId && productData.voucherId !== voucherId) {
                    await updatePrevSaleDiscount(productData.voucherId, 'productId', pId)
                }
                await product.update(pId, { voucherId })
            } catch (err) {
                console.error(err)
            }
        }))
    } catch (err) {
        console.error(err)
    }
}

async function updatePrevSaleDiscount(voucherId: string, catalog: CatalogTypeKey, catalogId: string) {
    try {
        const voucherData = await voucher.get(voucherId)
        voucherData[catalog] = voucherData[catalog].filter(id => catalogId !== id)
        await voucher.set(voucherId, voucherData)
    } catch (err) {
        console.error(err)
    }
}

async function updateCategory(categoryId: string[], voucherId: string) {
    try {
        await Promise.all(categoryId.map(async catId => {
            try {
                const categoryData = await category.get(catId)
                const catProductIds = categoryData.productId
                categoryData.voucherId = voucherId
                await category.set(catId, categoryData)
                await updateProduct(catProductIds, voucherId)
                if (categoryData.subCategoryId) {
                    const { subCategoryId } = categoryData
                    await updateCategory(subCategoryId, voucherId)
                }
            } catch (err) {
                console.error(err)
            }
        }))
    } catch (err) {
        console.error(err)
    }
}

export function isProductEligible(voucherData: VoucherInterface, productData: ProductInterface) {
    const { categoryId, collectionId, productId } = voucherData
    const { productId: pId } = productData
    const { categoryId: catId, collectionId: colId } = productData
    const isValidProduct = productId.includes(pId)
    const isValidCategory = categoryId.some(c => catId.includes(c))
    const isValidCollection = collectionId.some(c => colId.includes(c))
    if (isValidProduct || isValidCategory || isValidCollection) {
        return true
    } else {
        return false
    }
}

export async function isValidUse(voucherData: VoucherInterface, uid: string) {
    const { onePerUser, totalUsage, voucherId } = voucherData
    if (onePerUser || totalUsage > 0) {
        const userData = await user.get(uid)
        const { voucherUsed } = userData
        if (voucherUsed && voucherUsed[voucherId] && voucherUsed[voucherId] > 0) {
            if (onePerUser) {
                return false
            } else if (totalUsage > 0 && voucherUsed[voucherId] > totalUsage) {
                return false
            }
        }
    }
    return true
}