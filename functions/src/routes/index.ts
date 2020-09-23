import { Application } from 'express'

import { userHandler } from './user'
import { shopHandler } from './shop'
import { productHandler } from './product'
import { variantHandler } from './variant'
import { categoryHandler } from './category'
import { collectionHandler } from './collection'
import { saleDiscountHandler } from './saleDiscount'
import { voucherHandler } from './voucher'

export function routes(app: Application) {
    userHandler(app)
    shopHandler(app)
    productHandler(app)
    variantHandler(app)
    categoryHandler(app)
    collectionHandler(app)
    saleDiscountHandler(app)
    voucherHandler(app)
}
