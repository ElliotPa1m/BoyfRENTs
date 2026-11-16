import {z} from "zod"

const TIMEOUT_MS = 5_000

function getConfig() {
    const {RESEND_API_KEY, EMAIL_FROM} = process.env
    if (!RESEND_API_KEY || !EMAIL_FROM) {
        throw new Error("RESEND_API_KEY or EMAIL_FROM is missing in .env")
    }
    return {apiKey: RESEND_API_KEY, from: EMAIL_FROM}
}

const ResendAnswer = z.object({
    id: z.string().min(1)
})

export async function sendEmail({to, subject, html, text}, idempotencyKey) {
    const {apiKey, from} = getConfig()

    let response
    try {
        response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({from, to, subject, html, text}),
            signal: AbortSignal.timeout(TIMEOUT_MS)
        })
    } catch (err) {
        throw new Error("Could not reach Resend", {cause: err})
    }

    let answer
    try {
        answer = await response.json()
    } catch {
        throw new Error(`Unexpected answer from Resend (status ${response.status})`)
    }

    if (!response.ok) {
        throw new Error(`Resend answered ${response.status}: ${answer?.message ?? "unknown error"}`)
    }

    const parsed = ResendAnswer.safeParse(answer)
    if (!parsed.success) {
        throw new Error(`Unexpected answer from Resend: ${z.prettifyError(parsed.error)}`)
    }
    return parsed.data.id
}