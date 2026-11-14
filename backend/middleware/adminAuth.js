import jwt from "jsonwebtoken"
import {protect, adminOnly} from "./authMiddleware.js"

export function getAdminLogins() {
    return (process.env.ADMIN_GITHUB_LOGINS ?? "")
        .split(",")
        .map(login => login.trim().toLowerCase())
        .filter(Boolean)
}

function readAdminCookie(req) {
    try {
        const payload = jwt.verify(req.cookies?.admin_token ?? "", process.env.ADMIN_SESSION_TOKEN_SECRET)
        if (payload.role !== "admin") return null

        if (!getAdminLogins().includes(String(payload.login).toLowerCase())) return null
        return { id: payload.id, login: payload.login }
    } catch {
        return null
    }
}

export function requireGithubAdmin(req, res, next) {
    const admin = readAdminCookie(req)
    if (!admin) return res.status(401).json({error:"Log in with Github"})
    res.locals.admin = admin
    next()
}

export function requireAdmin(req, res, next) {
    const admin = readAdminCookie(req)
    if (admin) {
        res.locals.admin = admin
        return next()
    }
    return protect(req, res, () => adminOnly(req, res, next))
}