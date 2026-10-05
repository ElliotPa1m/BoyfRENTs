import express from "express";
import { db } from "../index.js";
import { ObjectId } from "mongodb";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/", async (req, res) => {
    const orderedProduct = req.body
    const result = await db.collection("orders").insertOne(orderedProduct)
    res.json({...orderedProduct, _id: result.insertedId})
})

router.get("/", protect, adminOnly, async (req, res) => {
    const products = await db.collection("orders").find().toArray()
    res.json(products)
})

router.put("/:id", protect, adminOnly, async (req, res) => {
    const id = req.params.id
    const update = req.body
    const result = await db.collection("orders").updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
    )
    res.json(result)
})

export default router;