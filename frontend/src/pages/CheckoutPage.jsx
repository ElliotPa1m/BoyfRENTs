import { useState, useEffect } from "react"
import { useCart } from "../../context/CartContext"
import { host } from "../variables"
import { useCurrency } from "../../context/CurrencyContext"
import Navbar from "../components/Navbar";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "numeric" })
}

export default function CheckoutPage() {

  const { items } = useCart()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [county, setCounty] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [prices, setPrices] = useState(null)
  const [servicePoints, setServicePoints] = useState([])
  const [estimates, setEstimates] = useState(null)
  const [shippingMethod, setShippingMethod] = useState("")
  const [servicePointId, setServicePointId] = useState("")
  const [shippingError, setShippingError] = useState("")
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (items.length === 0) return
    fetch(`${host}/api/shipping/prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) })
    })
      .then(res => res.json())
      .then(data => setPrices(data))
      .catch(() => setShippingError("Could not load the shipping prices"))
  }, [items])

  // 2. ombud och leveranstid när postnumret (och adressen) är ifyllda
  useEffect(() => {
    const validZip = /^\d{3} ?\d{2}$/.test(zipCode.trim())
    if (!validZip) {
      setServicePoints([])
      setEstimates(null)
      setServicePointId("")
      return
    }

    const timer = setTimeout(async () => {
      setShippingError("")
      const zip = encodeURIComponent(zipCode.trim())

      try {
        const res = await fetch(`${host}/api/shipping/service-points?postalCode=${zip}`)
        const data = await res.json()
        if (!res.ok) {
          setServicePoints([])
          setShippingError(data.error || "Could not load service points")
        } else {
          setServicePoints(data.servicePoints)
          setServicePointId("")
        }
      } catch {
        setShippingError("Could not reach the server")
      }

      if (address.trim()) {
        try {
          const res = await fetch(`${host}/api/shipping/estimate?postalCode=${zip}&address=${encodeURIComponent(address.trim())}`)
          setEstimates(res.ok ? await res.json() : null)
        } catch {
          setEstimates(null)   // leveranstiden är bara en upplysning
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [zipCode, address])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const response = await fetch(`${host}/api/checkout/hosted`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerAddress: address,
          customerEmail: email,
          customerZipCode: zipCode,
          customerCounty: county,
          shippingMethod,
          servicePointId: shippingMethod === "service_point" ? servicePointId : undefined,
          items: items.map(item => ({ productId: item.productId, quantity: item.quantity }))
        })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Could not start the payment")
        return
      }
      window.location.href = data.url
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    } finally {
      setSubmitting(false)
    }
  }

  const canPay = prices && shippingMethod && (shippingMethod !== "service_point" || servicePointId)
  const shippingPrice = prices && shippingMethod ? prices.prices[shippingMethod] : 0


  return (
    <div>
      <Navbar />
      <form className="login-form" onSubmit={handleSubmit}>
        <input className="input-field" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input-field" type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="input-field" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-field" type="number" placeholder="ZIP Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
        <input className="input-field" type="text" placeholder="County" value={county} onChange={(e) => setCounty(e.target.value)} />
        <div className="shipping-options">
          <h3>Shipping</h3>

          {prices && (
            <>
              <label>
                <input type="radio" name="shipping" checked={shippingMethod === "service_point"}
                  onChange={() => setShippingMethod("service_point")} />
                Pick-up point: {prices.prices.service_point === 0 ? "Free" : formatPrice(prices.prices.service_point)}
              </label>
              {estimates?.servicePoint && <p>Estimated delivery: {formatDate(estimates.servicePoint)}</p>}

              {shippingMethod === "service_point" && (
                servicePoints.length === 0
                  ? <p>Enter a valid postal code to see service points, or choose home delivery.</p>
                  : (
                    <select className="input-field" value={servicePointId} onChange={(e) => setServicePointId(e.target.value)}>
                      <option value="">Choose a pick-up point</option>
                      {servicePoints.map(point => (
                        <option key={point.id} value={point.id}>
                          {point.name}, {point.address}
                        </option>
                      ))}
                    </select>
                  )
              )}

              <label>
                <input type="radio" name="shipping" checked={shippingMethod === "home"}
                  onChange={() => setShippingMethod("home")} />
                Home delivery: {prices.prices.home === 0 ? "Free" : formatPrice(prices.prices.home)}
              </label>
              {estimates?.home && <p>Estimated delivery: {formatDate(estimates.home)}</p>}

              {prices.freeShippingFrom && <p>Free shipping from {formatPrice(prices.freeShippingFrom)}</p>}
            </>
          )}

          {shippingError && <p>{shippingError}</p>}
        </div>

        {prices && shippingMethod && (
          <div>
            <p>Items: {formatPrice(prices.itemsTotal)}</p>
            <p>Shipping: {shippingPrice === 0 ? "Free" : formatPrice(shippingPrice)}</p>
            <p>Total: {formatPrice(prices.itemsTotal + shippingPrice)}</p>
          </div>
        )}
        <button className="login-btn" type="submit" disabled={submitting || !canPay}>Pay</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  )
}