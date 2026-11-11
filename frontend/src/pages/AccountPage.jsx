import {useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"
import { host } from "../variables"
import { useCurrency } from "../../context/CurrencyContext"
import Navbar from "../components/Navbar"

export default function AccountPage() {
    const navigate = useNavigate()
    const {formatPrice} = useCurrency()
    const [customer, setCustomer] = useState(null)
    const [orders, setOrders] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const meRes = await fetch(`${host}/api/me`, {credentials: "include"})
                if (meRes.status === 401) {
                    navigate("/login")
                    return
                }
                if (!meRes.ok) throw new Error("Could not load the customer")
                setCustomer(await meRes.json())

                const ordersRes = await fetch(`${host}/api/me/orders`, { credentials: "include" })
                if (!ordersRes.ok) throw new Error("Could not load the orders")
                setOrders(await ordersRes.json())
            } catch (err) {
                console.error(err)
                setError("Could not load your page. Please try again later")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <div>
            <Navbar />
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
                <div>
                    <h2>Hello {customer.name}</h2>
                    <h3>My orders</h3>
                    {orders.length === 0 && <p>You have no orders yet</p>}
                    {orders.map(order => (
                        <div key={order.id}>
                            <p>{new Date(order.createdAt).toLocaleDateString("sv-SE")}: {order.status}</p>
                            {order.items.map((item, i) => <p key={i}>{item.name} x {item.quantity}</p>)}
                            {order.shippingMethod && (
                                <p>{order.shippingMethod === "service_point" ? "Pick-up point" : "Home delivery"}
                                    {order.servicePoint && `: ${order.servicePoint.name}, ${order.servicePoint.address}`}</p>
                            )}
                            <p>Total: {formatPrice(order.totalPrice)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}