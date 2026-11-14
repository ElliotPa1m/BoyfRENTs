import express from "express"
import { z } from "zod"
import { createIssue, listOpenIssues } from "../integrations/githubAdapter.js"
import { requireGithubAdmin } from "../middleware/adminAuth.js"

const router = express.Router()

const IssueBody = z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).default("")
})

router.get("/", requireGithubAdmin, async (req, res) => {
    try {
        return res.json(await listOpenIssues())
    } catch (err) {
        console.error(err)
        return res.status(502).json({ error: "Could not get the issues from GitHub" })
    }
})

router.post("/", requireGithubAdmin, async (req, res) => {
    const parsed = IssueBody.safeParse(req.body)
    if (!parsed.success) {
        const issue = parsed.error.issues[0]
        return res.status(400).json({ error: `${issue.path.join(".")}: ${issue.message}` })
    }

    try {
        const issue = await createIssue(
            parsed.data.title,
            `${parsed.data.description}\n\n---\nReported by @${res.locals.admin.login} in the admin panel.`
        )
        return res.status(201).json(issue)
    } catch (err) {
        console.error(err)
        return res.status(502).json({ error: "GitHub did not create the issue. Check GITHUB_ISSUES_TOKEN and GITHUB_REPO." })
    }
})

export default router