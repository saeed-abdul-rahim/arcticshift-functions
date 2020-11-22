import {
    ATTRIBUTE,
    CATEGORY,
    CHECKOUT,
    COLLECTION,
    GIFTCARD,
    ORDER,
    PRODUCT,
    PRODUCTTYPE,
    SALEDISCOUNT,
    SHIPPING,
    RATE,
    SHOP,
    TAX,
    USER,
    VARIANT,
    VOUCHER,
    WAREHOUSE,
    WEBHOOK,
    SETTINGS
} from "./constants"

const v1 = '/v1'
const webhooks = {
    razorpay: `${v1}/${WEBHOOK}/razorpay`,
    stripe: `${v1}/${WEBHOOK}/stripe`
}
const routes = {
    user: `${v1}/${USER}`,
    product: `${v1}/${PRODUCT}`,
    variant: `${v1}/${VARIANT}`,
    attribute: `${v1}/${ATTRIBUTE}`,
    productType: `${v1}/${PRODUCTTYPE}`,
    category: `${v1}/${CATEGORY}`,
    collection: `${v1}/${COLLECTION}`,
    order: `${v1}/${ORDER}`,
    saleDiscount: `${v1}/${SALEDISCOUNT}`,
    voucher: `${v1}/${VOUCHER}`,
    giftCard: `${v1}/${GIFTCARD}`,
    checkout: `${v1}/${CHECKOUT}`,
    shop: `${v1}/${SHOP}`,
    tax: `${v1}/${TAX}`,
    warehouse: `${v1}/${WAREHOUSE}`,
    shipping: `${v1}/${SHIPPING}`,
    shippingRate: `${v1}/${SHIPPING}/${RATE}`,
    settings: `${v1}/${SETTINGS}`,
    webhooks
}
export default routes
