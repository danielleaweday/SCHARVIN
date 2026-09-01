import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-black text-white">
        <div className="font-mono text-xs tracking-widest text-zinc-500 uppercase">Loading COHEIR…</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <TopBar />
      <main className="pl-[260px] pt-[72px]">
        <div className="max-w-[1500px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
