import { Application } from 'express'

import { userHandler } from './user'
import { shopHandler } from './shop'
import { productHandler } from './product'
import { variantHandler } from './variant'
import { categoryHandler } from './category'
import { collectionHandler } from './collection'
import { saleDiscountHandler } from './saleDiscount'
import { voucherHandler } from './voucher'
import { taxHandler } from './tax'
import { attributeHandler } from './attribute'
import { productTypeHandler } from './productType'
import { warehouseHandler } from './warehouse'
import { shippingHandler } from './shipping'
import { orderHandler } from './order'
import { webhookHandler } from './webhook'
import { settingsHandler } from './settings'

export function routes(app: Application) {
    userHandler(app)
    shopHandler(app)
    orderHandler(app)
    productHandler(app)
    productTypeHandler(app)
    attributeHandler(app)
    variantHandler(app)
    categoryHandler(app)
    collectionHandler(app)
    saleDiscountHandler(app)
    voucherHandler(app)
    taxHandler(app)
    warehouseHandler(app)
    shippingHandler(app)
    webhookHandler(app)
    settingsHandler(app)
}
