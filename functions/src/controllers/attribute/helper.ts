import { AttributeInterface } from "../../models/attribute/schema"
import { ProductInterface } from "../../models/product/schema"
import { VariantInterface } from "../../models/variant/schema"

export function addProductToAttribute(productData: ProductInterface | VariantInterface, attributeData: AttributeInterface) {
    const { productId } = productData
    attributeData.productId.unshift(productId)
    return {
        newAttributeData: attributeData
    }
}

export function removeProductFromAttribute(productData: ProductInterface | VariantInterface, attributeData: AttributeInterface) {
    const { productId } = productData
    attributeData.productId = attributeData.productId.filter(pid => pid !== productId)
    return {
        newAttributeData: attributeData
    }
}
