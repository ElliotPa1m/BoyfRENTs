import { useState, useEffect } from "react";
import { host } from "../../variables";

export default function AdminOrders() {

  const [orders, setOrders] = useState([])
  const handleStatusChange = async (id, status) => {
    await fetch(`${host}/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}`},
      body: JSON.stringify({status})
    })
    setOrders(orders.map(o => o._id === id ? {...o, status} : o))
  }

  useEffect(() => {
    fetch(`${host}/api/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
  }, [])

  return (
    <div className="order-container">
      {orders.map(order => (
        <div key={order._id}>
          <h2>Customer: {order.customerName}</h2>
          <p>Total price: ${order.totalPrice}</p>
          <p>Status: {order.status}</p>
          <select className="admin-status" value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
            <option>Ordered</option>
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