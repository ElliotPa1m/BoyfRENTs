import { Link, useNavigate } from "react-router-dom"
import { host } from "../../variables"
import BackLink from "../../components/BackLink"

export default function AdminPage() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch(`${host}/api/auth/github/logout`, {
        method: "POST",
        credentials: "include"
      })
    } catch (err) {
      console.error(err)
    }
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div className="admin-wrapper">
      <BackLink to="/">Back to shop</BackLink>
      <Link className="admin-links" to="/admin/products">Products</Link>
      <Link className="admin-links" to="/admin/products/new">Add new product</Link>
      <Link className="admin-links" to="/admin/orders">Orders</Link>
      <Link className="admin-links" to="/admin/issues">Issues</Link>
      <button className="admin-links" onClick={handleLogout}>Log out</button>
    </div>
  )
}