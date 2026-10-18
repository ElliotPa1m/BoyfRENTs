import express from "express"
import {protect, adminOnly} from "../middleware/authMiddleware.js"
import {db} from "../index.js"
import { indexProducts } from "../integrations/searchAdapter.js"

const router = express.Router()

router.post("/reindex", protect, adminOnly, async (req, res) => {

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