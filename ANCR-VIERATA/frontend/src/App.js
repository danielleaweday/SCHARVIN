import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import DailyCheckIn from "@/pages/DailyCheckIn";
import Placeholder from "@/pages/Placeholder";
import LifestyleHub from "@/pages/lifestyle/LifestyleHub";
import Nutrition from "@/pages/lifestyle/Nutrition";
import NutritionTargets from "@/pages/lifestyle/NutritionTargets";
import Mindfulness from "@/pages/lifestyle/Mindfulness";
import Movement from "@/pages/lifestyle/Movement";
import MyProgress from "@/pages/MyProgress";
import MyWellness from "@/pages/MyWellness";
import Performance from "@/pages/Performance";
import Recovery from "@/pages/Recovery";
import Learning from "@/pages/Learning";
import LearningPathway from "@/pages/LearningPathway";
import LearningLesson from "@/pages/LearningLesson";
import WellnessCircle from "@/pages/WellnessCircle";
import Support from "@/pages/Support";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminMedia from "@/pages/AdminMedia";
import CircleDetail from "@/pages/CircleDetail";
import Playlists from "@/pages/Playlists";
import Viea from "@/pages/Viea";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { VieaLauncher } from "@/components/onboarding/VieaLauncher";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 font-sans text-sm">
        Loading VIEARTA…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <WelcomeTour />
      <VieaLauncher />
      {children}
    </AppShell>
  );
}

const PLACEHOLDERS = [];

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{ style: { background: "rgba(10,10,10,0.9)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", backdropFilter: "blur(18px)" } }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Home /></Protected>} />
            <Route path="/check-in" element={<Protected><DailyCheckIn /></Protected>} />
            <Route path="/lifestyle" element={<Protected><LifestyleHub /></Protected>} />
            <Route path="/lifestyle/nutrition" element={<Protected><Nutrition /></Protected>} />
            <Route path="/lifestyle/nutrition/targets" element={<Protected><NutritionTargets /></Protected>} />
            <Route path="/lifestyle/mindfulness" element={<Protected><Mindfulness /></Protected>} />
            <Route path="/lifestyle/movement" element={<Protected><Movement /></Protected>} />
            <Route path="/wellness" element={<Protected><MyWellness /></Protected>} />
            <Route path="/performance" element={<Protected><Performance /></Protected>} />
            <Route path="/recovery" element={<Protected><Recovery /></Protected>} />
            <Route path="/learning" element={<Protected><Learning /></Protected>} />
            <Route path="/learning/:id" element={<Protected><LearningPathway /></Protected>} />
            <Route path="/learning/:pathwayId/:lessonId" element={<Protected><LearningLesson /></Protected>} />
            <Route path="/circle" element={<Protected><WellnessCircle /></Protected>} />
            <Route path="/circle/:id" element={<Protected><CircleDetail /></Protected>} />
            <Route path="/support" element={<Protected><Support /></Protected>} />
            <Route path="/admin" element={<Protected><AdminDashboard /></Protected>} />
            <Route path="/admin/media" element={<Protected><AdminMedia /></Protected>} />
            <Route path="/playlists" element={<Protected><Playlists /></Protected>} />
            <Route path="/playlists/:id" element={<Protected><Playlists /></Protected>} />
            <Route path="/viea" element={<Protected><Viea /></Protected>} />
            <Route path="/progress" element={<Protected><MyProgress /></Protected>} />
            {PLACEHOLDERS.map((p) => (
              <Route
                key={p.path}
                path={p.path}
                element={
                  <Protected>
                    <Placeholder title={p.title} description={p.description} testid={p.testid} />
                  </Protected>
                }
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
