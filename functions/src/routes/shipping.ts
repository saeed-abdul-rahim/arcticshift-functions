import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as shipping from '../controllers/shipping'

export function shippingHandler(app: Application) {

    const shippingRoute = routes.shipping

    app.post(shippingRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shipping.create
    )

    app.patch(shippingRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shipping.update
    )

    app.delete(`${shippingRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shipping.remove
    )

}
