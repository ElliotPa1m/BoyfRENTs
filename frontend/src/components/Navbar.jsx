import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from '../assets/logo.png'
import { useCurrency } from "../../context/CurrencyContext";

export default function Navbar() {

    const navigate = useNavigate()
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"))

    const handleLogout = () => {
        localStorage.removeItem("token")
        setLoggedIn(false)
        navigate("/")
    }

    const { currency, setCurrency } = useCurrency()
    return (
        <nav className="navbar">
            <Link to="/"><img src={logo} alt="logo" /></Link>
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
        </nav>
    )
}