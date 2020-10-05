import { ProductTypeInterface } from "../../models/productType/schema"
import { ProductInterface } from "../../models/product/schema"

export function addProductToProductType(productData: ProductInterface, productTypeData: ProductTypeInterface) {
    const { productTypeId } = productTypeData
    const { productId } = productData
    productTypeData.productId.unshift(productId)
    productData.productTypeId = productTypeId
    return {
        newProductTypeData: productTypeData,
        newProductData: productData
    }
}

export function removeProductFromProductType(productData: ProductInterface, productTypeData: ProductTypeInterface) {
    const { productId } = productData
    productData.productTypeId = ''
    productTypeData.productId = productTypeData.productId.filter(pid => pid !== productId)
    return {
        newProductTypeData: productTypeData,
        newProductData: productData
    }
}
