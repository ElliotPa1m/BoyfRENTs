import express from "express";
import { db } from "../index.js";
import { ObjectId } from "mongodb";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { indexProducts, removeProduct } from "../integrations/searchAdapter.js";

const router = express.Router()

router.get("/", async (req, res) => {
    const products = await db.collection("products").find().toArray()
    res.json(products)
})

router.post("/", protect, adminOnly, async (req, res) => {
    const newProduct = req.body

    const last = await db.collection("products").findOne(
        {sku: /^BF-/},
        {sort: {sku:-1}}
    )
    const next = last ? Number(last.sku.slice(3)) + 1 : 1
    newProduct.sku = "BF-" + String(next).padStart(3, "0")
    newProduct.stock = 10
    
    const result = await db.collection("products").insertOne(newProduct)

    let searchIndexUpdated = true
    try {
        await indexProducts([newProduct])
    } catch (err) {
        console.error(err)
        searchIndexUpdated = false
    }
    res.json({...result, searchIndexUpdated})
})

router.get("/:id", async (req, res) => {
    const id = req.params.id
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })
    res.json(product)
})

router.put("/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id
    const update = req.body
    delete update.sku
    const result = await db.collection("products").updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
    )

    const updated = await db.collection("products").findOne({_id: new ObjectId(id)})
    if (!updated) return res.status(404).json({error: "Product not found"})

    let searchIndexUpdated = true
    try {
        await indexProducts([updated])
    } catch (err) {
        console.error(err)
        searchIndexUpdated = false
    }
    res.json({...result, searchIndexUpdated})
})

router.delete("/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id

    const product = await db.collection("products").findOne({_id: new ObjectId(id)})
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id)})

    let searchIndexUpdated = true
    if (product) {
        try {
            await removeProduct(product.sku)
        } catch (err) {
            console.error(err)
            searchIndexUpdated = false
        }
    }
    res.json({ ...result, searchIndexUpdated })
})

export default router;