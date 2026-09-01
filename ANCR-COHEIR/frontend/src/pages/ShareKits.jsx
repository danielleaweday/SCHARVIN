import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { RoleChip } from "@/components/coheir/MentorCard";
import { motion } from "framer-motion";
import { Share2, Copy, Ban, Eye, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";

const KINDS = [
  { v: "public_portfolio", l: "Public Portfolio", d: "Cinematic press-kit view of your work.", tone: "blue" },
  { v: "student_profile", l: "Student Profile", d: "CCDP student view for mentors and faculty.", tone: "violet" },
  { v: "booking_profile", l: "Booking Profile", d: "Availability, disciplines, session booking CTA.", tone: "orange" },
  { v: "professional_resume", l: "Professional Resume", d: "Career history, credits, awards — recruiter view.", tone: "blue" },
  { v: "press_kit", l: "Press Kit", d: "Bio, awards, credits, portfolio for media & press.", tone: "orange" },
  { v: "institution_review", l: "Institution Review", d: "Program-level view for institution partners.", tone: "violet" },
  { v: "private_review", l: "Private Review", d: "Faculty-only view. Locked, revocable, audited.", tone: "zinc" },
];

export default function ShareKits() {
  const { user } = useAuth();
  const [kits, setKits] = useState([]);
  const [creating, setCreating] = useState(false);
  const [selectedKind, setSelectedKind] = useState("press_kit");
  const [expires, setExpires] = useState(30);

  const load = () => api.get("/share/kits/mine").then(({ data }) => setKits(data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/share/kits", {
        subject_user_id: user.user_id,
        kind: selectedKind,
        expires_days: expires || null,
      });
      const link = `${window.location.origin}/p/${data.slug}`;
      await navigator.clipboard?.writeText(link).catch(() => {});
      toast.success(`Share kit created — link copied to clipboard`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not create kit");
    } finally { setCreating(false); }
  };

  const revoke = async (id) => {
    await api.post(`/share/kits/${id}/revoke`);
    toast.success("Share link revoked");
    load();
  };

  const copyLink = (slug) => {
    const link = `${window.location.origin}/p/${slug}`;
    navigator.clipboard?.writeText(link);
    toast.success("Link copied");
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2">
          <Share2 className="w-3.5 h-3.5" /> Share Kits
        </div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Revocable public share links.</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl text-sm">
          Generate a signed, expirable, revocable link that renders a specific view of your identity.
          Permissions inherit from ANCRID™. Every view is audited.
        </p>
      </header>

      {/* Kit types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {KINDS.map((k) => (
          <button key={k.v} data-testid={`kit-kind-${k.v}`} onClick={() => setSelectedKind(k.v)}
            className={`glass-interactive text-left p-4 ${selectedKind === k.v ? "border-[#00F0FF]/40" : ""}`}>
            <RoleChip tone={k.tone}>{k.l}</RoleChip>
            <div className="text-zinc-400 text-sm mt-2 leading-snug">{k.d}</div>
          </button>
        ))}
      </div>

      {/* Create panel */}
      <div className="glass-panel p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Generate</div>
          <div className="wordmark text-lg text-white">{KINDS.find((k) => k.v === selectedKind)?.l} for {user?.name}</div>
        </div>
        <label className="text-xs text-zinc-400 flex items-center gap-2">
          Expires in
          <select value={expires} onChange={(e) => setExpires(Number(e.target.value))}
            data-testid="kit-expires-select"
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white text-xs">
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
            <option value={0}>Never expires</option>
          </select>
        </label>
        <button onClick={create} disabled={creating} className="btn-primary text-sm flex items-center gap-2"
          data-testid="kit-create-btn">
          <Plus className="w-4 h-4" /> {creating ? "Creating…" : "Create share kit"}
        </button>
      </div>

      {/* Existing kits */}
      <div className="space-y-3">
        <div className="wordmark text-xl text-white">Your share kits</div>
        {kits.length === 0 && <div className="glass-panel p-8 text-center text-zinc-500">No share kits yet.</div>}
        {kits.map((k) => {
          const link = `${window.location.origin}/p/${k.slug}`;
          const label = KINDS.find((x) => x.v === k.kind)?.l || k.kind;
          return (
            <motion.div key={k.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-interactive p-4 flex flex-col md:flex-row md:items-center gap-3"
              data-testid={`kit-item-${k.id}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <RoleChip tone="violet">{label}</RoleChip>
                  {k.revoked && <RoleChip tone="orange">Revoked</RoleChip>}
                  {!k.revoked && k.expires_at && (
                    <RoleChip tone="zinc">Expires {new Date(k.expires_at).toLocaleDateString()}</RoleChip>
                  )}
                </div>
                <div className="font-mono text-xs text-[#00F0FF] truncate">{link}</div>
                <div className="text-zinc-500 text-xs mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {k.views} views</span>
                  <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/p/${k.slug}`} target="_blank" className="btn-outline text-xs" data-testid={`kit-preview-${k.id}`}>Preview</Link>
                <button onClick={() => copyLink(k.slug)} className="btn-outline text-xs flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
                {!k.revoked && (
                  <button onClick={() => revoke(k.id)} className="btn-outline text-xs flex items-center gap-1 border-red-500/30 text-red-300"
                    data-testid={`kit-revoke-${k.id}`}>
                    <Ban className="w-3 h-3" /> Revoke
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
