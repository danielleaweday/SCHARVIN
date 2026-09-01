import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Award, Briefcase, PlayCircle, LinkIcon, Fingerprint, Sparkles, FileAudio, FileText, Image as ImageIcon, FileVideo, Archive, ExternalLink } from "lucide-react";
import CoheirLogo from "@/components/coheir/CoheirLogo";
import AncrBadge from "@/components/coheir/AncrBadge";

const ICONS = {
  mp3: FileAudio, wav: FileAudio, aiff: FileAudio, flac: FileAudio,
  mp4: FileVideo, mov: FileVideo,
  pdf: FileText, docx: FileText, pptx: FileText, xlsx: FileText,
  jpg: ImageIcon, jpeg: ImageIcon, png: ImageIcon, webp: ImageIcon, gif: ImageIcon,
  zip: Archive,
};

// Public share view — NO auth required. Uses axios directly (no api instance
// so we skip auth interceptors).
export default function PublicShare() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/share/public/${slug}`)
      .then(({ data }) => setData(data))
      .catch((e) => setErr(e?.response?.data?.detail || "Share link unavailable"));
  }, [slug]);

  if (err) return (
    <div className="min-h-screen bg-black text-white grid place-items-center p-8">
      <div className="text-center">
        <CoheirLogo size={72} className="justify-center" />
        <div className="wordmark text-3xl mt-6">Share link unavailable</div>
        <div className="text-zinc-500 mt-2">{err}</div>
        <Link to="/" className="btn-outline text-xs inline-block mt-6">Return to COHEIR</Link>
      </div>
    </div>
  );
  if (!data) return <div className="min-h-screen bg-black text-white grid place-items-center text-zinc-500 font-mono text-xs">Loading…</div>;

  const s = data.subject;
  const kind = data.kit.kind;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Public top bar */}
      <div className="header-glass sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <CoheirLogo variant="wordmark" size={28} />
          <div className="flex items-center gap-3">
            <div className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {data.kind_label} · Shared via ANCRID™
            </div>
            <AncrBadge variant="pill" />
            <Link to="/" className="btn-outline text-xs">Enter COHEIR</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/10 via-[#8B5CF6]/10 to-black" />
        <div className="absolute -top-16 -left-24 w-96 h-96 rounded-full bg-[#00F0FF]/25 blur-3xl" />
        <div className="absolute -top-16 -right-24 w-96 h-96 rounded-full bg-[#F97316]/20 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-40 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative">
            <div className="w-40 h-40 rounded-3xl overflow-hidden ring-2 ring-white/10 shadow-2xl">
              {s.picture ? <img src={s.picture} alt={s.name} className="w-full h-full object-cover" /> :
                <div className="w-full h-full bg-gradient-cohesion" />}
            </div>
            <div className="absolute -bottom-3 -right-3 bg-black border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-xl">
              <BadgeCheck className="w-3.5 h-3.5 text-[#00F0FF] verified-dot" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white">ANCRID Verified</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/25">
                {data.kind_label}
              </span>
              {s.title && <span className="text-zinc-400 text-sm">{s.title}</span>}
              {s.company && <span className="text-zinc-500 text-sm">· {s.company}</span>}
            </div>
            <h1 className="wordmark text-5xl md:text-6xl leading-none tracking-tighter">{s.name}</h1>
            {s.bio && <p className="text-zinc-400 mt-3 leading-relaxed max-w-2xl">{s.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-zinc-500 text-xs">
              {s.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.location}</div>}
              {s.ancrid && <div className="flex items-center gap-1 font-mono"><Fingerprint className="w-3 h-3" /> {s.ancrid}</div>}
              {s.availability && <div className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#00F0FF]" /> {s.availability}</div>}
            </div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {s.disciplines?.length > 0 && (
            <Card kicker="Disciplines" title="Craft & Expertise">
              <div className="flex flex-wrap gap-1.5">
                {[...(s.disciplines || []), ...(s.expertise || [])].map((d) => (
                  <span key={d} className="text-xs px-2 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#C4B5FD] font-mono uppercase tracking-widest">{d}</span>
                ))}
              </div>
            </Card>
          )}
          {s.awards?.length > 0 && (
            <Card kicker="Awards" title="Recognition" icon={Award}>
              <ul className="space-y-2">
                {s.awards.map((a) => <li key={a} className="text-zinc-300 text-sm">· {a}</li>)}
              </ul>
            </Card>
          )}
          {s.skills?.length > 0 && (
            <Card kicker="Skills" title="Verified Skills">
              <div className="flex flex-wrap gap-1.5">
                {s.skills.map((sk) => (
                  <span key={sk} className="text-xs px-2 py-1 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 font-mono uppercase tracking-widest">{sk}</span>
                ))}
              </div>
            </Card>
          )}

          {s.credits?.length > 0 && (
            <Card kicker="Discography" title="Selected Credits" icon={PlayCircle} className="lg:col-span-2">
              <div className="divide-y divide-white/[0.05]">
                {s.credits.map((c, i) => (
                  <div key={i} className="py-3 flex items-center gap-4">
                    <PlayCircle className="w-4 h-4 text-zinc-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold">{c.title} <span className="text-zinc-500">— {c.artist}</span></div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{c.role}{c.label && ` · ${c.label}`}</div>
                    </div>
                    <div className="text-zinc-400 text-xs font-mono">{c.year}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {s.career_history?.length > 0 && (
            <Card kicker="Career" title="Career History" icon={Briefcase} className="lg:col-span-3">
              <div className="grid md:grid-cols-3 gap-3">
                {s.career_history.map((h, i) => (
                  <div key={i} className="glass-interactive p-4">
                    <div className="text-white font-semibold">{h.role}</div>
                    <div className="text-zinc-400 text-sm">{h.company}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-2">{h.years}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Portfolio files (public/shared) */}
          {s.portfolio_files?.length > 0 && (
            <Card kicker="Portfolio" title="Selected Work" className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {s.portfolio_files.map((f) => {
                  const Icon = ICONS[f.extension] || FileText;
                  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(f.extension);
                  const isAudio = ["mp3", "wav", "aiff", "flac"].includes(f.extension);
                  const url = `${API_BASE}/uploads/file/${f.id}/download`;
                  return (
                    <div key={f.id} className="glass-interactive p-0 overflow-hidden">
                      <div className="h-32 bg-black/40 grid place-items-center">
                        {isImage ? <img src={url} alt="" className="w-full h-full object-cover" /> :
                          <Icon className="w-10 h-10 text-zinc-500" />}
                      </div>
                      <div className="p-3">
                        <div className="text-white text-xs font-semibold truncate">{f.title || f.original_filename}</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">{f.category}</div>
                        {isAudio && <audio controls src={url} className="w-full mt-2 h-8" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Reviews (student_profile / institution_review kinds) */}
          {s.reviews?.length > 0 && (
            <Card kicker="ANCRID™" title="Verified Reviews" className="lg:col-span-3">
              <div className="space-y-2">
                {s.reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="glass-interactive p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white text-sm font-semibold">{r.reviewer_name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25 font-mono">
                        {Math.round(Object.values(r.scores).reduce((a, b) => a + b, 0) / Object.values(r.scores).length * 10) / 10}/10
                      </span>
                    </div>
                    <div className="text-zinc-400 text-sm">{r.comments}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(s.portfolio_links?.length > 0 || s.professional_links?.length > 0) && (
            <Card kicker="Links" title="Portfolio & Web" className="lg:col-span-3">
              <div className="flex flex-wrap gap-2">
                {[...(s.portfolio_links || []), ...(s.professional_links || [])].map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer" className="glass-interactive px-4 py-2 text-sm text-white flex items-center gap-2">
                    <LinkIcon className="w-3 h-3 text-[#00F0FF]" /> {l.label} <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Ecosystem strip */}
        <div className="mt-10 glass-panel p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="wordmark text-lg text-white">Powered by the ANCR Ecosystem</div>
            <AncrBadge variant="block" />
          </div>
          <p className="text-zinc-500 text-sm max-w-3xl leading-relaxed mt-3">
            This is a revocable share view generated via ANCRID™. Every credential displayed has been verified through
            the ANCR ecosystem — ANCRID™, ANCRLAB™, ANCRSync™, INHEIRA™, Vaulta™ and ANCRLaunch™ — and can be audited or
            revoked at any time by the owner.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ kicker, title, icon: Icon, children, className = "" }) {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-[#00F0FF]" />}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{kicker}</div>
          <div className="wordmark text-lg text-white leading-tight">{title}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
