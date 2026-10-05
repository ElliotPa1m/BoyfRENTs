import express from "express";
import { db } from "../index.js";
import { ObjectId } from "mongodb";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router()

router.get("/", async (req, res) => {
    const products = await db.collection("products").find().toArray()
    res.json(products)
})

router.post("/", protect, adminOnly, async (req, res) => {
    const newProduct = req.body
    const result = await db.collection("products").insertOne(newProduct)
    res.json(result)
})

router.get("/:id", async (req, res) => {
    const id = req.params.id
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })
    res.json(product)
})

router.put("/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id
    const update = req.body
    const result = await db.collection("products").updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
    )
    res.json(result)
})

router.delete("/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id
    const result = await db.collection("products").deleteOne( { _id: new ObjectId(id) } )
    res.json(result)
})

export default router;