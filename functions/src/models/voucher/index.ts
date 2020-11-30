import { vouchersRef } from '../../config/db'
import { decrementVoucher, incrementVoucher } from '../analytics/voucher'
import { setCondition } from '../common'
import { VoucherInterface, VoucherType, Voucher, VoucherCondition, VoucherOrderBy } from './schema'

export async function get(voucherId: string, transaction?: FirebaseFirestore.Transaction): Promise<VoucherInterface> {
    try {
        let doc
        if (transaction) {
            doc = await transaction.get(getRef(voucherId))
        } else {
            doc = await getRef(voucherId).get()
        }
        if (!doc.exists) throw new Error('Voucher not found')
        const data = <VoucherInterface>doc.data()
        data.voucherId = doc.id
        return new Voucher(data).get()
    } catch (err) {
        throw err
    }
}

export async function getOneByCondition(conditions: VoucherCondition[], voucherBy?: VoucherOrderBy): Promise<VoucherInterface | null> {
    try {
        const data = await getByCondition(conditions, voucherBy, 1)
        if (!data) {
            return data
        }
        else {
            return data[0]
        }
    } catch (err) {
        throw err;
    }
}

export async function getByCondition(conditions: VoucherCondition[], voucherBy?: VoucherOrderBy, limit?: number): Promise<VoucherInterface[] | null> {
    try {
        const ref = setCondition(vouchersRef, conditions, voucherBy, limit);
        return await getAll(ref)
    } catch (err) {
        throw err;
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
        await getRef(voucherId).set(dataToInsert)
        return true
    } catch (err) {
        throw err
    }
}

export async function update(voucherId: string, voucher: VoucherType): Promise<boolean> {
    try {
        await getRef(voucherId).update({ ...voucher, updatedAt: Date.now() })
        return true
    } catch (err) {
        throw err
    }
}

export async function remove(voucherId: string): Promise<boolean> {
    try {
        await getRef(voucherId).delete()
        await decrementVoucher()
        return true
    } catch (err) {
        throw err
    }
}

export function getRef(id: string) {
    return vouchersRef.doc(id)
}

export function batchSet(batch: FirebaseFirestore.WriteBatch, voucherId: string, voucher: VoucherType) {
    try {
        const dataToInsert = new Voucher(voucher).get()
        dataToInsert.updatedAt = Date.now()
        return batch.set(getRef(voucherId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchUpdate(batch: FirebaseFirestore.WriteBatch, voucherId: string, voucher: VoucherType) {
    try {
        return batch.update(getRef(voucherId), { ...voucher, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function batchDelete(batch: FirebaseFirestore.WriteBatch, voucherId: string) {
    try {
        return batch.delete(getRef(voucherId))
    } catch (err) {
        throw err
    }
}

export function transactionSet(transaction: FirebaseFirestore.Transaction, voucherId: string, voucher: VoucherType) {
    try {
        const dataToInsert = new Voucher(voucher).get()
        dataToInsert.updatedAt = Date.now()
        return transaction.set(getRef(voucherId), dataToInsert)
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionUpdate(transaction: FirebaseFirestore.Transaction, voucherId: string, voucher: VoucherType) {
    try {
        return transaction.update(getRef(voucherId), { ...voucher, updatedAt: Date.now() })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export function transactionDelete(transaction: FirebaseFirestore.Transaction, voucherId: string) {
    try {
        return transaction.delete(getRef(voucherId))
    } catch (err) {
        throw err
    }
}

async function getAll(ref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, transaction?: FirebaseFirestore.Transaction) {
    let doc
    if (transaction) {
        doc = await transaction.get(ref)
    } else {
        doc = await ref.get()
    }
    if (doc.empty) return null
    return doc.docs.map(d => {
        let data = d.data() as VoucherInterface
        data.voucherId = d.id
        data = new Voucher(data).get()
        return data
    })
}
