import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white/50">
        <div className="font-display text-sm tracking-widest uppercase">Loading ANCRMEDIA…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
