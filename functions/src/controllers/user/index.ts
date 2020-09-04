import { Request, Response } from 'express'
import * as admin from 'firebase-admin'
import * as user from '../../models/user'
import { badRequest, serverError } from '../../responseHandler/errorHandler'
import { successCreated } from '../../responseHandler/successHandler'

export async function signUp(req: Request, res: Response) {
    try {
        const { displayName, email, password, phone } = req.body
        if (!phone && !email && !password)
            return badRequest(res, 'Phone / Email required')
        else if (email && !password)
            return badRequest(res, 'Password required')
        else {
            let uid: string
            if (phone) {
                uid = (await admin.auth().getUserByPhoneNumber(phone)).uid
            } else {
                uid = (await admin.auth().getUserByEmail(email)).uid
                await admin.auth().updateUser(uid, { displayName, password })
            }
            await user.set(uid, {
                uid,
                name: displayName,
                email,
                phone,
            })
            return successCreated(res)
        }
    } catch(err) {
        console.log(err)
        return serverError(res, err)
    }
}