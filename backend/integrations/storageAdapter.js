import { randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

const TIMEOUT_MS = 10_000
const EXTENSIONS = {
    "image/png": "png",
    "image/jpeg": "jpg"
}

let supabase

function getSupabase() {

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY || !process.env.SUPABASE_BUCKET) {
        throw new Error("SUPABASE_URL, SUPABASE_SECRET_KEY or SUPABASE_BUCKET is missing in .env")
    }

    if (!supabase) {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
            global: {
                fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
            }
        })
    }
    return supabase
}

export async function uploadProductImage(sku, image) {
    const client = getSupabase()

    const extension = EXTENSIONS[image.mimeType]
    const path = `products/${sku}/${randomUUID()}.${extension}`

    const { error } = await client.storage.from(process.env.SUPABASE_BUCKET).upload(path, image.buffer, {
        contentType: image.mimeType,
        upsert: false
    })

    if (error) {
        throw new Error(`Could not upload the image to supabase: ${error.message}`)
    }

    const { data } = client.storage.from(process.env.SUPABASE_BUCKET).getPublicUrl(path)
    return { path, url: data.publicUrl }
}

export async function removeProductImage(path) {
    const client = getSupabase()
    const { error } = await client.storage.from(process.env.SUPABASE_BUCKET).remove([path])
    
    if (error) {
        throw new Error(`Could not delete the image in supabase: ${error.message}`)
    }
}