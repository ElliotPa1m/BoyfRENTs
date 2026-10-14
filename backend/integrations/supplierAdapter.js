import {parse} from 'csv-parse/sync'
import { XMLParser } from 'fast-xml-parser'

const XmlParser = new XMLParser({
        ignoreAttributes: false,
        parseTagValue: false,
        isArray: (name) => name === 'produkt' || name === 'variant',
    })

export async function getCsvProducts() {

    if (!process.env.SUPPLIER_API_URL || !process.env.SUPPLIER_API_KEY) {
    throw new Error('SUPPLIER_API_URL or SUPPLIER_API_KEY is missing in .env')
    }

    const url = `${process.env.SUPPLIER_API_URL}/export/products.csv?bransch=${process.env.SUPPLIER_BRANSCH}`

    const response = await fetch(url, {
        headers: {'X-Api-Key': process.env.SUPPLIER_API_KEY},
        signal: AbortSignal.timeout(Number(process.env.SUPPLIER_API_TIMEOUT_MS)),
    })
    if (!response.ok) {
        throw new Error(`Couldn't fetch data. Supplier request failed: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()

    const text = new TextDecoder('windows-1252').decode(buffer)
    
    const rows = parse(text, {
        columns: true,
        delimiter: ';',
        skip_empty_lines: true,
        trim: true
    })

    const products = rows.map((row) => ({
        sku: row.artNr,
        name: row.benamning,
        price: Number(row.pris.replace(',', '.')),
        category: row.kategori,
        age: Number(row.alder),
        variants: row.varianter.split('|')
    }))
    
    return products
}

export async function getXmlProducts() {
    
    if (!process.env.SUPPLIER_API_URL || !process.env.SUPPLIER_API_KEY) {
    throw new Error('SUPPLIER_API_URL or SUPPLIER_API_KEY is missing in .env')
    }

    const url = `${process.env.SUPPLIER_API_URL}/export/products.xml?bransch=${process.env.SUPPLIER_BRANSCH}`

    const response = await fetch(url, {
        headers: {'X-Api-Key': process.env.SUPPLIER_API_KEY},
        signal: AbortSignal.timeout(Number(process.env.SUPPLIER_API_TIMEOUT_MS)),
    })
    
    if (!response.ok) {
        throw new Error(`Couldn't fetch data. Supplier request failed: ${response.status}`)
    }

    const text = await response.text()

    const doc = XmlParser.parse(text)

    const products = doc.katalog.produkt.map((p) => ({
        sku: p['@_artNr'],
        name: p.benamning,
        price: Number(p.pris['#text']),
        category: p.kategori,
        age: Number(p.alder),
        variants: p.varianter?.variant ?? []
    }))

    return products
}

export async function getSupplierCatalog(format) {

    if (format === 'csv') {
        return getCsvProducts()
    }

    if (format === 'xml') {
        return getXmlProducts()
    }
    throw new Error(`Unsupported format: ${format}`)
}
