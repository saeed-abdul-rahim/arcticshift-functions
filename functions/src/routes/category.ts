import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as category from '../controllers/category'

export function categoryHandler(app: Application) {

    const categoryRoute = routes.category

    app.post(categoryRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.create
    )

    app.put(categoryRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.addProduct
    )

    app.patch(`${categoryRoute}/:id/image`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.removeImage
    )

    app.patch(`${categoryRoute}/:id/product`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.removeProduct
    )

    app.patch(categoryRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.update
    )

    app.delete(`${categoryRoute}/:id/image`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.removeImage
    )

    app.delete(`${categoryRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        category.remove
    )

}
