import {z} from "zod"

const TIMEOUT_MS = 5_000

function getLoginConfig() {
    const {GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL} = process.env
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
        throw new Error("GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET or GITHUB_CALLBACK_URL is missing in .env")
    }
    return {clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET, callbackUrl: GITHUB_CALLBACK_URL}
}

function getIssuesConfig() {
    const {GITHUB_ISSUES_TOKEN, GITHUB_REPO} = process.env
    if (!GITHUB_ISSUES_TOKEN || !GITHUB_REPO) {
        throw new Error("GITHUB_ISSUES_TOKEN or GITHUB_REPO is missing in .env")
    }

    const repo = GITHUB_REPO.replace(/\.git$/, "")
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
        throw new Error("GITHUB_REPO must look like owner/repo")
    }
    return {token: GITHUB_ISSUES_TOKEN, repo}
}

async function githubFetch(url, options = {}) {
    try {
        return await fetch(url, { ...options, signal: AbortSignal.timeout(TIMEOUT_MS) })
    } catch (err) {
        throw new Error("Could not reach GitHub", { cause: err })
    }
}

export function getAuthorizeUrl(state, codeChallenge) {
    const { clientId, callbackUrl } = getLoginConfig()

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: "read:user",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
    })
    return `https://github.com/login/oauth/authorize?${params}`
}

const TokenAnswer = z.object({
    access_token: z.string().min(1)
})

export async function exchangeCode(code, codeVerifier) {
    const { clientId, clientSecret, callbackUrl } = getLoginConfig()

    const response = await githubFetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: callbackUrl,
            code_verifier: codeVerifier
        })
    })

    let answer
    try {
        answer = await response.json()
    } catch {
        throw new Error(`Unexpected answer from GitHub (status ${response.status})`)
    }

    const parsed = TokenAnswer.safeParse(answer)
    if (!parsed.success) {
        throw new Error(`GitHub refused the code: ${answer?.error ?? response.status}`)
    }
    return parsed.data.access_token
}

const GithubUser = z.object({
    id: z.number().int(),
    login: z.string().min(1)
})

export async function getUser(accessToken) {
    const response = await githubFetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" }
    })
    if (!response.ok) {
        throw new Error(`GitHub answered ${response.status}`)
    }

    const parsed = GithubUser.safeParse(await response.json())
    if (!parsed.success) {
        throw new Error(`Unexpected user from GitHub: ${z.prettifyError(parsed.error)}`)
    }
    return parsed.data
}

function apiHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
}

const CreatedIssue = z.object({
    number: z.number().int(),
    title: z.string(),
    html_url: z.url()
})

export async function createIssue(title, body) {
    const { token, repo } = getIssuesConfig()

    const response = await githubFetch(`https://api.github.com/repos/${repo}/issues`, {
        method: "POST",
        headers: { ...apiHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ title, body })
    })
    if (!response.ok) {
        throw new Error(`GitHub answered ${response.status}`)
    }

    const parsed = CreatedIssue.safeParse(await response.json())
    if (!parsed.success) {
        throw new Error(`Unexpected answer from GitHub: ${z.prettifyError(parsed.error)}`)
    }
    return { number: parsed.data.number, title: parsed.data.title, url: parsed.data.html_url }
}

const IssueList = z.array(z.object({
    number: z.number().int(),
    title: z.string(),
    html_url: z.url(),
    user: z.object({ login: z.string() }).nullable(),
    pull_request: z.unknown().optional()
}))

export async function listOpenIssues() {
    const { token, repo } = getIssuesConfig()

    const response = await githubFetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=30`, {
        headers: apiHeaders(token)
    })
    if (!response.ok) {
        throw new Error(`GitHub answered ${response.status}`)
    }

    const parsed = IssueList.safeParse(await response.json())
    if (!parsed.success) {
        throw new Error(`Unexpected answer from GitHub: ${z.prettifyError(parsed.error)}`)
    }

    return parsed.data
        .filter(issue => !issue.pull_request)   // GitHub blandar in pull requests i listan
        .map(issue => ({
            number: issue.number,
            title: issue.title,
            url: issue.html_url,
            author: issue.user?.login ?? "unknown"
        }))
}