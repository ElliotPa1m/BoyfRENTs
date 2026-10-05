import { Router } from 'express'
import { getRates } from '../integrations/currencyAdapter.js';

const router = Router()

const ALLOWED = ['USD', 'SEK', 'EUR', 'IDR']

router.get('/rates', async (req, res) => {
    const base = (req.query.base ?? 'USD')

    if (!ALLOWED.includes(base)) {
        return res.status(400).json({error: 'Invalid currency'})
    }

    try{
        res.json(await getRates(base))
    } catch (err) {
        res.status(502).json({error: 'Could not fetch exchange rates'})
    }
    
})

export default router