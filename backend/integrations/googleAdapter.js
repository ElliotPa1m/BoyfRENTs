import jwt from "jsonwebtoken"
import { z } from "zod"

const TIMEOUT_MS = 5_000

function getConfig() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
        throw new Error("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or GOOGLE_CALLBACK_URL is missing in .env")
    }
    return { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackUrl: GOOGLE_CALLBACK_URL }
}

export function getAuthorizeUrl(state, codeChallenge) {
    const { clientId, callbackUrl } = getConfig()

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: "openid email profile",
        redirect_uri: callbackUrl,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "select_account"
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

const TokenAnswer = z.object({
    id_token: z.string().min(1)
})

const Claims = z.object({
    iss: z.string(),
    aud: z.string(),
    exp: z.number(),
    sub: z.string().min(1),
    email: z.email(),
    email_verified: z.boolean().optional(),
    name: z.string().optional()
})

export async function exchangeCode(code, codeVerifier) {
    const { clientId, clientSecret, callbackUrl } = getConfig()

    let response
    try {
        response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                code_verifier: codeVerifier,
                grant_type: "authorization_code",
                redirect_uri: callbackUrl
            }),
            signal: AbortSignal.timeout(TIMEOUT_MS)
        })
    } catch (err) {
        throw new Error("Could not reach Google", { cause: err })
    }

    let answer
    try {
        answer = await response.json()
    } catch {
        throw new Error(`Unexpected answer from Google (status ${response.status})`)
    }

    if (!response.ok) {
        throw new Error(`Google refused the code: ${answer.error ?? response.status}`)
    }

    const tokenAnswer = TokenAnswer.safeParse(answer)
    if (!tokenAnswer.success) {
        throw new Error(`Unexpected answer from Google: ${z.prettifyError(tokenAnswer.error)}`)
    }

    const parsed = Claims.safeParse(jwt.decode(tokenAnswer.data.id_token))
    if (!parsed.success) {
        throw new Error(`Unexpected ID token from Google: ${z.prettifyError(parsed.error)}`)
    }
    const claims = parsed.data

    if (claims.iss !== "https://accounts.google.com" && claims.iss !== "accounts.google.com") {
        throw new Error("The ID token is not from Google")
    }
    if (claims.aud !== clientId) {
        throw new Error("The ID token is for another app")
    }
    if (claims.exp * 1000 < Date.now()) {
        throw new Error("The ID token has expired")
    }

    return {
        sub: claims.sub,
        email: claims.email,
        emailVerified: claims.email_verified === true,
        name: claims.name ?? claims.email
    }
}