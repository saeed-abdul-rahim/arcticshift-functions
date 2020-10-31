import { Request, Response } from "express";
import * as shop from "../models/shop"
import { Role } from '../models/common/schema'
import { forbidden } from '../responseHandler/errorHandler';

export function isAuthorized(opts: { hasRole?: Array<Role>, allowSameUser?: boolean }) {
   return async (req: Request, res: Response, next: Function) => {
        const { claims, uid } = res.locals
        const { id } = req.params
        const { shopid } = req.headers
        const userId = req.body?.data?.userId || ''
        res.locals = { ...res.locals, shopId: shopid }
        if (opts.allowSameUser && ((id && uid === id) || (userId && uid === userId)))
            return next();
        else if (!claims)
            return forbidden(res);
        else if(!shopid)
            return forbidden(res);
        else if (shopid && typeof shopid === "string" && opts.hasRole) {
            const shopData = await shop.get(shopid)
            opts.hasRole.map(role => {
                if (shopData[role].includes(uid)) {
                    res.locals = { ...res.locals, role, shopData }
                    return next();
                }
            })
        } else return forbidden(res)
   }
}