import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as attribute from '../controllers/attribute'

export function attributeHandler(app: Application) {

    const attributeRoute = routes.attribute

    app.post(attributeRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        attribute.create
    )

    app.put(attributeRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        attribute.addAttributeValue
    )

    app.patch(`${attributeRoute}/value`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        attribute.updateAttributeValue
    )

    app.patch(attributeRoute,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        attribute.update
    )

    app.delete(`${attributeRoute}/:attributeId/value/:attributeValueId`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        attribute.remove
    )

    app.delete(`${attributeRoute}/:id`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        attribute.remove
    )

}
