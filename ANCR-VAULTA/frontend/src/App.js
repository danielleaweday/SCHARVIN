import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "@/App.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import Income from "@/pages/Income";
import Expenses from "@/pages/Expenses";
import Budget from "@/pages/Budget";
import Royalties from "@/pages/Royalties";
import Publishing from "@/pages/Publishing";
import Contracts from "@/pages/Contracts";
import Invoices from "@/pages/Invoices";
import Taxes from "@/pages/Taxes";
import Business from "@/pages/Business";
import Funding from "@/pages/Funding";
import Reports from "@/pages/Reports";
import Vault from "@/pages/Vault";
import Settings from "@/pages/Settings";
import AIAH from "@/pages/AIAH";
import Ecosystem from "@/pages/Ecosystem";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import { Toaster } from "sonner";

function Protected({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-xs tracking-[0.22em] uppercase text-white/40">Loading Vaulta</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/royalties" element={<Royalties />} />
        <Route path="/publishing" element={<Publishing />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/taxes" element={<Taxes />} />
        <Route path="/business" element={<Business />} />
        <Route path="/funding" element={<Funding />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:pid" element={<ProjectDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/aiah" element={<AIAH />} />
        <Route path="/ecosystem" element={<Ecosystem />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => { document.title = "Vualta™ — Financial Operating System"; }, []);
  return (
    <div className="App grain">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster theme="dark" position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
