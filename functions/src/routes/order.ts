import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import * as order from '../controllers/order'
import { isAuthorized } from '../auth/authorized'

export function orderHandler(app: Application) {

    const orderRoute = routes.order

    app.post(orderRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.create
    )

    app.put(orderRoute,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.addVariant
    )

    app.patch(`${orderRoute}/:id/variant`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.removeVariant
    )

}
