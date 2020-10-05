import { CollectionInterface } from "../../models/collection/schema"
import { ProductInterface } from "../../models/product/schema"

export function addProductToCollection(productData: ProductInterface, collectionData: CollectionInterface) {
    const { collectionId } = collectionData
    const { productId } = productData
    collectionData.productId.unshift(productId)
    productData.collectionId.unshift(collectionId)
    return {
        newCollectionData: collectionData,
        newProductData: productData
    }
}

export function removeProductFromCollection(productData: ProductInterface, collectionData: CollectionInterface) {
    const { collectionId } = collectionData
    const { productId } = productData
    productData.collectionId = productData.collectionId.filter(cid => cid !== collectionId)
    collectionData.productId = collectionData.productId.filter(pid => pid !== productId)
    return {
        newCollectionData: collectionData,
        newProductData: productData
    }
}
