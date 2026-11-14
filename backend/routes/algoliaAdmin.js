import express from "express"
import { requireAdmin } from "../middleware/adminAuth.js"
import {db} from "../index.js"
import { indexProducts } from "../integrations/searchAdapter.js"

const router = express.Router()

router.post("/reindex", requireAdmin, async (req, res) => {

    try {
        const products = await db.collection("products").find().toArray()
        await indexProducts(products)
        return res.json({indexed: products.length})
    } catch (err) {
        console.error(err)
        return res.status(502).json({error: 'Could not update the search index'})
    }
})

export default router;