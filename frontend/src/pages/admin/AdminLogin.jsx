import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { host } from "../../variables"
import logo from "../../assets/logo.png"

export default function AdminLogin() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${host}/api/auth/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password})
    })
    const data = await response.json()
    if (!response.ok) {
      setError("Wrong username or password")
      return
    }
    localStorage.setItem("token", data.token)
    if (data.role === "admin") {
      navigate("/admin")
    } else {
      navigate("/products")
    }
  }

  return (
    <div>
      <div className="logo-wrapper">
        <img className="login-logo" src={logo} alt="logo" />
      </div>
    <form className="login-form" onSubmit={handleSubmit}>
      <input className="input-field" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="login-btn" type="submit">Login</button>
      {error && <p>{error}</p>}
      <Link className="register-link" to="/register">No account? Register here!</Link>
    </form>
    </div>
  )
}