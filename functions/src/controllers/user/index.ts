import { Request, Response } from 'express'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import * as storage from '../../storage'
import parsePhoneNumber from 'libphonenumber-js'

import { serverError, missingParam, badRequest } from '../../responseHandler/errorHandler'
import { successCreated, successUpdated } from '../../responseHandler/successHandler'
import * as razorpay from '../../payments/razorpay'

import * as shop from '../../models/shop'
import * as user from '../../models/user'
import * as claims from '../../models/userClaims'
import { isValidAddress } from '../../models/common'
import { ShopType } from '../../models/shop/schema'
import { Role } from '../../models/common/schema'
import { UserType, genders } from '../../models/user/schema'
import { randomString } from '../../utils/strUtils'
import { sendMail } from '../../mail'
import { CONTROLLERS } from '../../config/constants'
import { callerName } from '../../utils/functionUtils'

const functionPath = `${CONTROLLERS}/user/index`

export async function createUserDb(userRecord: admin.auth.UserRecord, context: functions.EventContext) {
    const { uid, email, phoneNumber, displayName } = userRecord
    await user.set(uid, {
        uid,
        name: displayName,
        email,
        phone: phoneNumber,
    })
}

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
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function linkWithPhoneNumber(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const authUser = await admin.auth().getUser(uid)
        if (authUser.phoneNumber) {
            const { phoneNumber } = authUser
            const parsedPhone = parsePhoneNumber(phoneNumber)
            const userData = await user.get(uid)
            userData.phone = phoneNumber
            userData.phoneCode = parsedPhone && parsedPhone.countryCallingCode.toString() || ''
            await razorpay.createCustomer(uid, '', '', phoneNumber)
            await user.set(uid, userData)
            return successUpdated(res)
        } else {
            return badRequest(res, 'Phone number not found')
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function linkWithEmail(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const authUser = await admin.auth().getUser(uid)
        if (authUser.email) {
            const { email } = authUser
            const userData = await user.get(uid)
            userData.email = email
            await razorpay.createCustomer(uid, '', email)
            await user.set(uid, userData)
            return successUpdated(res)
        } else {
            return badRequest(res, 'Email not found')
        }
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
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
            const valid = isValidAddress(shippingAddress)
            if (valid) {
                userData.shippingAddress = shippingAddress
            }
        }
        if (billingAddress) {
            const valid = isValidAddress(billingAddress)
            if (valid) {
                userData.billingAddress = billingAddress
            }
        }
        await user.set(uid, userData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function addToWishlist(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { data } = req.body
        const { productId } = data
        if (!productId) {
            return missingParam(res, 'Product ID')
        }
        const userData = await user.get(uid)
        userData.wishlist.push(productId)
        await user.set(uid, userData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function removeFromWishlist(req: Request, res: Response) {
    try {
        const { uid } = res.locals
        const { wid } = req.params
        const userData = await user.get(uid)
        userData.wishlist = userData.wishlist.filter(w => w !== wid)
        await user.set(uid, userData)
        return successUpdated(res)
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}

export async function createAdmin(req: Request, res: Response) {
    const { email, shopId }: { email: string, shopId: string } = req.body
    try {
        await create(res, {
            shopId,
            email,
            role: 'admin'
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }
}

export async function createStaff(req: Request, res: Response) {
    const { shopData }: { [shopData: string]: ShopType } = res.locals
    const { email }: { email: string } = req.body
    const { shopId } = shopData
    try {
        await create(res, {
            shopId,
            email,
            role: 'staff'
        })
    } catch (err) {
        console.error(`${functionPath}/${callerName()}`, err)
    }
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
        console.error(`${functionPath}/${callerName()}`, err)
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
        console.error(`${functionPath}/${callerName()}`, err)
        return serverError(res, err)
    }
}
