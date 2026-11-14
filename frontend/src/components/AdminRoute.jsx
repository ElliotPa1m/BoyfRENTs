import { useState, useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { host } from "../variables"

function getRole() {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))

    if (payload.exp * 1000 < Date.now()) return null   // token har gått ut

    return payload.role
  } catch (err) {
    return null
  }
}

export default function AdminRoute() {
  const passwordAdmin = getRole() === "admin"
  const [githubAdmin, setGithubAdmin] = useState(null)   // null = vet inte än

  useEffect(() => {
    if (passwordAdmin) return

    fetch(`${host}/api/auth/github/me`, { credentials: "include" })
      .then(res => setGithubAdmin(res.ok))
      .catch(() => setGithubAdmin(false))
  }, [passwordAdmin])

  if (passwordAdmin) return <Outlet />
  if (githubAdmin === null) return <p>Loading...</p>
  return githubAdmin ? <Outlet /> : <Navigate to="/login" replace />
}