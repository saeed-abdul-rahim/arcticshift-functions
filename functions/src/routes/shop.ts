import { Application } from 'express'

import routes from '../config/routes'
// import { isAuthenticated } from '../auth/authenticated'
// import { isAuthorized } from '../auth/authorized'
import * as shop from '../controllers/shop'

export function shopHandler(app: Application) {

    const shopRoute = routes.shop

    // ONE TIME USE ONLY
    app.post(`${shopRoute}`,
        shop.create
    )

}
