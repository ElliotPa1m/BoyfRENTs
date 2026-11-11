import { useState } from "react"
import { useNavigate, Link, useSearchParams } from "react-router-dom"
import { host } from "../../variables"
import logo from "../../assets/logo.png"

export default function AdminLogin() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const googleError = searchParams.get("error")

  const googleMessages = {
    google_cancelled: "The Google login was cancelled.",
    google_error: "Google could not log you in. Please try again.",
    google_failed: "The login could not be completed. Please try again.",
    invalid_login: "The login could not be verified. Please try again.",
    google_unavailable: "Google login is not available right now."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${host}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
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
      navigate("/")
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
        <a className="google-login-btn" href={`${host}/api/auth/google`}>Log in with Google</a>
        {googleError && <p>{googleMessages[googleError] ?? "Login failed. Please try again."}</p>}
        {error && <p>{error}</p>}
        <Link className="register-link" to="/register">No account? Register here!</Link>
      </form>
    </div>
  )
}