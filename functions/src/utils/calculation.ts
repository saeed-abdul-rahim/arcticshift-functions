export function getDiscountValue(price: number, discount: number) {
    return Number((price * discount / 100).toFixed(2))
}

export function getDiscountPrice(price: number, discount: number) {
    return Number((price - getDiscountValue(price, discount)).toFixed(2))
}

export function getTax(price: number, tax: number) {
    return Number((price * (tax / 100)).toFixed(2))
}