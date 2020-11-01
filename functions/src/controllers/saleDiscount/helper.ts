import { CatalogType, CatalogTypeKey } from '../../models/common/schema'
import * as saleDiscount from '../../models/saleDiscount'
import * as category from '../../models/category'
import * as collection from '../../models/collection'
import * as product from '../../models/product'

export async function checkIfSaleDiscountExists(name: string) {
    try {
        const saleData = saleDiscount.getOneByCondition([{
            field: 'name', type: '==', value: name
        }])
        if (saleData) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.log(err)
        throw err
    }
}

export async function updateCatalog(saleDiscountId: string, catalog: CatalogType) {
    try {
        const { productId, categoryId, collectionId } = catalog
        if (collectionId) {
            await Promise.all(collectionId.map(async collId => {
                try {
                    const collectionData = await collection.get(collId)
                    const catProductIds = collectionData.productId
                    collectionData.saleDiscountId = saleDiscountId
                    if (collectionData.saleDiscountId && collectionData.saleDiscountId !== saleDiscountId) {
                        await updatePrevSaleDiscount(collectionData.saleDiscountId, 'collectionId', collId)
                    }
                    await collection.set(collId, collectionData)
                    await updateProduct(catProductIds, saleDiscountId)
                } catch (_) {}
            }))
        }
        if (categoryId) {
            await updateCategory(categoryId, saleDiscountId)
        }
        if (productId) {
            await updateProduct(productId, saleDiscountId)
        }
    } catch (err) {
        console.error(err)
    }
}

async function updateProduct(productId: string[], saleDiscountId: string) {
    try {
        await Promise.all(productId.map(async pId => {
            try {
                const productData = await product.get(pId)
                if (productData.saleDiscountId && productData.saleDiscountId !== saleDiscountId) {
                    await updatePrevSaleDiscount(productData.saleDiscountId, 'productId', pId)
                }
                await product.update(pId, { saleDiscountId })
            } catch (err) {
                console.error(err)
            }
        }))
    } catch (err) {
        console.log(err)
    }
}

async function updatePrevSaleDiscount(saleDiscountId: string, catalog: CatalogTypeKey, catalogId: string) {
    try {
        const saleDiscountData = await saleDiscount.get(saleDiscountId)
        saleDiscountData[catalog] = saleDiscountData[catalog].filter(id => catalogId !== id)
        await saleDiscount.set(saleDiscountId, saleDiscountData)
    } catch (err) {
        console.log(err)
    }
}

async function updateCategory(categoryId: string[], saleDiscountId: string) {
    try {
        await Promise.all(categoryId.map(async catId => {
            try {
                const categoryData = await category.get(catId)
                const catProductIds = categoryData.productId
                categoryData.saleDiscountId = saleDiscountId
                await category.set(catId, categoryData)
                await updateProduct(catProductIds, saleDiscountId)
                if (categoryData.subCategoryId) {
                    const { subCategoryId } = categoryData
                    await updateCategory(subCategoryId, saleDiscountId)
                }
            } catch (err) {
                console.error(err)
            }
        }))
    } catch(err) {
        console.log(err)
    }
}
