import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import * as order from '../controllers/order'

export function orderHandler(app: Application) {

    const orderRoute = routes.order

    app.post(orderRoute,
        isAuthenticated,
        order.create
    )

    app.put(orderRoute,
        isAuthenticated,
        order.addVariant
    )

    app.patch(`${orderRoute}/:id/variant`,
        isAuthenticated,
        order.removeVariant
    )

}
