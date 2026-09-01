import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { ANCRD_LOGO, AncrMark, BrandLogo } from "@/components/ancrd/BrandLogo";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("aaron@ancrd.io");
  const [password, setPassword] = useState("ancrd2026");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  if (user) return <Navigate to="/feed" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome to ANCRD");
      nav("/feed");
    } catch (e) {
      toast.error("Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-[#050505] text-white flex">
      <div className="hidden lg:flex flex-1 relative overflow-hidden border-r border-white/5">
        <img
          src="https://images.unsplash.com/photo-1770062421988-7929b4748e29?crop=entropy&cs=srgb&fm=jpg&w=1600&q=85"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/40 via-[#050505]/60 to-[#050505]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 flex items-center gap-2">
              Part of the <AncrMark /> Ecosystem
            </div>
            <div className="mt-6">
              <img
                src={ANCRD_LOGO}
                alt="ANCRD"
                data-testid="brand-logo-hero"
                className="w-[520px] max-w-full h-auto -ml-6 select-none block"
                style={{ mixBlendMode: "screen" }}
                draggable="false"
              />
            </div>
            <div className="mt-3 font-body text-white/70 max-w-md text-lg">
              The global professional network of the Contemporary Creative Development Program. Verified creators only.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <div><div className="text-white text-3xl font-display font-black">48+</div>Verified Creators</div>
            <div><div className="text-white text-3xl font-display font-black">12</div>Institutions</div>
            <div><div className="text-white text-3xl font-display font-black">10</div>Ecosystem Modules</div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[520px] flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm" data-testid="login-form">
          <div className="mb-6">
            <img
              src={ANCRD_LOGO}
              alt="ANCRD"
              data-testid="brand-logo-signin"
              className="w-[340px] max-w-full h-auto -ml-4 select-none block"
              style={{ mixBlendMode: "screen" }}
              draggable="false"
            />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Verified Access</div>
          <h1 className="font-display text-4xl font-black tracking-tighter mb-1">
            Sign in with <span style={{ backgroundImage: "linear-gradient(90deg, #60A5FA, #A855F7, #EC4899, #F97316)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>ANCRID</span>
            <span className="text-xs align-super" style={{ color: "#F97316" }}>™</span>
          </h1>
          <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-8 flex items-center gap-1">
            One identity across the <AncrMark className="ml-1" /> Ecosystem
          </div>

          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Email</label>
          <input
            data-testid="login-email"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-white/40 outline-none rounded-sm px-4 py-3 mb-4 font-mono text-sm"
            required
          />
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Password</label>
          <input
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 focus:border-white/40 outline-none rounded-sm px-4 py-3 mb-6 font-mono text-sm"
            required
          />
          <button
            data-testid="login-submit"
            type="submit"
            disabled={busy}
            className="w-full bg-white text-black font-mono uppercase tracking-widest text-xs py-3.5 rounded-sm btn-cine hover:bg-[#00E5FF] disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Enter ANCRD"}
          </button>

          <div className="mt-8 p-4 border border-dashed border-white/10 rounded-sm">
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">Demo Credentials</div>
            <div className="font-mono text-xs text-white/70">aaron@ancrd.io / ancrd2026</div>
          </div>
        </form>
      </div>
    </div>
  );
}
