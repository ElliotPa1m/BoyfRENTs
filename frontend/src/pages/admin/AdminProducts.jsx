import { useState, useEffect } from "react";
import { useCurrency } from "../../../context/CurrencyContext"
import { Link } from "react-router-dom";
import { host } from "../../variables";

export default function AdminProducts() {

  const [products, setProducts] = useState([])
  const [report, setReport] = useState(null)
  const [error, setError] = useState("")
  const [importing, setImporting] = useState(false)
  const { formatPrice } = useCurrency()
  const [warning, setWarning] = useState("")
  const [message, setMessage] = useState("")

  const handleDelete = async (id) => {
    setError("")
    setWarning("")
    setMessage("")

    try {
      const res = await fetch(`${host}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || "Could not delete the product")
        return
      }

      setProducts(products.filter(p => p._id !== id))

      if (data.searchIndexUpdated === false) {
        setWarning("The product was deleted but the search index was not updated.")
      }
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    }
  }

  const loadProducts = () => {
    fetch(`${host}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleImport = async (format) => {
    setImporting(true)
    setError("")
    setReport(null)
    setWarning("")
    setMessage("")

    try {
      const res = await fetch(`${host}/api/admin/products/import/${format}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || "Import failed")
        return
      }
      setReport(data)
      loadProducts()
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    } finally {
      setImporting(false)
    }
  }

  const handleReindex = async () => {
    setImporting(true)
    setError("")
    setReport(null)
    setWarning("")
    setMessage("")

    try {
      const res = await fetch(`${host}/api/admin/algolia/reindex`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || "Reindex failed")
        return
      }
      setMessage(`Search index updated with ${data.indexed} products`)
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="admin-product-list">
      <button className="admin-product-btn" onClick={() => handleImport("csv")} disabled={importing}>Import from CSV</button>
      <button className="admin-product-btn" onClick={() => handleImport("xml")} disabled={importing}>Import from XML</button>
      <button className="admin-product-btn" onClick={handleReindex} disabled={importing}>Reindex</button>

      {error && <p>{error}</p>}
      {warning && <p>{warning}</p>}
      {message && <p>{message}</p>}

      {report && (
        <div>
          <p>New: {report.created}</p>
          <p>Updated: {report.updated}</p>
          <p>Skipped: {report.skipped.length}</p>
          {report.searchIndexUpdated === false && <p>Search index was not updated.</p>}
          {report.skipped.map(item => (
            <p key={item.sku}>{item.sku}: {item.reason}</p>
          ))}
        </div>
      )}

      {products.map(product => (
        <div className="admin-product-card" key={product._id}>
          <h2>{product.name}</h2>
          <p>{formatPrice(product.price)}/hour</p>
          <div className="admin-product-btn-wrapper">
            <Link className="admin-product-link" to={`/admin/products/${product._id}`}>Edit</Link>
            <button className="admin-product-btn" onClick={() => handleDelete(product._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}