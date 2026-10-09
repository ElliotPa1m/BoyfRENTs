import { z } from 'zod'
import { fetchJson } from '../lib/fetchJson.js'

const BASE_URL = 'https://api.frankfurter.dev/v1'
const CACHE_MS = Number(process.env.CURRENCY_CACHE_SECONDS ?? 21600) * 1000

const cache = {}

const FrankfurterRates = z.object({
    amount: z.number(),
    base: z.string(),
    date: z.string(),
    rates: z.record(z.string(), z.number().positive())
})

export async function getRates(base = 'USD', symbols = ['SEK', 'EUR', 'USD', 'IDR']) {
    if (cache[base] && cache[base].expiresAt > Date.now()) {
        return cache[base].value
    }
    const url = new URL(`${BASE_URL}/latest`)
    url.searchParams.set('base', base)
    url.searchParams.set('symbols', symbols.join(','))

    const data = await fetchJson(url)

    const result = FrankfurterRates.safeParse(data);

    if (!result.success) {
        throw new Error(`Frankfurter responded with an unexpected format:\n${z.prettifyError(result.error)}`)
    }

    const value = {
        base: result.data.base,
        date: result.data.date,
        rates: { ...result.data.rates, [result.data.base]: 1 }
    }

    cache[base] = { value, expiresAt: Date.now() + CACHE_MS }

    return value
}