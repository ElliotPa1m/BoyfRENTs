import jwt from "jsonwebtoken"

function readCustomer(req) {
    try {
        const payload = jwt.verify(req.cookies?.session ?? "", process.env.SESSION_TOKEN_SECRET)
        return {id: payload.id, email: payload.email, name: payload.name}
    } catch {
        return null
    }
}

export function verifyToken(req, res, next) {
    const customer = readCustomer(req)
    if (!customer) return res.status(401).json({error: "Log in with Google"})
    res.locals.customer = customer
    next()
}

export function optionalCustomer(req, res, next) {
    res.locals.customer = readCustomer(req)
    next()
}