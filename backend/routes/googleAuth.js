import express from "express"
import jwt from "jsonwebtoken"
import {z} from "zod"
import {db} from "../index.js"
import { getAuthorizeUrl, exchangeCode } from "../integrations/googleAdapter.js"
import { randomString, toCodeChallenge } from "../lib/pkce.js"
import { sessionCookie, flowCookie } from "../lib/cookies.js"

const router = express.Router()

const CallbackQuery = z.object({
    code: z.string().min(1),
    state: z.string().min(1)
})

router.get("/", (req, res) => {
    const loginUrl = `${process.env.CLIENT_URL}/login`
    try  {
        const state = randomString()
        const codeVerifier = randomString()

        res.cookie("oauth_state", state, flowCookie)
        res.cookie("oauth_verifier", codeVerifier, flowCookie)

        return res.redirect(getAuthorizeUrl(state, toCodeChallenge(codeVerifier)))
    } catch (err) {
        console.error(err)
        return res.redirect(`${loginUrl}?error=google_unavailable`)
    }
})

router.get("/callback", async (req, res) => {
    const fail = (error) => res.redirect(`${process.env.CLIENT_URL}/login?error=${error}`)

    const savedState = req.cookies?.oauth_state
    const codeVerifier = req.cookies?.oauth_verifier

    res.clearCookie("oauth_state", flowCookie)
    res.clearCookie("oauth_verifier", flowCookie)

    if (req.query.error) {
        return fail(req.query.error === "access_denied" ? "google_cancelled" : "google_error")
    }

    const query = CallbackQuery.safeParse(req.query)
    if (!query.success || !savedState || !codeVerifier || query.data.state !== savedState) {
        return fail("invalid_login")
    }

    try {
        const profile = await exchangeCode(query.data.code, codeVerifier)

        await db.collection("customers").updateOne(
            { googleSub: profile.sub },
            {
                $setOnInsert: { googleSub: profile.sub, createdAt: new Date() },
                $set: { email: profile.email, name: profile.name, lastLoginAt: new Date() }
            },
            { upsert: true }
        )
        const customer = await db.collection("customers").findOne({googleSub: profile.sub})

        const token = jwt.sign(
            { id: String(customer._id), email: customer.email, name: customer.name },
            process.env.SESSION_TOKEN_SECRET,
            { expiresIn: "7d" }
        )
        res.cookie("session", token, sessionCookie)

        return res.redirect(`${process.env.CLIENT_URL}/account`)
    } catch (err) {
        console.error(err)
        return fail("google_failed")
    }
})

export default router