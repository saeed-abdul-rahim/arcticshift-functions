import { Application } from 'express'

// import { isAuthenticated } from '../auth/authenticated'
// import { isAuthorized } from '../auth/authorized'
import * as shop from '../controllers/shop'
import routes from '../config/routes'

export function shopHandler(app: Application) {

    const shopRoute = routes.shop

    // ONE TIME USE ONLY
    app.post(`${shopRoute}`,
        shop.create
    )

}
