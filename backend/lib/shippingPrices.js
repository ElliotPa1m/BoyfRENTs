// Fraktpriser i USD, eftersom shopen debiterar i USD
export const SHIPPING_PRICES = {
    service_point: 5,
    home: 10
}

// Fri frakt när varorna kostar minst så här mycket
export const FREE_SHIPPING_FROM = 100

export function calculateShipping(method, itemsTotal) {
    if (!Object.hasOwn(SHIPPING_PRICES, method)) {
        throw new Error(`Unknown shipping method: ${method}`)
    }
    return itemsTotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_PRICES[method]
}