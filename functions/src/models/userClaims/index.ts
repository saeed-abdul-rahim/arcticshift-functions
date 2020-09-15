import * as admin from 'firebase-admin'
import { CustomClaims, CustomClaimsInterface, AllCustomClaimsInterface, CustomClaimsType } from './schema'

export async function get(uid: string): Promise<admin.auth.UserRecord> {
    try {
        return await admin.auth().getUser(uid)
    } catch (err) {
        throw err
    }
 }

export async function set(uid: string, newClaims: CustomClaimsType): Promise<boolean> {
    try {
        const user = await get(uid)
        const { customClaims } = user
        let setNewClaims
        if (customClaims && customClaims.claims) {
            const claims: CustomClaimsInterface[] = customClaims.claims
            const currentClaims = claims.find(c => c.shopId === newClaims.shopId)
            if (currentClaims && currentClaims.role === newClaims.role)
                return true
            setNewClaims = [ ...customClaims.claims.map((claim: CustomClaimsInterface) => new CustomClaims(claim).get()), newClaims ]
        }
        else
            setNewClaims = [ newClaims ]
        await admin.auth().setCustomUserClaims(uid, { claims: setNewClaims })
        return true
    } catch (err) {
        throw err
    }
 }

export async function remove(customClaims: AllCustomClaimsInterface, shopId: string, uid: string) : Promise<AllCustomClaimsInterface> {
    try {
        customClaims.claims = customClaims.claims.filter((claim: CustomClaimsInterface) => claim.shopId !== shopId)
        await setClaims(uid, customClaims)
        return customClaims
    } catch (err) {
        throw err
    }
}

export async function update(uid: string, updateClaims: CustomClaimsType): Promise<AllCustomClaimsInterface> {
    try {
        const user = await get(uid)
        const { customClaims } = user
        const newClaims = new CustomClaims(updateClaims)
        if (!customClaims || !customClaims.claims) throw new Error('User not part of any shop')
        const claims: AllCustomClaimsInterface = <AllCustomClaimsInterface>customClaims
        const shopIndex = claims.claims.findIndex((claim: CustomClaimsInterface) => claim.shopId === newClaims.shopId)
        claims.claims[shopIndex] = newClaims
        await setClaims(uid, claims)
        return claims
    } catch (err) {
        throw err
    }
}

export function findShop(customClaims: AllCustomClaimsInterface, shopId: string): CustomClaimsInterface {
    const claimFilter = customClaims.claims.find((claim: CustomClaimsInterface) => claim.shopId === shopId )
    if (!claimFilter) 
        throw new Error("User is not part of the shop")
    else return claimFilter
}

export function checkIfExist(user: admin.auth.UserRecord): AllCustomClaimsInterface {
    const { customClaims } = user
    if (!customClaims || !customClaims.claims || customClaims.claims.length === 0) 
        throw new Error("User does'nt have claims")
    return { claims: customClaims.claims as Array<any> }
}

async function setClaims(uid: string, customClaims: AllCustomClaimsInterface): Promise<boolean> {
    try {
        await admin.auth().setCustomUserClaims(uid, customClaims)
        return true
    } catch (err) {
        throw err
    }
}
