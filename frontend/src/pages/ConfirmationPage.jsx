import { useLocation } from "react-router-dom"
import Navbar from "../components/Navbar";

export default function ConfirmationPage() {
  
  const location = useLocation()
  const order = location.state?.order
  if (!order) return <p>No order found</p>

  return (
    <div>
      <Navbar />
      <div className="confirmation-header">
        <h2>Thank you for your order!</h2>
        <p>Total: ${order.totalPrice}</p>
      </div>
      <div className="confirmation-grid">
      {order.items.map((item, index) => (
        <div className="confirmation-card" key={index}>
          <img className="detail-img" src={item.imageUrl} alt={item.name} />
          <h2>{item.name}</h2>
          <p>${item.price}/hour</p>
        </div>
      ))}
      </div>
    </div>
  )
}