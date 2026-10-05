import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";
import dns from "node:dns";
import productRoutes from "./routes/products.js"
import orderRoutes from "./routes/orders.js"
import authRoutes from "./routes/auth.js"
import cartRoutes from "./routes/cart.js"

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok" })
})

console.log(process.env.MONGO_URI)

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