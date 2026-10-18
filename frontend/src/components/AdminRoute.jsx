import { Navigate, Outlet } from "react-router-dom"

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
  return getRole() === "admin" ? <Outlet /> : <Navigate to="/login" replace />
}