import express from "express";
import {db} from "../index.js"
import {protect} from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", protect, async (req, res) => {
    const cart = await db.collection("carts").findOne({userId: req.user.id})
    res.json(cart || {items: []})
})

router.put("/", protect, async (req, res) => {
    const result = await db.collection("carts").updateOne(
        {userId: req.user.id},
        {$set: {items: req.body.items}},
        {upsert: true}
    )
    res.json(result)
})

router.delete("/", protect, async (req, res) => {
    const result = await db.collection("carts").deleteOne({userId: req.user.id})
    res.json(result)
})

export default router