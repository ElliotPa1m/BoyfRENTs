import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { host } from "../../variables"
import BackLink from "../../components/BackLink"

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  const loadIssues = async () => {
    try {
      const res = await fetch(`${host}/api/admin/issues`, { credentials: "include" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not load the issues")
        return
      }
      setIssues(data)
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    try {
      const res = await fetch(`${host}/api/admin/issues`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Could not create the issue")
        return
      }
      setMessage(`Issue #${data.number} was created`)
      setTitle("")
      setDescription("")
      loadIssues()
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    }
  }

  return (
    <div className="admin-issues">
      <BackLink to="/admin" />

      <form className="new-product-wrapper" onSubmit={handleSubmit}>
        <input className="new-product" type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="new-product" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="create-new-product" type="submit">Create issue</button>
      </form>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <h2>Open issues</h2>
      {loading && <p>Loading...</p>}
      {!loading && issues.length === 0 && !error && <p>No open issues</p>}
      {issues.map(issue => (
        <div className="issue-card" key={issue.number}>
          <a href={issue.url} target="_blank" rel="noreferrer">#{issue.number} {issue.title}</a>
          <p>by {issue.author}</p>
        </div>
      ))}
    </div>
  )
}