import express from "express"
import jwt from "jsonwebtoken"
import { db } from "../index.js"
import { getAuthorizeUrl, exchangeCode, getUser } from "../integrations/githubAdapter.js"
import { randomString, toCodeChallenge } from "../lib/pkce.js"
import { adminCookie, githubFlowCookie, ADMIN_SESSION_SECONDS } from "../lib/cookies.js"
import { requireGithubAdmin, getAdminLogins } from "../middleware/adminAuth.js"

const router = express.Router()

router.get("/", (req, res) => {
    try {
        const state = randomString()
        const codeVerifier = randomString()
        res.cookie("gh_oauth_state", state, githubFlowCookie)
        res.cookie("gh_oauth_verifier", codeVerifier, githubFlowCookie)
        return res.redirect(getAuthorizeUrl(state, toCodeChallenge(codeVerifier)))
    } catch (err) {
        console.error(err)
        return res.redirect(`${process.env.CLIENT_URL}/login?error=github_unavailable`)
    }
})

router.get("/callback", async (req, res) => {
    const fail = (error) => res.redirect(`${process.env.CLIENT_URL}/login?error=${error}`)

    const savedState = req.cookies?.gh_oauth_state
    const codeVerifier = req.cookies?.gh_oauth_verifier
    res.clearCookie("gh_oauth_state", githubFlowCookie)
    res.clearCookie("gh_oauth_verifier", githubFlowCookie)

    if (req.query.error) {
        return fail(req.query.error === "access_denied" ? "github_cancelled" : "github_error")
    }

    const { code, state } = req.query
    if (typeof code !== "string" || typeof state !== "string" || !savedState || !codeVerifier || state !== savedState) {
        return fail("invalid_login")
    }

    try {
        const accessToken = await exchangeCode(code, codeVerifier)
        const user = await getUser(accessToken)

        if (!getAdminLogins().includes(user.login.toLowerCase())) {
            return fail("not_admin")
        }

        await db.collection("admins").updateOne(
            { githubId: user.id },
            {
                $setOnInsert: { githubId: user.id, createdAt: new Date() },
                $set: { login: user.login, lastLoginAt: new Date() }
            },
            { upsert: true }
        )

        const token = jwt.sign(
            { id: user.id, login: user.login, role: "admin" },
            process.env.ADMIN_SESSION_TOKEN_SECRET,
            { expiresIn: ADMIN_SESSION_SECONDS }
        )
        res.cookie("admin_token", token, adminCookie)
        return res.redirect(`${process.env.CLIENT_URL}/admin`)
    } catch (err) {
        console.error(err)
        return fail("github_failed")
    }
})

router.get("/me", requireGithubAdmin, (req, res) => {
    res.json(res.locals.admin)
})

router.post("/logout", (req, res) => {
    res.clearCookie("admin_token", adminCookie)
    res.json({loggedOut: true})
})

export default router