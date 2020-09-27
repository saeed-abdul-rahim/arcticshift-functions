import { vouchersRef } from '../../config/db'
import { decrementVoucher, incrementVoucher } from '../analytics/voucher'
import { VoucherInterface, VoucherType, Voucher } from './schema'

export async function get(voucherId: string): Promise<VoucherInterface> {
    try {
        const doc = await vouchersRef.doc(voucherId).get()
        if (!doc.exists) throw new Error('Voucher not found')
        const data = <VoucherInterface>doc.data()
        data.voucherId = doc.id
        return new Voucher(data).get()
    } catch (err) {
        throw err
    }
}

export async function add(voucher: VoucherType): Promise<string> {
    try {
        const id = vouchersRef.doc().id
        voucher.voucherId = id
        await set(id, voucher)
        await incrementVoucher()
        return id
    } catch (err) {
        throw err
    }
}

export async function set(voucherId: string, voucher: VoucherType): Promise<boolean> {
    try {
        const dataToInsert = new Voucher(voucher).get()
        dataToInsert.updatedAt = Date.now()
        await vouchersRef.doc(voucherId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(voucherId: string, voucher: VoucherType): Promise<boolean> {
    try {
        await vouchersRef.doc(voucherId).update({ ...voucher, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(voucherId: string): Promise<boolean> {
    try {
        await vouchersRef.doc(voucherId).delete()
        await decrementVoucher()
        return true
    } catch (err) {
        throw err
    }
}

export async function getRef(id?: string) {
    if (id) {
        return vouchersRef.doc(id)
    } else {
        return vouchersRef
    }
}
