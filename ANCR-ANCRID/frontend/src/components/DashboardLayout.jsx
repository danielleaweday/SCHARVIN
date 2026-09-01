import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 min-w-0" data-testid="dashboard-main">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
