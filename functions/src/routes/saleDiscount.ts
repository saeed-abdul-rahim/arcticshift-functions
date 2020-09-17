import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as saleDiscount from '../controllers/saleDiscount'

export function saleDiscountHandler(app: Application) {

    const saleDiscountRoute = routes.saleDiscount

    app.post(saleDiscountRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        saleDiscount.create
    )

    app.patch(`${saleDiscountRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        saleDiscount.removeCatalog
    )

    app.patch(saleDiscountRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        saleDiscount.update
    )

    app.put(`${saleDiscountRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        saleDiscount.addCatalog
    )

    app.delete(`${saleDiscountRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        saleDiscount.remove
    )

}
