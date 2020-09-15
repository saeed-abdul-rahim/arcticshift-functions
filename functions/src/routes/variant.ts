import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as variant from '../controllers/variant'
import routes from '../config/routes'

export function variantHandler(app: Application) {

    const variantRoute = routes.variant

    app.post(variantRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        variant.create
    )

    app.patch(variantRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        variant.update
    )

    app.delete(`${variantRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        variant.remove
    )

}
