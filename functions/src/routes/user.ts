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
        isAuthorized({ allowSameUser: true }),
        user.addToWishlist
    )

    app.patch(`${userRoute}/:id/phone`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        user.linkWithPhoneNumber
    )

    app.patch(`${userRoute}/:id/email`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        user.linkWithEmail
    )

    app.patch(`${userRoute}/:id`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        user.update
    )

    app.delete(`${userRoute}/:id/wishlist/:wid`,
        isAuthenticated,
        isAuthorized({ allowSameUser: true }),
        user.removeFromWishlist
    )

    app.delete(`${userRoute}/:id/shop`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin'] }),
        user.removeStaff
    )
}
