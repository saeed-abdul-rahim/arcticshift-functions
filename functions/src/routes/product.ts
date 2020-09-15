import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as product from '../controllers/product'
import routes from '../config/routes'

export function productHandler(app: Application) {

    const productRoute = routes.product

    app.post(productRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        product.create
    )

    app.patch(productRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        product.update
    )

    app.delete(`${productRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        product.remove
    )

}
