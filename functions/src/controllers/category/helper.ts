import * as category from '../../models/category'
import { CategoryInterface } from "../../models/category/schema"
import { ProductInterface } from "../../models/product/schema"
import { isBothArrEqual } from '../../utils/arrayUtils'

export async function addProductToCategory(productData: ProductInterface, categoryData: CategoryInterface) {
    const { categoryId, parentCategoryId } = categoryData
    const { productId } = productData
    categoryData.productId.unshift(productId)
    productData.categoryId = categoryId
    if (parentCategoryId) {
        try {
            const parentCategoryData = await category.get(parentCategoryId)
            parentCategoryData.productId.unshift(productId)
            await category.set(parentCategoryId, parentCategoryData)
        } catch (_) {}
    }
    return {
        newCategoryData: categoryData,
        newProductData: productData
    }
}

export async function removeProductFromCategory(productData: ProductInterface, categoryData: CategoryInterface) {
    const { subCategoryId } = categoryData
    const { productId } = productData
    productData.categoryId = ''
    categoryData.productId = categoryData.productId.filter(pid => pid !== productId)
    if (subCategoryId && subCategoryId.length > 0) {
        await Promise.all(subCategoryId.map(async subId => {
            try {
                const subCategoryData = await category.get(subId)
                subCategoryData.productId.filter(pid => pid !== productId)
                await category.set(subId, subCategoryData)
            } catch (_) {}
        }))
    }
    return {
        newCategoryData: categoryData,
        newProductData: productData
    }
}

export async function addProductToAllCategories(pid: string | string[], categoryData: CategoryInterface): Promise<CategoryInterface[]> {
    try {
        const { categoryId } = categoryData
        let allCategoryData: CategoryInterface[] = []
        if (!pid) {
            return []
        }
        if (typeof pid === 'string') {
            if(!categoryData.productId.includes(pid)) {
                allCategoryData.push(categoryData)
                categoryData.productId.push(pid)
                await category.set(categoryId, categoryData)
            }
        } else {
            if(!isBothArrEqual(categoryData.productId, pid)) {
                allCategoryData.push(categoryData)
                categoryData.productId = categoryData.productId.concat(pid)
                await category.set(categoryId, categoryData)
            }
        }
        if (categoryData.parentCategoryId) {
            const parentcategoryData = await category.get(categoryData.parentCategoryId)
            allCategoryData = allCategoryData.concat(...await addProductToAllCategories(pid, parentcategoryData))
        }
        return allCategoryData
    } catch (err) {
        throw err
    }
}

// 
export async function removeProductFromAllCategories(pid: string, categoryData: CategoryInterface, direction: 'up' | 'down' = 'up'): Promise<string[]> {
    try {
        const { categoryId } = categoryData
        let change = false
        let categoryIds = [categoryId]
        if(categoryData.productId.includes(pid)) {
            categoryData.productId = categoryData.productId.filter(id => id !== pid)
            change = true
        }
        if (change) {
            await category.set(categoryId, categoryData)
            let allCategoryIds: string[] = []
            if (direction === 'up') {
                allCategoryIds = categoryData.parentCategoryIds
            } else {
                allCategoryIds = categoryData.subCategoryId
            }
            if (allCategoryIds && allCategoryIds.length > 0) {
                const allSubCategoryId = await Promise.all(allCategoryIds.map(async subId => {
                    try {
                        const subCategoryData = await category.get(subId)
                        return await removeProductFromAllCategories(pid, subCategoryData)
                    } catch (err) {
                        return []
                    }
                }))
                categoryIds = categoryIds.concat(...allSubCategoryId)
            }
        }
        return categoryIds
    } catch (err) {
        throw err
    }
}

