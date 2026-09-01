import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AIAH from "@/components/AIAH";

import Home from "@/pages/Home";
import Departments from "@/pages/Departments";
import Shop from "@/pages/Shop";
import Collection from "@/pages/Collection";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import PaymentReturn from "@/pages/PaymentReturn";
import Wishlist from "@/pages/Wishlist";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const [aiahOpen, setAiahOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-[#050505]">
      <ScrollToTop />
      <Navbar onOpenAIAH={() => setAiahOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home onOpenAIAH={() => setAiahOpen(true)} />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/shop/:dept" element={<Shop />} />
          <Route path="/search" element={<Shop />} />
          <Route path="/collections/:slug" element={<Collection />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/success" element={<PaymentReturn status="success" />} />
          <Route path="/payment/cancel" element={<PaymentReturn status="cancel" />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <AIAH open={aiahOpen} setOpen={setAiahOpen} />
      <Toaster theme="dark" position="bottom-center" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Shell />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
