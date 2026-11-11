import express from "express"
import {db} from "../index.js"
import { verifyToken } from "../middleware/customerAuth.js"
import { sessionCookie } from "../lib/cookies.js"

const router = express.Router()

router.get("/", verifyToken, (req, res) => {
    res.json(res.locals.customer)
})

router.get("/orders", verifyToken, async (req, res) => {
    const orders = await db.collection("orders")
        .find({customerId: res.locals.customer.id})
        .sort({createdAt: -1})
        .toArray()

    res.json(orders.map(order => ({
        id: String(order._id),
        createdAt: order.createdAt,
        status: order.status,
        items: order.items,
        itemsTotal: order.itemsTotal,
        shippingMethod: order.shippingMethod,
        shippingPrice: order.shippingPrice,
        servicePoint: order.servicePoint,
        totalPrice: order.totalPrice
    })))
})

router.post("/logout", (req, res) => {
        res.clearCookie("session", sessionCookie)
        res.json({loggedOut: true})
    })

export default router