import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as warehouse from '../controllers/warehouse'

export function warehouseHandler(app: Application) {

    const warehouseRoute = routes.warehouse

    app.post(warehouseRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        warehouse.create
    )

    app.patch(warehouseRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        warehouse.update
    )

    app.delete(`${warehouseRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        warehouse.remove
    )

}
