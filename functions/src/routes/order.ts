import { Application } from 'express'

import * as order from '../controllers/order'
import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import { VARIANT, VOUCHER } from '../config/constants'

export function orderHandler(app: Application) {

    const orderRoute = routes.order

    app.get(`${orderRoute}/total`,
        isAuthenticated,
        order.calculateDraft
    )

    app.post(orderRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.create
    )

    app.put(`${orderRoute}/:id/${VOUCHER}`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        order.addVoucher,
        order.calculateDraft
    )

    app.put(orderRoute,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.addVariant
    )

    app.patch(`${orderRoute}/:id/${VARIANT}`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.removeVariant,
        order.calculateDraft
    )

    app.patch(orderRoute,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.finalize
    )

}
