import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as shipping from '../controllers/shipping'
import * as shippingRate from '../controllers/shippingRate'

export function shippingHandler(app: Application) {

    const shippingRoute = routes.shipping
    const shippingRateRoute = routes.shippingRate

    app.post(shippingRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shipping.create
    )

    app.put(shippingRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff']}),
        shippingRate.create
    )

    app.patch(shippingRateRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff']}),
        shippingRate.update
    )

    app.patch(shippingRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shipping.update
    )

    app.patch(`${shippingRateRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff']}),
        shippingRate.remove
    )

    app.delete(`${shippingRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shipping.remove
    )

}
