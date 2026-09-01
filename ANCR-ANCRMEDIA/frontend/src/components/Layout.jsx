import { Outlet } from "react-router-dom";
import EcosystemSidebar from "@/components/EcosystemSidebar";
import ANCRMediaNav from "@/components/ANCRMediaNav";
import TopBar from "@/components/TopBar";
import AudioPlayerBar from "@/components/AudioPlayerBar";
import Footer from "@/components/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      <EcosystemSidebar />
      {/* Secondary ANCRMEDIA nav */}
      <div className="hidden lg:flex flex-col fixed left-[68px] top-0 bottom-[76px] w-[240px] z-30 border-r border-white/[0.05] bg-[#0A0A0A]/90 backdrop-blur-2xl pt-16">
        <ANCRMediaNav />
      </div>
      <div className="flex-1 lg:pl-[308px] pl-[68px] pr-0 pb-[76px]">
        <TopBar />
        <main className="min-h-[calc(100vh-64px)]">
          <Outlet />
          <Footer />
        </main>
      </div>
      <AudioPlayerBar />
    </div>
  );
}
