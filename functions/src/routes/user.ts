import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as user from '../controllers/user'

export function userHandler(app: Application) {

    const userRoute = routes.user

    // ONE TIME USE ONLY
    app.post(`${userRoute}/admin`,
        user.createAdmin
    )

    app.post(`${userRoute}/staff`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        user.createStaff
    )

    app.put(`${userRoute}/wishlist`,
        isAuthenticated,
        user.addToWishlist
    )

    app.put(`${userRoute}/cart`,
        isAuthenticated,
        user.addToCart
    )

    app.patch(userRoute,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        user.update
    )

    app.delete(`${userRoute}/:id/shop`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        user.removeStaff
    )
}
