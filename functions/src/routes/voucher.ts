import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as voucher from '../controllers/voucher'

export function voucherHandler(app: Application) {

    const voucherRoute = routes.voucher

    app.post(voucherRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        voucher.create
    )

    app.patch(`${voucherRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        voucher.removeCatalog
    )

    app.patch(voucherRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        voucher.update
    )

    app.put(`${voucherRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        voucher.addCatalog
    )

    app.delete(`${voucherRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        voucher.remove
    )

}
