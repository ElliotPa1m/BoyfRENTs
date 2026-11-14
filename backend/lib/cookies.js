const isProduction = process.env.NODE_ENV === "production"

export const sessionCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

export const flowCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000
}

export const ADMIN_SESSION_SECONDS = 8 * 60 * 60

export const adminCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: ADMIN_SESSION_SECONDS * 1000
}

export const githubFlowCookie = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/api/auth/github",
    maxAge: 10 * 60 * 1000
}