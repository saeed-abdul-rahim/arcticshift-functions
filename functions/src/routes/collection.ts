import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as collection from '../controllers/collection'

export function collectionHandler(app: Application) {

    const collectionRoute = routes.collection

    app.post(collectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.create
    )

    app.put(collectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.addProduct
    )

    app.patch(`${collectionRoute}/:id/image`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.removeImage
    )

    app.patch(`${collectionRoute}/:id/product`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.removeProduct
    )

    app.patch(collectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.update
    )

    app.delete(`${collectionRoute}/:id/image`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.removeImage
    )

    app.delete(`${collectionRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.remove
    )

}
