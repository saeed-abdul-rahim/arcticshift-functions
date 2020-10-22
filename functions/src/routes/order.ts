import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import * as order from '../controllers/order'

export function productTypeHandler(app: Application) {

    const orderRoute = routes.order

    app.post(orderRoute,
        isAuthenticated,
        order.create
    )

}
