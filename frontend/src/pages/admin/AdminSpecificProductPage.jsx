import { useParams, useNavigate, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { host } from "../../variables"

export default function AdminSpecificProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [sku, setSku] = useState("")
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [imageError, setImageError] = useState("")
  const [imageWarning, setImageWarning] = useState("")

  useEffect(() => {
    fetch(`${host}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name)
        setAge(data.age)
        setDescription(data.description ?? "")
        setPrice(data.price)
        setImageUrl(data.imageUrl ?? "")
        setCategory(data.category)
        setSku(data.sku)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setWarning("")

    try {
      const response = await fetch(`${host}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ name, age: Number(age), description, price: Number(price), imageUrl, category })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || data.message || "Could not save the product")
        return
      }

      if (data.searchIndexUpdated === false) {
        setWarning("The product was saved but the search index was not updated")
        return
      }
      navigate("/admin/products")
    } catch (err) {
      console.error(err)
      setError("Could not reach the server")
    }
  }

  const handleImageUpload = async () => {
    if (!file) return
    setImageError("")
    setImageWarning("")
    setUploading(true)

    try {
      const form = new FormData()
      form.append("image", file)

      const response = await fetch(`${host}/api/admin/products/${sku}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form
      })
      const data = await response.json()

      if (!response.ok) {
        setImageError(data.error || data.message || "Could not upload the image")
        return
      }

      setImageUrl(data.url)

      if (data.searchIndexUpdated === false) {
        setImageWarning("The image was uploaded but the search index was not updated")
      }
    } catch (err) {
      console.error(err)
      setImageError("Could not reach the server")
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
    <div className="edit-product-layout">
      {imageUrl && (
        <div className="edit-photo-wrapper">
        <img className="edit-photo" src={imageUrl} alt={name} width={264} />
        <p>Current photo</p>
        </div>
        )}
      <form className="new-product-wrapper-1" onSubmit={handleSubmit}>
        <input className="new-product" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}></input>
        <input className="new-product" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)}></input>
        <input className="new-product" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></input>
        <input className="new-product" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)}></input>
      </form>
      <form className="new-product-wrapper-2" onSubmit={handleSubmit}>
        {/* <input className="new-product" type="text" placeholder="Image" value={imageUrl} readOnly></input> */}
        <div>
          {/* {imageUrl && <img className="edit-photo" src={imageUrl} alt={name} width={264} />} */}
          <input id="custom-file-input" type="file" accept="image/png, image/jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} style={{display: "none"}} />
          <label htmlFor="custom-file-input" className="custom-file-label">Choose image</label>
          <button className="image-upload-btn" type="button" onClick={handleImageUpload} disabled={!file || uploading || !sku}>
            {uploading ? "Uploading..." : "Upload image"}
          </button>
          {imageError && <p>{imageError}</p>}
          {imageWarning && <p>{imageWarning}</p>}
        </div>
        <input className="new-product" type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)}></input>
        <button className="create-new-product" type="submit" disabled={!!warning}>Save</button>
        {error && <p>{error}</p>}
        {warning && (
          <>
            <p>{warning}</p>
            <Link to="/admin/products">Back to products</Link>
          </>
        )}
      </form>
      </div>
    </>
  )
}