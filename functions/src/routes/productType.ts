import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as productType from '../controllers/productType'

export function productTypeHandler(app: Application) {

    const productTypeRoute = routes.productType

    app.post(productTypeRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        productType.create
    )

    app.patch(productTypeRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        productType.update
    )

    app.delete(`${productTypeRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        productType.remove
    )

}
