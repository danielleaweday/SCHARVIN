import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";

import LoginPage from "@/pages/LoginPage";
import FeedPage from "@/pages/FeedPage";
import ProfilePage from "@/pages/ProfilePage";
import DiscoverPage from "@/pages/DiscoverPage";
import CommunitiesPage from "@/pages/CommunitiesPage";
import MessagesPage from "@/pages/MessagesPage";
import EventsPage from "@/pages/EventsPage";
import OpportunitiesPage from "@/pages/OpportunitiesPage";
import MarketplacePage from "@/pages/MarketplacePage";
import NotificationsPage from "@/pages/NotificationsPage";
import AdminPage from "@/pages/AdminPage";
import EcosystemModulePage from "@/pages/EcosystemModulePage";
import NetworkPage from "@/pages/NetworkPage";
import InstitutionsPage from "@/pages/InstitutionsPage";
import CollaborationDetailPage from "@/pages/CollaborationDetailPage";
import InstitutionHomePage from "@/pages/InstitutionHomePage";
import InstitutionDashboardPage from "@/pages/InstitutionDashboardPage";
import EmployerPage from "@/pages/EmployerPage";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grain min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono text-xs text-white/50">Loading ANCRD…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<Protected><FeedPage /></Protected>} />
          <Route path="/network" element={<Protected><NetworkPage /></Protected>} />
          <Route path="/institutions" element={<Protected><InstitutionsPage /></Protected>} />
          <Route path="/institutions/:id" element={<Protected><InstitutionHomePage /></Protected>} />
          <Route path="/institutions/:id/dashboard" element={<Protected><InstitutionDashboardPage /></Protected>} />
          <Route path="/employer" element={<Protected><EmployerPage /></Protected>} />
          <Route path="/profile/:id" element={<Protected><ProfilePage /></Protected>} />
          <Route path="/discover" element={<Protected><DiscoverPage /></Protected>} />
          <Route path="/communities" element={<Protected><CommunitiesPage /></Protected>} />
          <Route path="/collaborations" element={<Protected><CommunitiesPage /></Protected>} />
          <Route path="/collaborations/:id" element={<Protected><CollaborationDetailPage /></Protected>} />
          <Route path="/communities/:id" element={<Protected><CollaborationDetailPage /></Protected>} />
          <Route path="/messages" element={<Protected><MessagesPage /></Protected>} />
          <Route path="/events" element={<Protected><EventsPage /></Protected>} />
          <Route path="/opportunities" element={<Protected><OpportunitiesPage /></Protected>} />
          <Route path="/marketplace" element={<Protected><MarketplacePage /></Protected>} />
          <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
          <Route path="/admin" element={<Protected><AdminPage /></Protected>} />
          {["ancra","ancrlab","ancrsync","coheir","inheira","vaulta","ancrmedia","ancrlaunch","ancrid"].map(m => (
            <Route key={m} path={`/${m}`} element={<Protected><EcosystemModulePage module={m} /></Protected>} />
          ))}
        </Routes>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            className: "font-mono text-xs",
            style: { background: "rgba(10,10,12,0.95)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: "2px" }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
