import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as shippingRate from '../controllers/shippingRate'

export function shippingRateHandler(app: Application) {

    const shippingRateRoute = routes.shippingRate

    app.post(shippingRateRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shippingRate.create
    )

    app.patch(shippingRateRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shippingRate.update
    )

    app.delete(`${shippingRateRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        shippingRate.remove
    )

}
