import { Link } from "react-router-dom";
import logo from '../assets/logo.png'
import { useCurrency } from "../../context/CurrencyContext";

export default function Navbar() {

    const { currency, setCurrency } = useCurrency()
    return(
        <nav className="navbar">
            <Link to="/"><img src={logo} alt="logo"/></Link>
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