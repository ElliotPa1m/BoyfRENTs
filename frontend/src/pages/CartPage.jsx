import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import Navbar from "../components/Navbar";

export default function CartPage() {
  
  const navigate = useNavigate()
  const {items, removeFromCart} = useCart()

  const handleCheckout = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    } else {
      navigate("/checkout")
    }
  }


  return (
    <div>
      <Navbar />
      <div className="cart-wrapper">
      {items.map(item => (
        <div className="cart-item" key={item.productId}>
          <img className="detail-img" src={item.imageUrl} alt={item.name} />
          <div className="cart-item-info">
            <h2>{item.name}</h2>
            <p>Price: ${item.price}/hour</p>
            <button className="remove-from-cart-btn" onClick={() => removeFromCart(item.productId)}>Remove from cart</button>
          </div>
        </div>
      ))}
      </div>
      <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
    </div>
  )
}