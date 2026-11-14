import { useState, useEffect } from "react";
import { useCurrency } from "../../../context/CurrencyContext"
import { host } from "../../variables";
import BackLink from "../../components/BackLink"

export default function AdminOrders() {

  const [orders, setOrders] = useState([])
  const { formatPrice } = useCurrency()
    const handleStatusChange = async (id, status) => {
    const token = localStorage.getItem("token")
    await fetch(`${host}/api/orders/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({status})
    })
    setOrders(orders.map(o => o._id === id ? {...o, status} : o))
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch(`${host}/api/orders`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
  }, [])

  return (
    <div className="order-container">
      <BackLink to="/admin" />
      {orders.map(order => (
        <div key={order._id}>
          <h2>Customer: {order.customerName}</h2>
          <p>Total price: {formatPrice(order.totalPrice)}</p>
          <p>Status: {order.status}</p>
          <select className="admin-status" value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
            <option value="paid">Paid</option>
            <option>Processing</option>
            <option>Delivered</option>
            <option>Refunded</option>
          </select>
          {order.items.map((item, index) => (
            <p key={index}>{item.name} x{item.quantity}</p>
          ))}
        </div>
      ))}
    </div>
  )
}