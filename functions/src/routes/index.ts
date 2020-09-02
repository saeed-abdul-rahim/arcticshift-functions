import { Application } from 'express'

import { userHandler } from './user'
// import { tierHandler } from './tier'

export function routes(app: Application) {
    userHandler(app)
    // tierHandler(app)
}
