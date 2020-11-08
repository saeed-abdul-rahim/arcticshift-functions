import { Request, Response } from 'express'
import { serverError } from '../../responseHandler/errorHandler'
import { successUpdated } from '../../responseHandler/successHandler'

export function handleEvent(req: Request, res: Response) {
    try {
        const {} = req.headers
        return successUpdated(res)
    } catch (err) {
        console.error(err)
        return serverError(res, err)
    }
}
