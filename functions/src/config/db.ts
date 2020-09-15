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
    INVENTORY
} from './constants'

const db = admin.firestore()
const ref = db.collection(DBVERSION).doc(DBNAME)

export const batch = admin.firestore().batch()
export const transaction = admin.firestore().runTransaction

export const usersRef = ref.collection(USERS)
export const addressesRef = ref.collection(ADDRESSES)
export const shopsRef = ref.collection(SHOPS)
export const productsRef = ref.collection(PRODUCTS)
export const variantsRef = ref.collection(VARIANTS)
export const productTypesRef = ref.collection(PRODUCTTYPES)
export const categoriesRef = ref.collection(CATEGORIES)
export const collectionsRef = ref.collection(COLLECTIONS)
export const attributesRef = ref.collection(ATTRIBUTES)
export const attributeValuesRef = ref.collection(ATTRIBUTEVALUES)
export const taxesRef = ref.collection(TAXES)
export const ordersRef = ref.collection(ORDERS)
export const saleDiscountsRef = ref.collection(SALEDISCOUNTS)
export const vouchersRef = ref.collection(VOUCHERS)
export const giftCardsRef = ref.collection(GIFTCARDS)
export const shippingsRef = ref.collection(SHIPPING)
export const warehouseRef = ref.collection(WAREHOUSE)
export const inventoryRef = ref.collection(INVENTORY)
export const advertsRef = ref.collection(ADVERTS)
export const pagesRef = ref.collection(PAGES)
export const navigationRef = ref.collection(NAVIGATION)
export const supportRef = ref.collection(SUPPORT)

const DBROUTE = `${DBVERSION}/${DBNAME}`
export const supportRoute = `${DBROUTE}/${SUPPORT}`
