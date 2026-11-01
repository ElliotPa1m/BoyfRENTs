import { createContext, useContext, useState, useEffect } from "react";
import { host } from "../src/variables"

const CartContext = createContext()

// slår ihop rader med samma produkt (äldre varukorgar kan ha flera rader per produkt)
function mergeItems(list) {
    const merged = []
    for (const item of list) {
        const existing = merged.find(i => i.productId === item.productId)
        if (existing) {
            existing.quantity += item.quantity
        } else {
            merged.push({ ...item })
        }
    }
    return merged
}

export function CartProvider({ children }) {
    const [items, setItems] = useState([])

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return
        fetch(`${host}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setItems(mergeItems(data.items || [])))
    }, [])

    // sparar varukorgen: först i state, sedan på servern
    const saveCart = async (newItems) => {
        setItems(newItems)
        await fetch(`${host}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify({ items: newItems })
        })
    }

    const addToCart = async (product) => {
        const existing = items.find(item => item.productId === product._id)

        // inte fler timmar än det finns (servern kontrollerar också vid betalningen)
        if (existing && existing.quantity >= product.stock) return

        const newItems = existing
            ? items.map(item => item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item)
            : [...items, { productId: product._id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl, stock: product.stock }]

        await saveCart(newItems)
    }

    const increaseQuantity = async (productId) => {
        const newItems = items.map(item =>
            item.productId === productId && !(item.quantity >= item.stock)
                ? { ...item, quantity: item.quantity + 1 }
                : item
        )
        await saveCart(newItems)
    }
    // minskar antalet med ett, och tar bort raden när det blir noll
    const decreaseQuantity = async (productId) => {
        const newItems = items
            .map(item => item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item)
            .filter(item => item.quantity > 0)
        await saveCart(newItems)
    }

    // tar bort hela raden
    const removeFromCart = async (productId) => {
        await saveCart(items.filter(item => item.productId !== productId))
    }

    const clearCart = async () => {
        try {
            await fetch(`${host}/api/cart`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ items: [] })
            })
        } finally {
            setItems([])
        }
    }

    return (
        <CartContext.Provider value={{items, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart}}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)