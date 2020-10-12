import { AttributeInterface } from "../../models/attribute/schema"
import { ProductInterface } from "../../models/product/schema"
import { VariantInterface } from "../../models/variant/schema"

export function addProductToAttribute(productData: ProductInterface | VariantInterface, attributeData: AttributeInterface) {
    const { attributeId } = attributeData
    const { productId } = productData
    attributeData.productId.unshift(productId)
    productData.attributeId.unshift(attributeId)
    return {
        newAttributeData: attributeData,
        newProductData: productData
    }
}

export function removeProductFromAttribute(productData: ProductInterface | VariantInterface, attributeData: AttributeInterface) {
    const { productId } = productData
    const { attributeId } = attributeData
    productData.attributeId = productData.attributeId.filter(aid => aid !== attributeId)
    attributeData.productId = attributeData.productId.filter(pid => pid !== productId)
    return {
        newAttributeData: attributeData,
        newProductData: productData
    }
}
