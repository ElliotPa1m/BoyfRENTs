import { useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useCurrency } from "../../context/CurrencyContext"
import { useCart } from "../../context/CartContext"
import { host } from "../variables"
import Navbar from "../components/Navbar";

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { formatPrice } = useCurrency()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setError("No order found")
      return
    }

    let timer
    let cancelled = false

    async function loadOrder() {
      try {
        const res = await fetch(`${host}/api/orders/by-session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setError(data.error || "Could not load the order")
          return
        }

        setOrder(data)

        if (data.status === "pending" && attempt < 10) {
          timer = setTimeout(() => setAttempt(a => a + 1), 2000)
        }
      } catch (err) {
        if (!cancelled) setError("Could not reach the server")
      }
    }

    loadOrder()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sessionId, attempt])

  useEffect(() => {
    if (order?.status === "paid") {
      clearCart()
    }
  }, [order?.status])

  return (
    <div>
      <Navbar />

      {error ? (
        <div className="confirmation-header">
          <h2>{error}</h2>
        </div>
      ) : !order ? (
        <div className="confirmation-header">
          <h2>Loading your order...</h2>
        </div>
      ) : order.status === "paid" ? (
        <>
          <div className="confirmation-header">
            <h2>Thank you for your order!</h2>
            <p>Total: {formatPrice(order.totalPrice)}</p>
          </div>
          <div className="confirmation-grid">
            {order.items.map((item, index) => (
              <div className="confirmation-card" key={index}>
                <img className="detail-img" src={item.imageUrl} alt={item.name} />
                <h2>{item.name}</h2>
                <p>{formatPrice(item.price)}/hour</p>
                <p>{item.quantity} hour(s)</p>
              </div>
            ))}
          </div>
        </>
      ) : order.status === "pending" ? (
        <div className="confirmation-header">
          <h2>Payment processing...</h2>
          <p>This usually takes a few seconds. This page updates by itself</p>
        </div>
      ) : (
        <div className="confirmation-header">
          <h2>The order was cancelled</h2>
        </div>
      )}
    </div>
  )
}