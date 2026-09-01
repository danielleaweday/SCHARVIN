import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/cynaiah/Sidebar";
import { CynaBubble } from "@/components/cynaiah/CynaChat";
import { Loader2 } from "lucide-react";

export default function AppShell() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] text-white/70">
                <Loader2 className="animate-spin mr-3" /> Loading CYNAIAH…
            </div>
        );
    }
    if (!user) return <Navigate to="/auth/login" replace />;

    // Hide the floating bubble on the /cyna page itself (the workspace already
    // contains the chat).
    const showBubble = !location.pathname.startsWith("/cyna");

    return (
        <div className="flex h-screen bg-[#030303] text-white overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="relative min-h-full">
                    <Outlet />
                </div>
                {showBubble && <CynaBubble />}
            </main>
        </div>
    );
}
