import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/cynaiah/AppShell";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Create from "@/pages/Create";
import StoryLab from "@/pages/StoryLab";
import AIVisualLab from "@/pages/AIVisualLab";
import SyncStudio from "@/pages/SyncStudio";
import RightsCredits from "@/pages/RightsCredits";
import Learn from "@/pages/Learn";
import Portfolio from "@/pages/Portfolio";
import Showcase from "@/pages/Showcase";
import ProductionStudio from "@/pages/ProductionStudio";
import FacultyDashboard from "@/pages/FacultyDashboard";
import FacultyProject from "@/pages/FacultyProject";
import Reviews from "@/pages/Reviews";
import EditFinish from "@/pages/EditFinish";
import CynaPage from "@/pages/CynaPage";
import { CynaBubble } from "@/components/cynaiah/CynaChat";
import ComingSoon from "@/pages/ComingSoon";

import "@/index.css";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "rgba(10,10,12,0.9)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#fff",
                            backdropFilter: "blur(20px)",
                        },
                    }}
                />
                <Routes>
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />

                    <Route element={<AppShell />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/learn" element={<Learn />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/story-lab" element={<StoryLab />} />
                        <Route path="/ai-visual-lab" element={<AIVisualLab />} />
                        <Route path="/sync-studio" element={<SyncStudio />} />
                        <Route path="/rights-credits" element={<RightsCredits />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/showcase" element={<Showcase />} />
                        <Route path="/cyna" element={<CynaPage />} />
                        <Route path="/faculty" element={<FacultyDashboard />} />
                        <Route path="/faculty/projects/:id" element={<FacultyProject />} />

                        {/* Structural pages */}
                        <Route
                            path="/production-studio"
                            element={<ProductionStudio />}
                        />
                        <Route
                            path="/edit-finish"
                            element={<EditFinish />}
                        />
                        <Route
                            path="/assets"
                            element={
                                <ComingSoon
                                    title="Assets"
                                    subtitle="Images · Video · Audio · Documents"
                                    lines={[
                                        "Central library of every project's media",
                                        "AI-generated, uploaded, and library assets",
                                        "Tag, filter, and organize by project or type",
                                        "Full-text search across your visual work",
                                    ]}
                                />
                            }
                        />
                        <Route
                            path="/collaborators"
                            element={
                                <ComingSoon
                                    title="Collaborators"
                                    subtitle="Cast · Crew · Faculty · Mentors"
                                    lines={[
                                        "Invite and manage project collaborators",
                                        "Assign roles and permissions",
                                        "See who touched what and when",
                                        "Message the team from one place",
                                    ]}
                                />
                            }
                        />
                        <Route path="/reviews" element={<Reviews />} />
                        <Route
                            path="/opportunities"
                            element={
                                <ComingSoon
                                    title="Opportunities"
                                    subtitle="Internships · Festivals · Commissions"
                                    lines={[
                                        "Curated internships and paid gigs",
                                        "Festival submissions and open calls",
                                        "Industry commissions via COHEIR mentors",
                                        "Post-graduation launch via ANCRLaunch",
                                    ]}
                                />
                            }
                        />
                        <Route
                            path="/calendar"
                            element={
                                <ComingSoon
                                    title="Calendar"
                                    subtitle="Deadlines · Shoots · Reviews · Classes"
                                    lines={[
                                        "Everything on one production calendar",
                                        "Sync with your ANCRA schedule",
                                        "Auto-generated from project timelines",
                                        "Shareable views for the whole crew",
                                    ]}
                                />
                            }
                        />
                        <Route
                            path="/messages"
                            element={
                                <ComingSoon
                                    title="Messages"
                                    subtitle="Direct · Project · Faculty"
                                    lines={[
                                        "Threaded conversations per project",
                                        "Direct messages with peers, faculty & mentors",
                                        "Attach shots, clips, and boards inline",
                                        "Voice notes for the crew on the go",
                                    ]}
                                />
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ComingSoon
                                    title="Settings"
                                    subtitle="Profile · Preferences · Identity"
                                    lines={[
                                        "Update your creator profile",
                                        "Notification and privacy preferences",
                                        "ANCRID identity linkage (future SSO)",
                                        "AI provider configuration for institutions",
                                    ]}
                                />
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
