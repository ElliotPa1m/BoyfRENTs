import express from "express"
import { ObjectId } from "mongodb"
import { db } from "../index.js"
import { verifyWebhook } from "../integrations/paymentAdapter.js"

const router = express.Router()

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"]
    if (typeof signature !== "string") {
        return res.status(400).send("Missing Stripe-Signature")
    }

    let event
    try {
        event = verifyWebhook(req.body, signature)
    } catch (err) {
        console.error("Webhook signature verification failed", err)
        return res.status(400).send("Invalid signature")
    }
    try {
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
                const session = event.data.object
                if (session.payment_status !== "paid") break

                const orderId = session.client_reference_id
                const result = await db.collection("orders").updateOne(
                    { _id: new ObjectId(orderId), status: "pending" },
                    { $set: { status: "paid", paidAt: new Date() } }
                )

                if (result.modifiedCount === 0) break

                const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })
                for (const item of order.items) {
                    await db.collection("products").updateOne(
                        { _id: new ObjectId(item.productId) },
                        { $inc: { stock: -item.quantity } }
                    )
                }
                break
            }
            case "checkout.session.expired": {
                const session = event.data.object
                const orderId = session.client_reference_id

                await db.collection("orders").updateOne(
                    { _id: new ObjectId(orderId), status: "pending" },
                    { $set: { status: "cancelled" } }
                )
                break
            }
            default:
                console.log("Ignored event type:", event.type)
        }
    } catch (err) {
        console.error(err)
        return res.status(500).send("Webhook handler failed")
    }

    res.json({ received: true })
})

export default router;