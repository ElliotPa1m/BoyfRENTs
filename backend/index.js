import "dotenv/config"
import express from "express";
import cors from "cors";
import { MongoClient, Db } from "mongodb";
import dns from "node:dns";
import productRoutes from "./routes/products.js"
import orderRoutes from "./routes/orders.js"
import authRoutes from "./routes/auth.js"
import cartRoutes from "./routes/cart.js"
import currencyRoutes from "./routes/currency.js"
import adminRoutes from "./routes/admin.js"
import algoliaAdminRoutes from "./routes/algoliaAdmin.js"
import searchRoutes from "./routes/search.js"

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dns.setDefaultResultOrder("ipv4first");

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/currency", currencyRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/admin/algolia", algoliaAdminRoutes)
app.use("/api/search", searchRoutes)

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" })
})

app.use((err, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl} failed: ${err.message}`)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

const client = new MongoClient(process.env.MONGO_URI) 

export const db = client.db("ehandel")

async function startServer() {
  await client.connect()
  console.log("Ansluten till MongoDB")
  
  app.listen(PORT, () => {
    console.log(`Servern körs på port ${PORT}`)
  })
}

startServer()
export default app;