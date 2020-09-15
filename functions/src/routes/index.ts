import { Application } from 'express'

import { userHandler } from './user'
import { shopHandler } from './shop'

export function routes(app: Application) {
    userHandler(app)
    shopHandler(app)
}
