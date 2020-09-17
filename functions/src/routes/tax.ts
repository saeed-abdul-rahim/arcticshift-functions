import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as tax from '../controllers/tax'

export function taxHandler(app: Application) {

    const taxRoute = routes.tax

    app.post(taxRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        tax.create
    )

    app.patch(taxRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        tax.update
    )

    app.delete(`${taxRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        tax.remove
    )

}
