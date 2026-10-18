import { z } from 'zod'
import express from "express"
import { getSupplierCatalog } from '../integrations/supplierAdapter.js';
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { db } from "../index.js";
import { indexProducts } from '../integrations/searchAdapter.js';

const SupplierProduct = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  age: z.number().int().min(18).max(65),
  variants: z.array(z.string()).min(1),
});

const router = express.Router()

router.post('/products/import/:format', protect, adminOnly, async (req, res) => {
  const { format } = req.params

  if (format !== 'csv' && format !== 'xml')
    return res.status(400).json({ error: 'The correct format could not be collected. Format must be csv or xml' })

  let candidates
  try {
    candidates = await getSupplierCatalog(format)
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: 'Catalog could not be fetched from the supplier' })
  }

  const valid = []
  const skipped = []

  for (const candidate of candidates) {
    const result = SupplierProduct.safeParse(candidate)
    if (result.success) {
      valid.push(result.data)
    } else {
      const issue = result.error.issues[0]
      skipped.push({
        sku: candidate.sku,
        reason: `${issue.path.join('.')}: ${issue.message}`
      })
    }
  }

  let created = 0
  let updated = 0

  try {
    for (const product of valid) {
      const result = await db.collection("products").updateOne(
        { sku: product.sku },
        { $set: product },
        { upsert: true }
      )

      if (result.upsertedCount === 1) {
        created++
      } else {
        updated++
      }
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not save the products to the database' })
  }

  const skus = valid.map(p => p.sku)
  let searchIndexUpdated = true
  try {
    const saved = await db.collection("products").find({sku: {$in: skus}}).toArray()
    await indexProducts(saved)
  } catch (err) {
    console.error(err)
    searchIndexUpdated = false
  }

  res.json({ format, total: candidates.length, created, updated, skipped, searchIndexUpdated });
})

export default router;