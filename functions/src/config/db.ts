import * as admin from 'firebase-admin'

import {
    DBVERSION,
    DBNAME,
    USERS,
    ADDRESSES,
    SHOPS,
    PRODUCTS,
    VARIANTS,
    CATEGORIES,
    COLLECTIONS,
    PRODUCTTYPES,
    ATTRIBUTES,
    ATTRIBUTEVALUES,
    ORDERS,
    DRAFTS,
    TAXES,
    SALEDISCOUNTS,
    VOUCHERS,
    GIFTCARDS,
    SHIPPING,
    WAREHOUSE,
    PAGES,
    NAVIGATION,
    SUPPORT,
    ANALYTICS,
    SHIPPINGRATES,
    SETTINGS
} from './constants'

export const db = admin.firestore()

export const dbRef = db.collection(DBVERSION).doc(DBNAME)

export const usersRef = dbRef.collection(USERS)
export const addressesRef = dbRef.collection(ADDRESSES)
export const shopsRef = dbRef.collection(SHOPS)
export const productsRef = dbRef.collection(PRODUCTS)
export const variantsRef = dbRef.collection(VARIANTS)
export const productTypesRef = dbRef.collection(PRODUCTTYPES)
export const categoriesRef = dbRef.collection(CATEGORIES)
export const collectionsRef = dbRef.collection(COLLECTIONS)
export const attributesRef = dbRef.collection(ATTRIBUTES)
export const attributeValuesRef = dbRef.collection(ATTRIBUTEVALUES)
export const taxesRef = dbRef.collection(TAXES)
export const ordersRef = dbRef.collection(ORDERS)
export const draftsRef = dbRef.collection(DRAFTS)
export const saleDiscountsRef = dbRef.collection(SALEDISCOUNTS)
export const vouchersRef = dbRef.collection(VOUCHERS)
export const giftCardsRef = dbRef.collection(GIFTCARDS)
export const shippingsRef = dbRef.collection(SHIPPING)
export const shippingRatesRef = dbRef.collection(SHIPPINGRATES)
export const warehouseRef = dbRef.collection(WAREHOUSE)
export const pagesRef = dbRef.collection(PAGES)
export const navigationRef = dbRef.collection(NAVIGATION)
export const supportRef = dbRef.collection(SUPPORT)
export const settingsRef = dbRef.collection(SETTINGS)

export const analyticsRef = dbRef.collection(ANALYTICS)
export const productAnalyticsRef = analyticsRef.doc(PRODUCTS)
export const categoryAnalyticsRef = analyticsRef.doc(CATEGORIES)
export const collectionAnalyticsRef = analyticsRef.doc(COLLECTIONS)
export const attributeAnalyticsRef = analyticsRef.doc(ATTRIBUTES)
export const productTypeAnalyticsRef = analyticsRef.doc(PRODUCTTYPES)
export const saleDiscountAnalyticsRef = analyticsRef.doc(SALEDISCOUNTS)
export const voucherAnalyticsRef = analyticsRef.doc(VOUCHERS)
export const giftCardAnalyticsRef = analyticsRef.doc(GIFTCARDS)
export const orderAnalyticsRef = analyticsRef.doc(ORDERS)
export const userAnalyticsRef = analyticsRef.doc(USERS)
export const shippingAnalyticsRef = analyticsRef.doc(SHIPPING)
export const taxAnalyticsRef = analyticsRef.doc(TAXES)
export const warehouseAnalyticsRef = analyticsRef.doc(WAREHOUSE)

const DBROUTE = `${DBVERSION}/${DBNAME}`
export const supportRoute = `${DBROUTE}/${SUPPORT}`
