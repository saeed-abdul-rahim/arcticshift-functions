export function getDiscount(price: number, discount: number) {
    return Number((price - (price * discount / 100)).toFixed(2));
}

export function getTax(price: number, tax: number) {
    return Number((price * (tax / 100)).toFixed(2));
}