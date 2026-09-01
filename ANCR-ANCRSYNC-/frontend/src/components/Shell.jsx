import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default function Shell({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-72 relative z-10 pt-16 lg:pt-0">
        {children}
        <Footer />
      </main>
    </div>
  );
}
