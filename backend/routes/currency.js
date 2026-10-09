import { Router } from 'express'
import { getRates } from '../integrations/currencyAdapter.js';

const router = Router()

const ALLOWED = ['USD', 'SEK', 'EUR', 'IDR']

router.get('/rates', async (req, res) => {
    const base = (req.query.base ?? 'USD')

    if (!ALLOWED.includes(base)) {
        return res.status(400).json({error: 'Invalid currency'})
    }

    res.json(await getRates(base))
    
})

export default router