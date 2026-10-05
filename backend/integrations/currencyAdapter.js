const BASE_URL = 'https://api.frankfurter.dev/v1'

export async function getRates(base = 'USD', symbols = ['SEK', 'EUR', 'USD', 'IDR'])  {
    const url = new URL(`${BASE_URL}/latest`)
    url.searchParams.set('base', base)
    url.searchParams.set('symbols', symbols.join(','))
    
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`API error: ${response.status}`)

        const data = await response.json()
        
        return {
          base: data.base,
          date: data.date,
          rates: {...data.rates, [data.base]: 1}
        }
    } catch(err) {
        console.error(err)
        throw new Error('Something went wrong')
    }
}