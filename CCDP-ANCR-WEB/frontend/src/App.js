import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { InquiryProvider } from "@/context/InquiryProvider";
import { AdminAuthProvider } from "@/context/AdminAuth";
import Home from "@/pages/Home";
import Platform from "@/pages/Platform";
import Ecosystem from "@/pages/Ecosystem";
import Resources from "@/pages/Resources";
import Framework from "@/pages/Framework";
import Invest from "@/pages/Invest";
import SupportUs from "@/pages/SupportUs";
import Store from "@/pages/Store";
import AdminLogin from "@/pages/AdminLogin";
import AdminInquiries from "@/pages/AdminInquiries";
import AdminOrders from "@/pages/AdminOrders";
import AdminInventory from "@/pages/AdminInventory";
import AdminWaitlist from "@/pages/AdminWaitlist";
import { BackgroundAudio } from "@/components/BackgroundAudio";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash && !hash.includes("session_id=")) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollManager />
        <BackgroundAudio />
        <AdminAuthProvider>
          <InquiryProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/platform" element={<Platform />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/framework" element={<Framework />} />
              <Route path="/invest" element={<Invest />} />
              <Route path="/support" element={<SupportUs />} />
              <Route path="/store" element={<Store />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/inquiries" element={<AdminInquiries />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/waitlist" element={<AdminWaitlist />} />
              <Route path="/store/*" element={<Navigate to="/store" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </InquiryProvider>
        </AdminAuthProvider>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#1a1a1e",
            border: "1px solid rgba(244,241,234,0.1)",
            color: "#f4f1ea",
          },
        }}
      />
    </div>
  );
}

export default App;
