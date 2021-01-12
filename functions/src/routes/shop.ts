import { Application } from 'express'

import routes from '../config/routes'
// import { isAuthenticated } from '../auth/authenticated'
// import { isAuthorized } from '../auth/authorized'
import * as shop from '../controllers/shop'

export function shopHandler(app: Application) {

    const shopRoute = routes.shop

    // COMMENT OUT IN PRODUCTION !!!
    app.post(`${shopRoute}`,
        shop.create
    )

}
