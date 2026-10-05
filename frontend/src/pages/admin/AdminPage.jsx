import { Link } from "react-router-dom"

export default function AdminPage() {
  return (
    <div className="admin-wrapper">
      <Link className="admin-links" to="/admin/products">Products</Link>
      <Link className="admin-links" to="/admin/products/new">Add new product</Link>
      <Link className="admin-links" to="/admin/orders">Orders</Link>
    </div>
  )
}