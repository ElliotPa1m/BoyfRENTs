import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { host } from "../variables"
import logo from "../assets/logo.png"

export default function RegisterPage() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${host}/api/auth/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password, role: "customer"})
    })
    const data = await response.json()
    navigate("/login")
  }

  return (
    <div>
      <div className="logo-wrapper">
        <img className="login-logo" src={logo} alt="logo" />
      </div>
    <form className="login-form" onSubmit={handleSubmit}>
      <input className="input-field" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="login-btn" type="submit">Create account</button>
      <Link className="register-link" to="/login">Already have an account? Log in here!</Link>
    </form>
    </div>
  )
}