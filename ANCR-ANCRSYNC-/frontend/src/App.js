import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

import Shell from "@/components/Shell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Readiness from "@/pages/Readiness";
import Portfolio from "@/pages/Portfolio";
import Resume from "@/pages/Resume";
import OpportunityList from "@/pages/OpportunityList";
import EmployerNetwork from "@/pages/EmployerNetwork";
import Applications from "@/pages/Applications";
import Interviews from "@/pages/Interviews";
import GraduateOutcomes from "@/pages/GraduateOutcomes";
import CareerCoach from "@/pages/CareerCoach";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" theme="dark" toastOptions={{ style: { background: "#050505", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 0, fontFamily: "Satoshi, sans-serif" } }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
            <Route path="/readiness" element={<Shell><Readiness /></Shell>} />
            <Route path="/portfolio" element={<Shell><Portfolio /></Shell>} />
            <Route path="/resume" element={<Shell><Resume /></Shell>} />
            <Route path="/jobs" element={<Shell><OpportunityList kind="job" /></Shell>} />
            <Route path="/internships" element={<Shell><OpportunityList kind="internship" /></Shell>} />
            <Route path="/auditions" element={<Shell><OpportunityList kind="audition" /></Shell>} />
            <Route path="/projects" element={<Shell><OpportunityList kind="project" /></Shell>} />
            <Route path="/employer-network" element={<Shell><EmployerNetwork /></Shell>} />
            <Route path="/applications" element={<Shell><Applications /></Shell>} />
            <Route path="/interviews" element={<Shell><Interviews /></Shell>} />
            <Route path="/graduate-outcomes" element={<Shell><GraduateOutcomes /></Shell>} />
            <Route path="/coach" element={<Shell><CareerCoach /></Shell>} />
            <Route path="/settings" element={<Shell><Settings /></Shell>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
