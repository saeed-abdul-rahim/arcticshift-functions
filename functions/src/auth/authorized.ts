import { Request, Response } from "express";
import * as shop from "../models/shop"
import { Role } from '../models/common/schema'
import { forbidden } from '../responseHandler/errorHandler';

export function isAuthorized(opts: { hasRole?: Array<Role>, allowSameUser?: boolean }) {
   return async (req: Request, res: Response, next: Function) => {
        const { claims, uid } = res.locals
        const { id } = req.params
        const { shopId } = req.headers
        res.locals = { ...res.locals, groupId: shopId }
        if (opts.allowSameUser && id && uid === id)
            return next();
        else if (!claims)
            return forbidden(res);
        else if(!shopId)
            return forbidden(res);
        else if (shopId && typeof shopId === "string" && opts.hasRole) {
            const shopData = await shop.get(shopId)
            opts.hasRole.map(role => {
                if (shopData[role].includes(uid)) {
                    res.locals = { ...res.locals, role, shopData }
                    return next();
                }
            })
        } else return forbidden(res)
   }
}