import express from "express"
import {z} from "zod"
import {db} from "../index.js"
import {createHostedCheckout} from "../integrations/paymentAdapter.js"
import { ObjectId } from "mongodb"

const Cart = z.object({
    customerName: z.string().min(1),
    customerAddress: z.string().min(1),
    customerEmail: z.email(),
    customerZipCode: z.string().min(1),
    customerCounty: z.string().min(1),
    items: z.array(z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        quantity: z.number().int().min(1).max(100)
    })).min(1)
})

const router = express.Router()

router.post("/hosted", async (req, res) => {
    const cart = Cart.safeParse(req.body)
    if (!cart.success) {
        return res.status(400).json({error: "Invalid cart", details: z.prettifyError(cart.error)})
    }

    const quantities = {}
    for (const item of cart.data.items) {
        quantities[item.productId] = (quantities[item.productId] || 0) + item.quantity
    }

    const ids = Object.keys(quantities).map(id => new ObjectId(id))
    const products = await db.collection("products").find({_id: { $in: ids}}).toArray()

    const orderItems = []
    let totalPrice = 0

    for (const [productId, quantity] of Object.entries(quantities)) {
        const product = products.find(p => String(p._id) === productId)

        if (!product) {
            return res.status(400).json({error: "Product doesn't exist"})
        }

        if (!(product.stock >= quantity)) {
            return res.status(400).json({ error: `${product.name} is sold out or there are not enough hours left` })
        }
        
        orderItems.push({ productId, sku: product.sku, name: product.name, price: product.price, quantity, imageUrl: product.imageUrl })

        totalPrice += product.price * quantity
    }

    const order = {
        customerName: cart.data.customerName,
        customerAddress: cart.data.customerAddress,
        customerEmail: cart.data.customerEmail,
        customerZipCode: cart.data.customerZipCode,
        customerCounty: cart.data.customerCounty,
        items: orderItems,
        totalPrice: Math.round(totalPrice * 100) / 100,
        status: "pending",
        createdAt: new Date()
    }
    const result = await db.collection("orders").insertOne(order)
    const orderId = String(result.insertedId)

    try {
        const checkout = await createHostedCheckout(orderId, orderItems)

        await db.collection("orders").updateOne(
            {_id: result.insertedId},
            {$set: {stripeSessionId: checkout.sessionId}}
        )
        return res.json({url: checkout.url})
    } catch (err) {
        console.error(err)
        return res.status(502).json({error: "The payment service is not responding. Please try again later."})
    }
})

export default router