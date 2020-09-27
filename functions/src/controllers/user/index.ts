import { Request, Response } from 'express'
import * as admin from 'firebase-admin'
import * as storage from '../../storage'
import { serverError, missingParam } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated } from '../../responseHandler/successHandler'

import * as shop from '../../models/shop'
import * as user from '../../models/user'
import * as claims from '../../models/userClaims'
import { isOfTypeAddress } from '../../models/common'
import { ShopType } from '../../models/shop/schema'
import { Role } from '../../models/common/schema'
import { UserType, genders } from '../../models/user/schema'
import { randomString } from '../../utils/randomString'
import { sendMail } from '../../mail'

export async function signUp(req: Request, res: Response) {
    try {
        const { displayName, email, password, phone } = req.body
        if (!phone && !email && !password)
            return missingParam(res, 'Phone / Email')
        else if (email && !password)
            return missingParam(res, 'Password')
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
        console.error(`${err.code} -  ${err.message}`)
        return serverError(res, err)
    }
}

export async function update(req: Request, res: Response) {
    const { uid } = res.locals
    const { name, dob, gender, image, shippingAddress, billingAddress } = req.body as UserType
    try {
        const userData = await user.get(uid)
        if (image && image.path && image.url) {
            if (userData.image) {
                const { path } = userData.image
                if (path) {
                    try {
                        await storage.remove(path)
                    } catch (_) {}
                }
            }
            userData.image = image
        }
        if (name) {
            userData.name = name
        }
        if (dob && typeof(dob) === 'number' && dob > 0) {
            userData.dob = dob
        }
        if (gender && genders.includes(gender)) {
            userData.gender = gender
        }
        if (shippingAddress) {
            let valid = true
            Object.entries(shippingAddress).forEach(([key]) => {
                if (!isOfTypeAddress(key)) { valid = false }
            });
            if (valid) {
                userData.shippingAddress = shippingAddress
            }
        }
        if (billingAddress) {
            let valid = true
            Object.entries(billingAddress).forEach(([key]) => {
                if (!isOfTypeAddress(key)) { valid = false }
            });
            if (valid) {
                userData.billingAddress = billingAddress
            }
        }
        await user.set(uid, userData)
        return successUpdated(res)
    } catch (err) {
        return serverError(res, err)
    }
}

export async function createAdmin(req: Request, res: Response) {
    const { email, shopId }: { email: string, shopId: string } = req.body
    await create(res, {
        shopId,
        email,
        role: 'admin'
    })
}

export async function createStaff(req: Request, res: Response) {
    const { shopData }: { [shopData: string]: ShopType } = res.locals
    const { email }: { email: string } = req.body
    const { shopId } = shopData
    await create(res, {
        shopId,
        email,
        role: 'staff'
    })
}

export async function removeStaff(req: Request, res: Response) {
    const { shopData }: { [shopData: string]: ShopType } = res.locals
    const { id } = req.params
    const { shopId } = shopData
    let { staff } = shopData
    try {
        const userClaims = await claims.get(id)
        const customClaims = claims.checkIfExist(userClaims)
        const userData = await user.get(id)
        await claims.remove(customClaims, shopId, id)
        let { staff: uStaff } = userData
        uStaff = uStaff.filter(s => s !== shopId)
        staff = staff?.filter(s => s !== id)
        await user.set(id, { ...userData, staff: uStaff})
        await shop.set(shopId, shopData)
        return successUpdated(res)
    } catch (err) {
        return serverError(res, err)
    }
}

async function create(res: Response, data: { shopId: string, email: string, role: Role }) {
    try {
        const { shopId, email, role } = data
        if (!shopId) {
            return missingParam(res, 'ShopID')
        }
        if (!email) {
            return missingParam(res, 'Email')
        }
        if (!role) {
            return missingParam(res, 'Role')
        }
        const shopData = await shop.get(shopId)
        let uid = ''
        let userData: UserType
        try {
            const userAuth = await admin.auth().getUserByEmail(email)
            uid = userAuth.uid
        } catch (_) {
            const password = randomString()
            const createdUser = await admin.auth().createUser({ email, password })
            uid = createdUser.uid
            await sendMail({
                to: email,
                subject: 'Password For accessing your shop',
                html: password
            })
        }
        try {
            userData = await user.get(uid)
        } catch (_) {
            userData = { uid, email, [role]: [] }
        }
        userData[role]?.push(shopId)
        shopData[role].push(uid)
        await claims.set(uid, { shopId, role })
        await user.set(uid, userData)
        await shop.set(shopId, shopData)
        return successCreated(res)
    } catch (err) {
        console.error(`${err.code} -  ${err.message}`)
        return serverError(res, err)
    }
}