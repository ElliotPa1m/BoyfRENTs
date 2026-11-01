import express from "express"
import { z } from "zod"
import { findServicePoints, getDeliveryEstimates } from "../integrations/shippingAdapter.js"
import { getItemsTotal } from "../lib/cart.js"
import { SHIPPING_PRICES, FREE_SHIPPING_FROM, calculateShipping } from "../lib/shippingPrices.js"


const router = express.Router()

// 5 siffror, med eller utan mellanslag ("311 20" eller "31120")
const PostalCode = z.string().trim().regex(/^\d{3} ?\d{2}$/, "Postal code must be 5 digits")

const ServicePointQuery = z.object({
    postalCode: PostalCode
})

const EstimateQuery = z.object({
    postalCode: PostalCode,
    address: z.string().trim().min(1).max(100)
})

router.get("/service-points", async (req, res) => {
    const parsed = ServicePointQuery.safeParse(req.query)
    if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return res.status(400).json({ error: `${issue.path.join(".")}: ${issue.message}` })
    }

    const postalCode = parsed.data.postalCode.replace(" ", "")

    try {
        const servicePoints = await findServicePoints(postalCode)
        return res.json({ servicePoints })
    } catch (err) {
        console.error(err)
        return res.status(502).json({ error: "Could not fetch service points from PostNord. You can still choose home delivery." })
    }
})

router.get("/estimate", async (req, res) => {
    const parsed = EstimateQuery.safeParse(req.query)
    if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return res.status(400).json({ error: `${issue.path.join(".")}: ${issue.message}` })
    }

    const postalCode = parsed.data.postalCode.replace(" ", "")

    try {
        const estimates = await getDeliveryEstimates(parsed.data.address, postalCode)
        return res.json(estimates)
    } catch (err) {
        console.error(err)
        return res.status(502).json({ error: "Could not fetch the delivery time from PostNord." })
    }
})

const PricesBody = z.object({
    items: z.array(z.object({
        productId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        quantity: z.number().int().min(1).max(100)
    })).min(1)
})

router.post("/prices", async (req, res) => {
    const parsed = PricesBody.safeParse(req.body)
    if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return res.status(400).json({ error: `${issue.path.join(".")}: ${issue.message}` })
    }

    const itemsTotal = await getItemsTotal(parsed.data.items)

    res.json({
        itemsTotal,
        freeShippingFrom: FREE_SHIPPING_FROM,
        prices: {
            service_point: calculateShipping("service_point", itemsTotal),
            home: calculateShipping("home", itemsTotal)
        }
    })
})

export default router