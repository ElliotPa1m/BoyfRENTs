import { useState, useEffect } from "react"
import { useCart } from "../../context/CartContext"
import { host } from "../variables"
import Navbar from "../components/Navbar";

export default function CheckoutPage() {
  
    const {items} = useCart()
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [email, setEmail] = useState("")
    const [zipCode, setZipCode] = useState("")
    const [county, setCounty] = useState("")
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)



    const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const response = await fetch(`${host}/api/checkout/hosted`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        customerName: name,
        customerAddress: address, 
        customerEmail: email, 
        customerZipCode: zipCode, 
        customerCounty: county, 
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

  return (
    <div>
    <Navbar />
    <form className="login-form" onSubmit={handleSubmit}>
      <input className="input-field" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input-field" type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <input className="input-field" type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input-field" type="number" placeholder="ZIP Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
      <input className="input-field" type="text" placeholder="County" value={county} onChange={(e) => setCounty(e.target.value)} />
      <button className="login-btn" type="submit" disabled={submitting}>Pay</button>
      {error && <p>{error}</p>}
    </form>
    </div>
  )
}