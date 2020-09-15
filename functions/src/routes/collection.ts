import { Application } from 'express'

import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as collection from '../controllers/collection'
import routes from '../config/routes'

export function collectionHandler(app: Application) {

    const collectionRoute = routes.collection

    app.post(collectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.create
    )

    app.patch(collectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.update
    )

    app.put(collectionRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.addProduct
    )

    app.delete(`${collectionRoute}/:cid/product/:pid`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        collection.removeProduct
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
