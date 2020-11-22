import { Application } from 'express'

import routes from '../config/routes'
import { isAuthenticated } from '../auth/authenticated'
import { isAuthorized } from '../auth/authorized'
import * as settings from '../controllers/settings'

export function settingsHandler(app: Application) {

    const settingsRoute = routes.settings

    app.patch(`${settingsRoute}/general`,
        isAuthenticated,
        isAuthorized({ hasRole: ['admin', 'staff'] }),
        settings.setSettings
    )

}
