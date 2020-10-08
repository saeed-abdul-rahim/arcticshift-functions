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
    TAXES,
    SALEDISCOUNTS,
    VOUCHERS,
    GIFTCARDS,
    SHIPPING,
    WAREHOUSE,
    ADVERTS,
    PAGES,
    NAVIGATION,
    SUPPORT,
    INVENTORY, ANALYTICS
} from './constants'

const db = admin.firestore()

export const batch = admin.firestore().batch()
export const transaction = admin.firestore().runTransaction

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
export const saleDiscountsRef = dbRef.collection(SALEDISCOUNTS)
export const vouchersRef = dbRef.collection(VOUCHERS)
export const giftCardsRef = dbRef.collection(GIFTCARDS)
export const shippingsRef = dbRef.collection(SHIPPING)
export const warehouseRef = dbRef.collection(WAREHOUSE)
export const inventoryRef = dbRef.collection(INVENTORY)
export const advertsRef = dbRef.collection(ADVERTS)
export const pagesRef = dbRef.collection(PAGES)
export const navigationRef = dbRef.collection(NAVIGATION)
export const supportRef = dbRef.collection(SUPPORT)

export const analyticsRef = dbRef.collection(ANALYTICS)
export const productAnalyticsRef = dbRef.collection(ANALYTICS).doc(PRODUCTS)
export const categoryAnalyticsRef = dbRef.collection(ANALYTICS).doc(CATEGORIES)
export const collectionAnalyticsRef = dbRef.collection(ANALYTICS).doc(COLLECTIONS)
export const attributeAnalyticsRef = dbRef.collection(ANALYTICS).doc(ATTRIBUTES)
export const productTypeAnalyticsRef = dbRef.collection(ANALYTICS).doc(PRODUCTTYPES)
export const saleDiscountAnalyticsRef = dbRef.collection(ANALYTICS).doc(SALEDISCOUNTS)
export const voucherAnalyticsRef = dbRef.collection(ANALYTICS).doc(VOUCHERS)
export const giftCardAnalyticsRef = dbRef.collection(ANALYTICS).doc(GIFTCARDS)
export const orderAnalyticsRef = dbRef.collection(ANALYTICS).doc(ORDERS)
export const userAnalyticsRef = dbRef.collection(ANALYTICS).doc(USERS)
export const shippingAnalyticsRef = dbRef.collection(ANALYTICS).doc(SHIPPING)
export const taxAnalyticsRef = dbRef.collection(ANALYTICS).doc(TAXES)
export const warehouseAnalyticsRef = dbRef.collection(ANALYTICS).doc(WAREHOUSE)
export const advertAnalyticsRef = dbRef.collection(ANALYTICS).doc(ADVERTS)

const DBROUTE = `${DBVERSION}/${DBNAME}`
export const supportRoute = `${DBROUTE}/${SUPPORT}`
