import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from '../assets/logo.png'
import { useCurrency } from "../../context/CurrencyContext"
import { host } from "../variables"

export default function Navbar() {

    const navigate = useNavigate()
    const [hasToken, setHasToken] = useState(!!localStorage.getItem("token"))
    const [customer, setCustomer] = useState(null)

    useEffect(() => {
        fetch(`${host}/api/me`, { credentials: "include" })
            .then(res => res.ok ? res.json() : null)
            .then(data => setCustomer(data))
            .catch(() => setCustomer(null))
    }, [])

    const handleLogout = async () => {
        localStorage.removeItem("token")
        setHasToken(false)
        if (customer) {
            try {
                await fetch(`${host}/api/me/logout`, { method: "POST", credentials: "include" })
            } catch (err) {
                console.error(err)
            }
            setCustomer(null)
        }
        navigate("/")
    }

    const loggedIn = hasToken || customer
    const { currency, setCurrency } = useCurrency()
    return (
        <nav className="navbar">
            <Link to="/"><img src={logo} alt="logo" /></Link>
            <div className="navbar-links">
                {customer && <Link className="account-link" to="/account">My pages</Link>}
                {loggedIn ? (
                    <button className="login-link" onClick={handleLogout}>Log out</button>
                ) : (
                    <Link className="login-link" to="/login">Log in</Link>
                )}
                <Link className="cart-link" to="/cart">Cart</Link>
                <select id="currency-dropdown" value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="SEK">SEK</option>
                    <option value="EUR">EUR</option>
                    <option value="IDR">IDR</option>
                </select>
            </div>
        </nav>
    )
}