import { roles } from '../models/common';
import { Role, AuthTypeImp } from '../models/common/schema';

export function getRole(data: AuthTypeImp, id: string): Role {
    try{
        const role = roles.find(r => {
            if (data[r].includes(id)) return r
            else return null
        })
        if (role) return role
        throw new Error('User not found')
    } catch (err) {
        throw err
    }
}