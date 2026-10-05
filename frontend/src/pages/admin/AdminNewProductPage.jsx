import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { host } from "../../variables"

export default function AdminNewProductPage() {

const [name, setName] = useState("")
const [age, setAge] = useState("")
const [description, setDescription] = useState("")
const [price, setPrice] = useState("")
const [imageUrl, setImageUrl] = useState("")
const [category, setCategory] = useState("")
const navigate = useNavigate()

const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${host}/api/products`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}`},
      body: JSON.stringify({name, age: Number(age), description, price: Number(price), imageUrl, category})
    })
    navigate("/admin/products")
  }

  return (
    <form className="new-product-wrapper" onSubmit={handleSubmit}>
      <input className="new-product" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}></input>
      <input className="new-product" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)}></input>
      <input className="new-product" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></input>
      <input className="new-product" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)}></input>
      <input className="new-product" type="text" placeholder="Image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}></input>
      <input className="new-product" type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)}></input>
      <button className="create-new-product" type="submit">Create</button>
    </form>
  )
}