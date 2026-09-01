import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, Bell, Palette } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return <div className="p-16 text-white/40">Sign in to view settings.</div>;
  return (
    <div className="px-8 py-10 pb-24 max-w-3xl" data-testid="settings-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Settings</div>
        <h1 className="font-display text-5xl font-black tracking-tighter leading-tight mt-2">Account & preferences.</h1>
      </div>

      <div className="glass rounded-2xl p-6 flex items-center gap-5">
        {user.avatar ? (
          <img src={user.avatar} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
        ) : (
          <div className="w-16 h-16 rounded-2xl gradient-progress flex items-center justify-center font-display text-2xl">{user.name[0]}</div>
        )}
        <div className="flex-1">
          <div className="font-display text-xl">{user.name}</div>
          <div className="text-[12px] text-white/60">{user.email}</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{user.role} · via ANCRID™</div>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl divide-y divide-white/[0.06]">
        <Row icon={<Shield size={15} />} label="Verified identity" value="Managed by ANCRID™" />
        <Row icon={<Bell size={15} />} label="Notifications" value="Email + in-app" />
        <Row icon={<Palette size={15} />} label="Theme" value="Obsidian (default)" />
      </div>

      <button
        onClick={async () => { await logout(); nav("/login"); }}
        data-testid="settings-signout"
        className="mt-8 w-full py-3 rounded-xl glass glass-hover text-sm flex items-center justify-center gap-2 text-white/80"
      >
        <LogOut size={14} /> Sign out
      </button>

      <div className="mt-10 text-[10px] text-white/40 tracking-widest uppercase text-center">
        ANCRMEDIA™ · v1.0 · Part of the ANCR Ecosystem
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center px-5 py-4 gap-4">
      <div className="text-white/60">{icon}</div>
      <div className="flex-1 text-[13px]">{label}</div>
      <div className="text-[12px] text-white/50">{value}</div>
    </div>
  );
}
