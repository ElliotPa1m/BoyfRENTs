import {BrowserRouter, Routes, Route} from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminNewProductPage from "./pages/admin/AdminNewProductPage";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPage from "./pages/admin/AdminPage";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSpecificProductPage from "./pages/admin/AdminSpecificProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage"
import RegisterPage from "./pages/RegisterPage"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminNewProductPage />} />
        <Route path="/admin/products/:id" element={<AdminSpecificProductPage />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;