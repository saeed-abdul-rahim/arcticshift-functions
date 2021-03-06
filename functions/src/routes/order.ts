import { Application } from 'express'

import * as order from '../controllers/order'
import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import { SHIPPING, VARIANT, VOUCHER } from '../config/constants'

export function orderHandler(app: Application) {

    const orderRoute = routes.order

    app.get(`${orderRoute}/total`,
        isAuthenticated,
        order.calculateDraft
    )

    app.post(`${orderRoute}/total/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.calculateDraft
    )

    app.post(orderRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.create
    )

    app.put(`${orderRoute}/:id/variant`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.addVariant
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

    app.patch(`${orderRoute}/:id/refund`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.refund
    )

    app.patch(`${orderRoute}/:id/fullfill/cancel`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.cancelFullfillment
    )

    app.patch(`${orderRoute}/:id/fullfill`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.fullfill
    )

    app.patch(`${orderRoute}/:id/tracking`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.addTrackingCode
    )

    app.patch(`${orderRoute}/:id/capture`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.capturePayment
    )

    app.patch(`${orderRoute}/:id/${SHIPPING}`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.updateShipping,
        order.calculateDraft
    )

    app.patch(`${orderRoute}/:id/${VARIANT}/delete`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.removeVariant,
        order.calculateDraft
    )

    app.patch(`${orderRoute}/:id/${VARIANT}`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.updateVariants,
        order.calculateDraft
    )

    app.patch(`${orderRoute}/:id/create`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        order.createOrder
    )

    app.patch(orderRoute,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.finalize
    )

    app.delete(`${orderRoute}/:id/${VOUCHER}`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.removeVoucher,
        order.calculateDraft
    )

    app.delete(`${orderRoute}/:id`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true, hasRole: ['admin', 'staff'] }),
        order.cancelOrder,
        order.calculateDraft
    )

}
