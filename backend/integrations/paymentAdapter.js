import Stripe from "stripe"

let stripe

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is missing in .env")
    }
    if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10_000 })
    }
    return stripe
}

export async function createHostedCheckout(orderId, items, shipping) {

    const client = getStripe()
    const clientUrl = process.env.CLIENT_URL

    if (!clientUrl) {
        throw new Error("CLIENT_URL is missing in .env")
    }

    // 1. bygg raderna för produkterna
    const lineItems = items.map(item => ({
        quantity: item.quantity,
        price_data: {
            currency: "usd",
            unit_amount: Math.round(item.price * 100),
            product_data: { name: item.name }
        }
    }))

    // 2. lägg till en rad för frakten (bara om den kostar något)
    if (shipping && shipping.price > 0) {
        lineItems.push({
            quantity: 1,
            price_data: {
                currency: "usd",
                unit_amount: Math.round(shipping.price * 100),
                product_data: { name: shipping.name }
            }
        })
    }

    // 3. skapa sessionen med hela listan
    const session = await client.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        client_reference_id: orderId,
        success_url: `${clientUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/cart`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60
    })

    return { sessionId: session.id, url: session.url }
}

export function verifyWebhook(rawBody, signature) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error("STRIPE_WEBHOOK_SECRET is missing in .env")
    }
    return getStripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
}