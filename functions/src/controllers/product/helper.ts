import * as product from '../../models/product'
import * as attribute from '../../models/attribute'
import * as productType from '../../models/productType'
import * as category from '../../models/category'
import * as collection from '../../models/collection'
import { ProductInterface } from "../../models/product/schema";
import { addProductToProductType, removeProductFromProductType } from '../productType/helper';
import { addProductToAllCategories, removeProductFromAllCategories } from '../category/helper';
import { addProductToCollection, removeProductFromCollection } from '../collection/helper';
import { isBothArrEqual } from '../../utils/arrayUtils';
import { addProductToAttribute, removeProductFromAttribute } from '../attribute/helper'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/product/helper`

export async function organizeProduct(productData: ProductInterface) {
    try {
        const { productId, categoryId, collectionId, productTypeId } = productData
        if (productTypeId) {
            try {
                const productTypeData = await productType.get(productTypeId)
                const { newProductTypeData } = addProductToProductType(productData, productTypeData)
                await productType.set(productTypeId, newProductTypeData)
                const attributes = await attribute.getByCondition([{ field: 'productTypeId', type: 'array-contains', value: productTypeId }])
                if (attributes) {
                    await Promise.all(attributes.map(async attributeData => {
                        const { attributeId } = attributeData
                        const { newAttributeData } = addProductToAttribute(productData, attributeData)
                        await attribute.set(attributeId, newAttributeData)
                    }))
                }
            } catch (err) {
                await product.update(productId, { productTypeId: '', attributes: null })
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }
        if (categoryId) {
            try {
                const categoryData = await category.get(categoryId)
                const allCategories = await addProductToAllCategories(productId, categoryData)
                const allCategoryId = allCategories.map(cat => cat.categoryId)
                await product.update(productId, { allCategoryId })
            } catch (err) {
                await product.update(productId, { categoryId: '', allCategoryId: [] })
                console.error(`${functionPath}/${callerName()}`, err)
            }
        }
        if (collectionId && collectionId.length > 0) {
            await Promise.all(collectionId.map(async collId => {
                try {
                    const collectionData = await collection.get(collId)
                    const { newCollectionData } = addProductToCollection(productData, collectionData)
                    await collection.set(collId, newCollectionData)
                } catch (err) {
                    productData.collectionId = productData.collectionId.filter(cid => cid !== collId)
                    await product.update(productId, { collectionId: productData.collectionId })
                    console.error(`${functionPath}/${callerName()}`, err)
                }
            }))
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }
}

export async function organizeProductUpdate(oldProductData: ProductInterface, productData: ProductInterface) {
    try {
        const { categoryId, collectionId, productTypeId, productId } = productData
        const isCollectionIdEqual = isBothArrEqual(oldProductData.collectionId, collectionId)
        if (oldProductData.categoryId === categoryId) {
            productData.categoryId = ''
        } else if (oldProductData.categoryId && oldProductData.categoryId !== categoryId) {
            const categoryData = await category.get(oldProductData.categoryId)
            const allRemovedIds = await removeProductFromAllCategories(productId, categoryData)
            productData.allCategoryId = productData.allCategoryId.filter(cid => !allRemovedIds.includes(cid))
        }
        if (oldProductData.productTypeId === productTypeId) {
            productData.productTypeId = ''
        } else if (oldProductData.productTypeId && oldProductData.productTypeId !== productTypeId) {
            await removeFromProductType(oldProductData)
        }
        if (isCollectionIdEqual) {
            productData.collectionId = []
        } else if (!isCollectionIdEqual) {
            const collectionIdNotPresentInOld = collectionId.filter(val => !oldProductData.collectionId.includes(val));
            const collectionIdNotPresentInNew = oldProductData.collectionId.filter(val => !collectionId.includes(val));
            if (collectionIdNotPresentInNew && collectionIdNotPresentInNew.length > 0) {
                await Promise.all(collectionIdNotPresentInNew.map(async collId => {
                    try {
                        const collectionData = await collection.get(collId)
                        const { newCollectionData } = removeProductFromCollection(productData, collectionData)
                        await collection.set(collId, newCollectionData)
                    } catch (err) {
                        console.error(`${functionPath}/${callerName()}`, err)
                    }
                }))
            }
            productData.collectionId = collectionIdNotPresentInOld
        }
        await organizeProduct(productData)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }
}

export async function removeFromProductType(productData: ProductInterface) {
    try {
        const { productTypeId } = productData
        const productTypeData = await productType.get(productTypeId)
        const { newProductTypeData } = removeProductFromProductType(productData, productTypeData)
        await productType.set(productTypeId, newProductTypeData)
        const attributes = await attribute.getByCondition([{ field: 'productTypeId', type: 'array-contains', value: productTypeId }])
        if (attributes) {
            await Promise.all(attributes.map(async attributeData => {
                const { attributeId } = attributeData
                const { newAttributeData } = removeProductFromAttribute(productData, attributeData)
                await attribute.set(attributeId, newAttributeData)
            }))
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }
}