import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useCurrency } from "../../context/CurrencyContext"
import Navbar from "../components/Navbar";

export default function CartPage() {

  const navigate = useNavigate()
  const { items, increaseQuantity, decreaseQuantity, removeFromCart } = useCart()
  const { formatPrice } = useCurrency()

  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

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
        {items.length === 0 && <p>Your cart is empty.</p>}

        {items.map(item => (
          <div className="cart-item" key={item.productId}>
            <img className="detail-img" src={item.imageUrl} alt={item.name} />
            <div className="cart-item-info">
              <h2>{item.name} × {item.quantity}</h2>
              <p>Price: {formatPrice(item.price)}/hour</p>
              <p>Subtotal: {formatPrice(item.price * item.quantity)}</p>

              <div className="quantity-controls">
                <button className="minus-btn" onClick={() => decreaseQuantity(item.productId)}>−</button>
                <span>{item.quantity}</span>
                <button className="plus-btn" onClick={() => increaseQuantity(item.productId)}>+</button>
              </div>

              <button className="remove-from-cart-btn" onClick={() => removeFromCart(item.productId)}>Remove from cart</button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && <p className="cart-total">Total: {formatPrice(itemsTotal)}</p>}

      <button className="checkout-btn" onClick={handleCheckout} disabled={items.length === 0}>Checkout</button>
    </div>
  )
}