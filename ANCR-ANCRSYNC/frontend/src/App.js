import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Workspaces from "./pages/Workspaces";
import WorkspaceDetail from "./pages/WorkspaceDetail";
import Studios from "./pages/Studios";
import StudioRoom from "./pages/StudioRoom";
import Sessions from "./pages/Sessions";
import SessionRoom from "./pages/SessionRoom";
import GlobalMap from "./pages/GlobalMap";
import CreativePassport from "./pages/CreativePassport";
import AppShell from "./components/AppShell";
import AIAssistant from "./pages/AIAssistant";
import Messages from "./pages/Messages";
import Mentorship from "./pages/Mentorship";
import Communities from "./pages/Communities";
import Discover from "./pages/Discover";
import ANCRLab from "./pages/ANCRLab";
import SharedCreation from "./pages/SharedCreation";
import Review from "./pages/Review";
import ANCRIDVerify from "./pages/ANCRIDVerify";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-zinc-500 font-mono text-xs tracking-overline">
          Loading ANCRSync™
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="grain min-h-screen">
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(24,24,27,0.9)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fafafa",
                backdropFilter: "blur(20px)",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/ancrid-verify" element={<ANCRIDVerify />} />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />
            <Route
              path="/workspaces"
              element={
                <Protected>
                  <Workspaces />
                </Protected>
              }
            />
            <Route
              path="/workspaces/:id"
              element={
                <Protected>
                  <WorkspaceDetail />
                </Protected>
              }
            />
            <Route
              path="/studios"
              element={
                <Protected>
                  <Studios />
                </Protected>
              }
            />
            <Route
              path="/studios/:id"
              element={
                <Protected>
                  <StudioRoom />
                </Protected>
              }
            />
            <Route
              path="/sessions"
              element={
                <Protected>
                  <Sessions />
                </Protected>
              }
            />
            <Route
              path="/sessions/:id"
              element={
                <Protected>
                  <SessionRoom />
                </Protected>
              }
            />
            <Route
              path="/global"
              element={
                <Protected>
                  <GlobalMap />
                </Protected>
              }
            />
            <Route
              path="/passport"
              element={
                <Protected>
                  <CreativePassport />
                </Protected>
              }
            />
            <Route
              path="/ai"
              element={
                <Protected>
                  <AIAssistant />
                </Protected>
              }
            />
            <Route
              path="/messages"
              element={
                <Protected>
                  <Messages />
                </Protected>
              }
            />
            <Route
              path="/mentorship"
              element={
                <Protected>
                  <Mentorship />
                </Protected>
              }
            />
            <Route
              path="/communities"
              element={
                <Protected>
                  <Communities />
                </Protected>
              }
            />
            <Route
              path="/discover"
              element={
                <Protected>
                  <Discover />
                </Protected>
              }
            />
            <Route
              path="/ancrlab"
              element={
                <Protected>
                  <ANCRLab />
                </Protected>
              }
            />
            <Route
              path="/workspaces/:id/creation"
              element={
                <Protected>
                  <SharedCreation />
                </Protected>
              }
            />
            <Route
              path="/workspaces/:id/review"
              element={
                <Protected>
                  <Review />
                </Protected>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
