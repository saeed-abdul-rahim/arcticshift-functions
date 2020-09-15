import { razorpay } from '../../config'

export async function createCustomer(name: string, uid: string, email?: string, contact?: string) {
    try {
        return razorpay.customers.create({
            name,
            email,
            contact,
            notes: {
                uid
            }
        })
    } catch (err) {
        throw err
    }
}