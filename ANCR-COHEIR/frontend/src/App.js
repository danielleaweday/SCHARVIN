import React from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Directory from "@/pages/Directory";
import ProfessionalProfile from "@/pages/ProfessionalProfile";
import StudentSupervision from "@/pages/StudentSupervision";
import StudentDetail from "@/pages/StudentDetail";
import Sessions from "@/pages/Sessions";
import SessionDetail from "@/pages/SessionDetail";
import Cohorts from "@/pages/Cohorts";
import CohortDetail from "@/pages/CohortDetail";
import Reviews from "@/pages/Reviews";
import Opportunities from "@/pages/Opportunities";
import Recommendations from "@/pages/Recommendations";
import CreativeTeams from "@/pages/CreativeTeams";
import Calendar from "@/pages/Calendar";
import Messages from "@/pages/Messages";
import Library from "@/pages/Library";
import AIAH from "@/pages/AIAH";
import Ancrid from "@/pages/Ancrid";
import Institution from "@/pages/Institution";
import Employer from "@/pages/Employer";
import Settings from "@/pages/Settings";
import Portfolio from "@/pages/Portfolio";
import Integrations from "@/pages/Integrations";
import Analytics from "@/pages/Analytics";
import ShareKits from "@/pages/ShareKits";
import PublicShare from "@/pages/PublicShare";
import Alumni from "@/pages/Alumni";

import { AppShell } from "@/components/layout/AppShell";

import "@/App.css";

function AppRouter() {
  const location = useLocation();
  // Emergent auth callback comes back with #session_id=... on any route.
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/p/:slug" element={<PublicShare />} />

      <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
      <Route path="/directory" element={<AppShell><Directory /></AppShell>} />
      <Route path="/profile/:userId" element={<AppShell><ProfessionalProfile /></AppShell>} />
      <Route path="/students" element={<AppShell><StudentSupervision /></AppShell>} />
      <Route path="/students/:userId" element={<AppShell><StudentDetail /></AppShell>} />
      <Route path="/alumni" element={<AppShell><Alumni /></AppShell>} />
      <Route path="/sessions" element={<AppShell><Sessions /></AppShell>} />
      <Route path="/sessions/:sessionId" element={<AppShell><SessionDetail /></AppShell>} />
      <Route path="/cohorts" element={<AppShell><Cohorts /></AppShell>} />
      <Route path="/cohorts/:cohortId" element={<AppShell><CohortDetail /></AppShell>} />
      <Route path="/reviews" element={<AppShell><Reviews /></AppShell>} />
      <Route path="/opportunities" element={<AppShell><Opportunities /></AppShell>} />
      <Route path="/recommendations" element={<AppShell><Recommendations /></AppShell>} />
      <Route path="/teams" element={<AppShell><CreativeTeams /></AppShell>} />
      <Route path="/portfolio" element={<AppShell><Portfolio /></AppShell>} />
      <Route path="/share-kits" element={<AppShell><ShareKits /></AppShell>} />
      <Route path="/analytics" element={<AppShell><Analytics /></AppShell>} />
      <Route path="/integrations" element={<AppShell><Integrations /></AppShell>} />
      <Route path="/calendar" element={<AppShell><Calendar /></AppShell>} />
      <Route path="/messages" element={<AppShell><Messages /></AppShell>} />
      <Route path="/library" element={<AppShell><Library /></AppShell>} />
      <Route path="/aiah" element={<AppShell><AIAH /></AppShell>} />
      <Route path="/ancrid" element={<AppShell><Ancrid /></AppShell>} />
      <Route path="/institution" element={<AppShell><Institution /></AppShell>} />
      <Route path="/employer" element={<AppShell><Employer /></AppShell>} />
      <Route path="/settings" element={<AppShell><Settings /></AppShell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster theme="dark" position="top-right" richColors />
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
