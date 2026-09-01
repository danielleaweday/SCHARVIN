import { AuthProvider } from "@/context/AuthContext";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Overview from "@/pages/Overview";
import Identity from "@/pages/Identity";
import Portfolio from "@/pages/Portfolio";
import Timeline from "@/pages/Timeline";
import Passport from "@/pages/Passport";
import Collaborations from "@/pages/Collaborations";
import Skills from "@/pages/Skills";
import Education from "@/pages/Education";
import History from "@/pages/History";
import Achievements from "@/pages/Achievements";
import Credentials from "@/pages/Credentials";
import ConnectedApps from "@/pages/ConnectedApps";
import Network from "@/pages/Network";
import Settings from "@/pages/Settings";
import SSO from "@/pages/SSO";
import Mobility from "@/pages/Mobility";
import PublicCreator from "@/pages/PublicCreator";
import BookingPacket from "@/pages/BookingPacket";
import { Toaster } from "sonner";
import "@/App.css";

function HandleOrFallback() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/packet/") && pathname.length > 8) {
    return <BookingPacket />;
  }
  if (pathname.startsWith("/@") && pathname.length > 2) {
    return <PublicCreator />;
  }
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" theme="dark" richColors closeButton />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="identity" element={<Identity />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="passport" element={<Passport />} />
            <Route path="collaborations" element={<Collaborations />} />
            <Route path="skills" element={<Skills />} />
            <Route path="education" element={<Education />} />
            <Route path="history" element={<History />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="credentials" element={<Credentials />} />
            <Route path="connected" element={<ConnectedApps />} />
            <Route path="sso" element={<SSO />} />
            <Route path="mobility" element={<Mobility />} />
            <Route path="network" element={<Network />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<HandleOrFallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
