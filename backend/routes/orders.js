import express from "express";
import { db } from "../index.js";
import { ObjectId } from "mongodb";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router()

router.get("/by-session", async (req, res) => {
    const sessionId = req.query.session_id

    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
        return res.status(400).json({error: "Invalid session id"})
    }

    const order = await db.collection("orders").findOne({stripeSessionId: sessionId})
    if (!order) {
        return res.status(404).json({error: "Order not found"})
    }

    res.json({status: order.status, totalPrice: order.totalPrice, items: order.items})
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