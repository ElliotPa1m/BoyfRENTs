import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { useCart } from "../../context/CartContext"
import { host } from "../variables"
import Navbar from "../components/Navbar";

export default function ProductDetailsPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetch(`${host}/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
  }, [])

  if (!product) return <p>Loading...</p>

  return (
    <div>
      <Navbar />
      <div className="detail-container">
        <img className="detail-img" src={product.imageUrl} alt={product.name} />
          <div className="info-card-wrapper">
          <h1>{product.name}</h1>
          <p>Age: {product.age}</p>
          <p>{product.description}</p>
          <p>${product.price}/hour</p>
          <p>Category: {product.category}</p>
          <button className="details-add-to-cart-button" onClick={() => addToCart(product)}>Add to cart</button>
        </div>
      </div>
    </div>
  )
}