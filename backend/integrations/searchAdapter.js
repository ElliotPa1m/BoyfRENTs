import { algoliasearch } from "algoliasearch"

function getAdminClient() {
    if (!process.env.APP_ID || !process.env.ADMIN_KEY) {
        throw new Error('Algolia admin settings are missing in .env')
    }
    return algoliasearch(process.env.APP_ID, process.env.ADMIN_KEY)
}

function getSearchClient() {
    if (!process.env.APP_ID || !process.env.SEARCH_KEY) {
        throw new Error('Algolia search settings are missing in .env')
    }
    return algoliasearch(process.env.APP_ID, process.env.SEARCH_KEY)
}

export async function indexProducts(products) {

    const client = getAdminClient()

    const objects = products.map(p => ({
        objectID: p.sku,
        productId: p._id.toString(),
        name: p.name,
        category: p.category,
        price: p.price,
        age: p.age,
        description: p.description,
        imageUrl: p.imageUrl,
        variants: p.variants
    }))

    try {
        await client.saveObjects({ indexName: process.env.INDEX_NAME, objects })
    } catch (err) {
        throw new Error('Could not update the search index', { cause: err })
    }

}

export async function searchProducts({ query, page, pageSize }) {

    const client = getSearchClient()

    try {
        const result = await client.searchSingleIndex({
            indexName: process.env.INDEX_NAME,
            searchParams: { query, page: page - 1, hitsPerPage: pageSize }
        })

        const items = result.hits.map(hit => ({
            sku: hit.objectID,
            _id: hit.productId,
            name: hit.name,
            category: hit.category,
            price: hit.price,
            age: hit.age,
            description: hit.description,
            imageUrl: hit.imageUrl,
            variants: hit.variants
        }))

        return {
            items,
            total: result.nbHits,
            totalPages: result.nbPages,
            page,
            pageSize
        }

    } catch (err) {
        throw new Error('Could not search the products', { cause: err })
    }
}

export async function removeProduct(sku) {
    const client = getAdminClient()

    try {
        await client.deleteObject({indexName: process.env.INDEX_NAME, objectID: sku})
    } catch (err) {
        throw new Error('Could not remove the product from the search index', {cause: err})
    }
}