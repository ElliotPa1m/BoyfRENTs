import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { host } from "../variables";
import Navbar from "../components/Navbar";

export default function ProductsPage() {

  const [products, setProducts] = useState([])
  const {addToCart} = useCart()

  useEffect(() => {
    fetch(`${host}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
  }, [])

  return (
    <div>
      <Navbar />
      <div className="product-grid">
      {products.map(product => (
        <div className="product-card" key={product._id}>
          <img src={product.imageUrl} alt={product.name} />
          <h2>{product.name}</h2>
          <p>${product.price}/hour</p>
          <div className="card-buttons">
            <Link className="details-link" to={`/products/${product._id}`}>View details</Link>
            <button className="add-to-cart-btn" onClick={() => addToCart(product)}>Add to cart</button>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}