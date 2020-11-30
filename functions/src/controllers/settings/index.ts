import { Request, Response } from 'express'
import { GeneralSettingType } from '../../models/settings/schema'
import * as settings from '../../models/settings'
import { successUpdated } from '../../responseHandler/successHandler'
import { serverError } from '../../responseHandler/errorHandler'
import { callerName } from '../../utils/functionUtils'
import { CONTROLLERS } from '../../config/constants'

const functionPath = `${CONTROLLERS}/settings/index`

export async function setSettings(req: Request, res: Response) {
    try {
        const { data }: { data: GeneralSettingType } = req.body
        await settings.setGeneralSettings(data)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
