import { isValidAddress } from "../../models/common";
import { Address } from "../../models/common/schema";
import { UserInterface } from "../../models/user/schema";
import { isBothObjectEqual } from "../../utils/objectUtils";

export function setUserBillingAddress(userData: UserInterface, address: Address) {
    try {
        if (isValidAddress(address)) {
            userData.billingAddress = address
        }
        return userData
    } catch (err) {
        throw err;
    }
}

export function removeUserBillingAddress(userData: UserInterface, address: Address) {
    try {
        const { billingAddress } = userData
        if (isBothObjectEqual(address, billingAddress)) {
            userData.billingAddress = null
        }
        return userData
    } catch (err) {
        throw err
    }
}

export function setUserShippingAddress(userData: UserInterface, address: Address) {
    try {
        if (isValidAddress(address)) {
            userData.shippingAddress = address
            const allEqual = userData.addresses.map(addr => {
                return isBothObjectEqual(addr, address)
            }).filter(e => e)
            if (allEqual.length === 0) {
                userData.addresses.unshift(address)
            }
        }
        return userData
    } catch (err) {
        throw err;
    }
}

export function removeUserShippingAddress(userData: UserInterface, address: Address) {
    try {
        const { shippingAddress, addresses } = userData
        if (isBothObjectEqual(address, shippingAddress)) {
            userData.billingAddress = null
        }
        userData.addresses = addresses.filter(a => isBothObjectEqual(a, address))
        return userData
    } catch (err) {
        throw err
    }
}
