import express from "express"
import {z} from "zod"
import { searchProducts } from "../integrations/searchAdapter.js"

const SearchParams = z.object({
    q: z.string().trim().max(100).default(""),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

const router = express.Router()

router.get("/", async (req, res) => {
    const parsed = SearchParams.safeParse(req.query)

    if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return res.status(400).json({error: `${issue.path.join('.')}: ${issue.message}` })
    }

    try {
        const result = await searchProducts({
            query: parsed.data.q,
            page: parsed.data.page,
            pageSize: parsed.data.pageSize
        })
        return res.json(result)
    } catch (err) {
        console.error(err)
        return res.status(502).json({error: 'Search is currently unavailable'})
    }
})

export default router;