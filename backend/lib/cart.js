import { ObjectId } from "mongodb"
import { db } from "../index.js"

// Summan av varorna i varukorgen, med priserna från DATABASEN (aldrig från React)
export async function getItemsTotal(items) {
    const quantities = {}
    for (const item of items) {
        quantities[item.productId] = (quantities[item.productId] || 0) + item.quantity
    }

    const ids = Object.keys(quantities).map(id => new ObjectId(id))
    const products = await db.collection("products").find({ _id: { $in: ids } }).toArray()

    let total = 0
    for (const product of products) {
        total += product.price * quantities[String(product._id)]
    }
    return Math.round(total * 100) / 100
}