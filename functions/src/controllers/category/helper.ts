import * as category from '../../models/category'
import { CategoryInterface } from "../../models/category/schema"
import { ProductInterface } from "../../models/product/schema"

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
