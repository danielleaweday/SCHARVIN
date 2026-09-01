import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RoleProvider, useRole } from "@/context/RoleContext";
import AppShell from "@/components/shell/AppShell";
import { Toaster } from "@/components/ui/sonner";

import Landing from "@/pages/Landing";

// Student
import StudentDashboard from "@/pages/student/Dashboard";
import LearningJourney from "@/pages/student/LearningJourney";
import Experience from "@/pages/student/Experience";
import LessonPlayer from "@/pages/student/LessonPlayer";
import Assignments from "@/pages/student/Assignments";
import Capstones from "@/pages/student/Capstones";
import ThirtySong from "@/pages/student/ThirtySong";
import Portfolio from "@/pages/student/Portfolio";
import Teams from "@/pages/student/Teams";
import Messages from "@/pages/student/Messages";
import CalendarPage from "@/pages/student/Calendar";
import Achievements from "@/pages/student/Achievements";
import CreatorPassport from "@/pages/student/CreatorPassport";
import CreativeProjects from "@/pages/student/CreativeProjects";
import PeerReviews from "@/pages/student/PeerReviews";
import PortfolioBuilder from "@/pages/student/PortfolioBuilder";
import AICompanion from "@/pages/student/AICompanion";
import ProgressJourney from "@/pages/student/ProgressJourney";
import GraduationDashboard from "@/pages/student/GraduationDashboard";

// Faculty
import FacultyDashboard from "@/pages/faculty/CommandCenter";
import FacultyStudents from "@/pages/faculty/Students";
import FacultyApprovals from "@/pages/faculty/Approvals";
import FacultyCurriculum from "@/pages/faculty/CurriculumBuilder";
import FacultyAnalytics from "@/pages/faculty/Analytics";
import FacultyCohorts from "@/pages/faculty/Cohorts";
import FacultyReviews from "@/pages/faculty/Reviews";
import LessonBuilder from "@/pages/faculty/LessonBuilder";
import AssignmentBuilder from "@/pages/faculty/AssignmentBuilder";
import StudioExperienceBuilder from "@/pages/faculty/StudioExperienceBuilder";
import Grading from "@/pages/faculty/Grading";
import Rubrics from "@/pages/faculty/Rubrics";
import AICourseBuilder from "@/pages/faculty/AICourseBuilder";
import CreativeTeamManagement from "@/pages/faculty/CreativeTeamManagement";

// Ecosystem
import EcosystemHub from "@/pages/hubs/EcosystemHub";
import COHEIRSuite from "@/pages/hubs/COHEIRSuite";

// Standalone modules (open in new tab)
import ANCRLABModule from "@/pages/modules/ANCRLAB";
import ANCRSyncModule from "@/pages/modules/ANCRSync";
import COHEIRModule from "@/pages/modules/COHEIR";
import INHEIRAModule from "@/pages/modules/INHEIRA";
import ANCRIDModule from "@/pages/modules/ANCRID";
import ComingSoonModule from "@/pages/modules/ComingSoon";

// Utility
import Library from "@/pages/Library";
import Settings from "@/pages/Settings";

function RoleGate() {
  const { role } = useRole();
  return role === "faculty" ? <Navigate to="/faculty" replace /> : <StudentDashboard />;
}

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function App() {
  return (
    <RoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Landing />} />

          <Route element={<ShellLayout />}>
            <Route path="/" element={<RoleGate />} />
            <Route path="/dashboard" element={<RoleGate />} />

            {/* student */}
            <Route path="/journey" element={<LearningJourney />} />
            <Route path="/progress" element={<ProgressJourney />} />
            <Route path="/experience/:id" element={<Experience />} />
            <Route path="/lesson/:id" element={<LessonPlayer />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/projects" element={<CreativeProjects />} />
            <Route path="/peer-reviews" element={<PeerReviews />} />
            <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
            <Route path="/companion" element={<AICompanion />} />
            <Route path="/graduation" element={<GraduationDashboard />} />
            <Route path="/capstones" element={<Capstones />} />
            <Route path="/thirty-song" element={<ThirtySong />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/passport" element={<CreatorPassport />} />

            {/* faculty */}
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/students" element={<FacultyStudents />} />
            <Route path="/faculty/approvals" element={<FacultyApprovals />} />
            <Route path="/faculty/reviews" element={<FacultyReviews />} />
            <Route path="/faculty/curriculum" element={<FacultyCurriculum />} />
            <Route path="/faculty/experience-builder" element={<StudioExperienceBuilder />} />
            <Route path="/faculty/lesson-builder" element={<LessonBuilder />} />
            <Route path="/faculty/assignment-builder" element={<AssignmentBuilder />} />
            <Route path="/faculty/ai-course-builder" element={<AICourseBuilder />} />
            <Route path="/faculty/rubrics" element={<Rubrics />} />
            <Route path="/faculty/grading" element={<Grading />} />
            <Route path="/faculty/teams" element={<CreativeTeamManagement />} />
            <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            <Route path="/faculty/cohorts" element={<FacultyCohorts />} />

            {/* ecosystem */}
            <Route path="/hub/COHEIR" element={<COHEIRSuite />} />
            <Route path="/hub/:module" element={<EcosystemHub />} />

            {/* utility */}
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Standalone modules — open in new tab (no ANCRA shell, own ModuleShell) */}
          <Route path="/module/ANCRLAB"    element={<ANCRLABModule />} />
          <Route path="/module/ANCRSync"   element={<ANCRSyncModule />} />
          <Route path="/module/COHEIR"     element={<COHEIRModule />} />
          <Route path="/module/INHEIRA"    element={<INHEIRAModule />} />
          <Route path="/module/ANCRID"     element={<ANCRIDModule />} />
          <Route path="/module/:name"      element={<ComingSoonModule />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" />
    </RoleProvider>
  );
}

export default App;
