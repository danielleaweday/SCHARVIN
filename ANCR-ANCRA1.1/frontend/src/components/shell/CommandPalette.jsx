import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { get, API } from "@/lib/api";
import { useRole } from "@/context/RoleContext";
import {
  Search, ArrowRight, GraduationCap, BookOpen, User, Users, Music, Zap, Layers,
  Waves, FileText, Calendar as CalendarIcon, Coins, Rocket, Play, Radio,
  Fingerprint, Sparkles, Settings, HelpCircle, ClipboardList, PenLine,
  Wand2, Palette, Command as CmdIcon, ChevronRight,
} from "lucide-react";

/** Groups & their icons */
const GROUPS = {
  ai:          { label: "AI Actions",              icon: Sparkles,       accent: true },
  navigation:  { label: "Navigation · Ecosystem",  icon: CmdIcon },
  courses:     { label: "Studio Experiences™",     icon: GraduationCap },
  lessons:     { label: "Lessons",                  icon: BookOpen },
  students:    { label: "Students",                 icon: User },
  faculty:     { label: "Faculty & COHEIR",         icon: Users },
  songs:       { label: "Songs · 30 Song™",        icon: Music },
  inheira:     { label: "INHEIRA™ Projects",       icon: Music },
  ancrlab:     { label: "ANCRLAB™ Sessions",       icon: Waves },
  ancrsync:    { label: "ANCRSync™ Collaborations",icon: Users },
  portfolio:   { label: "Portfolio",                icon: Palette },
  calendar:    { label: "Calendar Events",          icon: CalendarIcon },
  assignments: { label: "Assignments",              icon: ClipboardList },
  files:       { label: "Files",                    icon: FileText },
  settings:    { label: "Settings",                 icon: Settings },
  help:        { label: "Help & Docs",              icon: HelpCircle },
};

/** Fixed navigation items — searchable */
const ECOSYSTEM_NAV = [
  { title: "ANCRA™", subtitle: "Learning OS", to: "/dashboard", icon: GraduationCap },
  { title: "ANCRLAB™", subtitle: "Studio projects & DAW", to: "/hub/ANCRLAB", icon: Waves },
  { title: "ANCRSync™", subtitle: "Writing rooms & teams", to: "/hub/ANCRSync", icon: Users },
  { title: "COHEIR™", subtitle: "Mentors & industry", to: "/hub/COHEIR", icon: Zap },
  { title: "INHEIRA™", subtitle: "Songs, splits & publishing", to: "/hub/INHEIRA", icon: Music },
  { title: "Vaulta™", subtitle: "Royalties & finance", to: "/hub/Vaulta", icon: Coins },
  { title: "ANCRLaunch™", subtitle: "Career readiness", to: "/hub/ANCRLaunch", icon: Rocket },
  { title: "ANCRVIEW™", subtitle: "Masterclasses & showcases", to: "/hub/ANCRVIEW", icon: Play },
  { title: "ANCRWAV™", subtitle: "Releases & streaming", to: "/hub/ANCRWAV", icon: Radio },
  { title: "ANCRID™", subtitle: "Creator identity & Passport", to: "/hub/ANCRID", icon: Fingerprint },
];

const AI_ACTIONS = [
  { title: "Ask AIAH about my journey", subtitle: "Contextual streaming", prompt: "What's the most valuable thing I can do next?" },
  { title: "Find portfolio gaps",       subtitle: "Analyse my Portfolio", prompt: "Analyse gaps in my current portfolio and suggest the exact next 3 pieces to submit." },
  { title: "Which songs to finish next",subtitle: "30 Song™ optimizer", prompt: "Given my 30 Song Progress, which 3 songs should I finish next to maximise release velocity?" },
  { title: "Suggest a next Master Session", subtitle: "Discovery", prompt: "Suggest a next Master Session™ for me based on my current work." },
  { title: "Draft a peer critique for Nightshift", subtitle: "ANCRSync assistant", prompt: "Draft a peer critique for the latest Nightshift session." },
];

const FILES = [
  { title: "Landslide reduction.pdf",   subtitle: "Score · Songwriting Architecture",  to: "/lesson/les_song_01", size: "412 KB" },
  { title: "Ableton stem pack.zip",     subtitle: "ANCRLAB™ · The First Eight",         to: "/hub/ANCRLAB", size: "184 MB" },
  { title: "Publishing 101 slides.pdf", subtitle: "Kobalt · The Deal Room",             to: "/hub/COHEIR", size: "6.2 MB" },
  { title: "Nightshift · session 03.wav", subtitle: "ANCRSync™",                        to: "/hub/ANCRSync", size: "34 MB" },
];

const SETTINGS = [
  { title: "Switch to Student", subtitle: "Change active role", action: "role:student" },
  { title: "Switch to Faculty", subtitle: "Change active role", action: "role:faculty" },
  { title: "Open Settings",     subtitle: "Preferences · theme · AIAH", to: "/settings" },
];

const HELP = [
  { title: "Ecosystem overview",     subtitle: "How ANCRA routes across ANCR modules",           external: true },
  { title: "30 Song Progress™",      subtitle: "The signature CCDP capstone tracker",            external: true },
  { title: "AIAH intelligence layer",subtitle: "How context flows across the ecosystem",         external: true },
  { title: "Keyboard shortcuts",     subtitle: "Every shortcut inside ANCRA",                    external: true },
];

/** In-memory mock catalogues for modules not yet in Mongo (design-only) */
const INHEIRA_PROJECTS = [
  { title: "Cathedral in July", subtitle: "Master · 60/40 split (Ellis · Reyes)", to: "/hub/INHEIRA" },
  { title: "Half-Light Room",   subtitle: "Publisher inquiry · Kobalt",           to: "/hub/INHEIRA" },
  { title: "Say Less",          subtitle: "Copyright certificate issued",         to: "/hub/INHEIRA" },
  { title: "Blue Hour",         subtitle: "Release Q1 · ANCRWAV™",               to: "/hub/INHEIRA" },
];

const ANCRLAB_SESSIONS = [
  { title: "Studio A · Vocal capture", subtitle: "Today · 09:30 with Ava",     to: "/hub/ANCRLAB" },
  { title: "Studio B · Mix session",   subtitle: "Thu · 14:00 with L. Neri",   to: "/hub/ANCRLAB" },
  { title: "Sound Design palette",     subtitle: "Winter batch · 8/12 patches",to: "/hub/ANCRLAB" },
];

const ANCRSYNC_COLLABS = [
  { title: "Nightshift · Writing Room", subtitle: "3 members · active",       to: "/hub/ANCRSync" },
  { title: "Lo-Fi Society",             subtitle: "5 members · compilation",  to: "/hub/ANCRSync" },
  { title: "Cohort 07 · Guest week",    subtitle: "40 members · this week",   to: "/hub/ANCRSync" },
];

// ------------------------------------------------------------
export default function CommandPalette({ open, onClose }) {
  const nav = useNavigate();
  const { role, setRole } = useRole();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { data: dash } = useSWR(open ? "/student/dashboard" : null, get);
  const { data: journeys } = useSWR(open ? "/student/journeys" : null, get);
  const { data: assignments } = useSWR(open ? "/student/assignments" : null, get);
  const { data: songs } = useSWR(open ? "/student/songs" : null, get);
  const { data: cal } = useSWR(open ? "/student/calendar" : null, get);
  const { data: portfolio } = useSWR(open ? "/student/portfolio" : null, get);
  const { data: facStudents } = useSWR(open ? "/faculty/students" : null, get);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  // Assemble the searchable index
  const items = useMemo(() => {
    const list = [];

    // AI Actions — always visible
    AI_ACTIONS.forEach((a, i) =>
      list.push({ group: "ai", id: `ai-${i}`, title: a.title, subtitle: a.subtitle, prompt: a.prompt })
    );

    // Navigation
    ECOSYSTEM_NAV.forEach((n) =>
      list.push({ group: "navigation", id: `nav-${n.to}`, title: n.title, subtitle: n.subtitle, to: n.to, iconOverride: n.icon })
    );

    // Courses (experiences)
    (journeys?.experiences || dash?.experiences || []).forEach((e) =>
      list.push({ group: "courses", id: e.id, title: e.title, subtitle: `${e.kind} · ${e.faculty || ""}`, to: `/experience/${e.id}` })
    );

    // Lessons (from dash) — the seeded lessons come from experience endpoint; hard-code the four seeded
    [
      { id: "les_song_01", title: "The First Eight Bars", subtitle: "Chapter 01 · Songwriting Architecture", to: "/lesson/les_song_01" },
      { id: "les_song_02", title: "The Prosody of the Chorus", subtitle: "Chapter 02 · Songwriting Architecture", to: "/lesson/les_song_02" },
      { id: "les_prod_01", title: "Sound Design · Building Your Palette", subtitle: "Chapter 01 · Production Lab", to: "/lesson/les_prod_01" },
      { id: "les_deal_01", title: "The Anatomy of a Publishing Deal", subtitle: "Master Session™ · The Deal Room", to: "/lesson/les_deal_01" },
    ].forEach((l) => list.push({ group: "lessons", id: l.id, title: l.title, subtitle: l.subtitle, to: l.to }));

    // Students (faculty view)
    (facStudents?.students || []).forEach((s) =>
      list.push({ group: "students", id: s.id, title: s.name, subtitle: `${s.cohort || ""} · ${s.concentration || ""}`, to: "/faculty/students", avatar: s.avatar })
    );

    // Faculty & COHEIR — hardcoded (small set from seed)
    [
      { id: "fac_tb", title: "Prof. Terrence Bloom", subtitle: "Studio Director · Artist in Residence", to: "/hub/COHEIR", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" },
      { id: "fac_im", title: "Ivy Marsh", subtitle: "Executive in Residence · Publishing/A&R", to: "/hub/COHEIR", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop" },
      { id: "fac_ln", title: "Lucas Neri", subtitle: "Adjunct Professor · Sound Design", to: "/hub/COHEIR", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
    ].forEach((f) => list.push({ group: "faculty", ...f }));

    // Songs
    (songs?.songs || []).forEach((s) =>
      list.push({ group: "songs", id: s.id, title: `#${String(s.number).padStart(2, "0")} · ${s.title}`, subtitle: `Status · ${s.status}`, to: "/thirty-song" })
    );

    // INHEIRA / ANCRLAB / ANCRSync (design mocks)
    INHEIRA_PROJECTS.forEach((p, i) => list.push({ group: "inheira", id: `inh-${i}`, ...p }));
    ANCRLAB_SESSIONS.forEach((s, i) => list.push({ group: "ancrlab", id: `lab-${i}`, ...s }));
    ANCRSYNC_COLLABS.forEach((s, i) => list.push({ group: "ancrsync", id: `sync-${i}`, ...s }));

    // Portfolio
    (portfolio?.items || []).forEach((p) =>
      list.push({ group: "portfolio", id: p.id, title: p.title, subtitle: `${p.kind} · reviewed by ${p.reviewer} · ${p.score}`, to: "/portfolio", cover: p.cover })
    );

    // Calendar
    (cal?.events || []).slice(0, 40).forEach((e) =>
      list.push({ group: "calendar", id: e.id, title: e.title, subtitle: `${e.date} · ${e.start} · ${e.module || ""}`, to: "/calendar" })
    );

    // Assignments
    (assignments?.assignments || []).forEach((a) =>
      list.push({ group: "assignments", id: a.id, title: a.title, subtitle: `${a.experience} · due ${a.due}`, to: "/assignments" })
    );

    // Files
    FILES.forEach((f, i) => list.push({ group: "files", id: `file-${i}`, title: f.title, subtitle: `${f.subtitle} · ${f.size}`, to: f.to }));

    // Settings
    SETTINGS.forEach((s, i) => list.push({ group: "settings", id: `set-${i}`, ...s }));

    // Help
    HELP.forEach((h, i) => list.push({ group: "help", id: `hlp-${i}`, ...h }));

    return list;
  }, [journeys, dash, facStudents, songs, cal, portfolio, assignments]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) =>
        i.title?.toLowerCase().includes(q) ||
        i.subtitle?.toLowerCase().includes(q) ||
        i.group?.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Group them for rendering
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((it) => { (g[it.group] = g[it.group] || []).push(it); });
    // preserve GROUPS order
    return Object.keys(GROUPS).filter((k) => g[k]?.length).map((k) => ({ key: k, items: g[k] }));
  }, [filtered]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  useEffect(() => { setCursor(0); }, [query]);
  useEffect(() => {
    if (cursor >= flat.length) setCursor(Math.max(0, flat.length - 1));
  }, [flat.length, cursor]);

  // Scroll active into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-cursor="${cursor}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const runItem = useCallback((it) => {
    if (!it) return;
    if (it.prompt) {
      // AI action → close and route to companion page with prefill in query string
      window.dispatchEvent(new CustomEvent("aiah:prefill", { detail: { prompt: it.prompt } }));
      nav("/companion");
      onClose();
      return;
    }
    if (it.action?.startsWith("role:")) {
      setRole(it.action.split(":")[1]);
      onClose();
      return;
    }
    if (it.external) { onClose(); return; }
    if (it.to) { nav(it.to); onClose(); }
  }, [nav, onClose, setRole]);

  // Global keyboard handlers when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(flat.length - 1, c + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
      else if (e.key === "Enter") { e.preventDefault(); runItem(flat[cursor]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flat, cursor, runItem, onClose]);

  if (!open) return null;

  const active = flat[cursor];

  return (
    <div
      data-testid="command-palette"
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh] ancr-fade"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative flex w-full max-w-[880px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0C]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ height: "min(72vh, 680px)" }}
      >
        {/* soft cyan/blue brand glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(56,182,255,0.35) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="pointer-events-none absolute -left-32 -bottom-32 h-80 w-80 rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(147,51,234,0.24) 0%, transparent 70%)", filter: "blur(70px)" }} />

        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          <Search size={16} className="text-ancr-dim" />
          <input
            ref={inputRef}
            data-testid="command-palette-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything across the ANCR ecosystem…"
            className="flex-1 bg-transparent font-sans text-[15px] outline-none placeholder:text-ancr-mute"
          />
          <div className="hidden md:flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ancr-mute">
            <kbd className="rounded border border-white/10 px-1.5 py-0.5">esc</kbd> close
          </div>
        </div>

        {/* Two columns: results + preview */}
        <div className="relative flex flex-1 min-h-0">
          {/* Results */}
          <div ref={listRef} className="flex-1 overflow-y-auto py-2">
            {grouped.length === 0 && (
              <div className="p-10 text-center">
                <div className="ancr-label mb-2">No matches</div>
                <div className="font-serif text-2xl italic text-ancr-dim">Try a different search.</div>
              </div>
            )}
            {grouped.map((g, gi) => {
              const meta = GROUPS[g.key];
              const Icon = meta.icon;
              // compute cursor offset for this group
              let baseIdx = 0;
              for (let i = 0; i < gi; i++) baseIdx += grouped[i].items.length;
              return (
                <div key={g.key} className="mb-1">
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <Icon size={11} className={meta.accent ? "text-[var(--ancra-accent)]" : "text-ancr-mute"} />
                    <div className={`ancr-label ${meta.accent ? "text-[var(--ancra-accent)]" : ""}`}>{meta.label}</div>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                    <div className="font-mono text-[10px] text-ancr-mute">{g.items.length}</div>
                  </div>
                  {g.items.map((it, idx) => {
                    const globalIdx = baseIdx + idx;
                    const activeRow = globalIdx === cursor;
                    const IconRow = it.iconOverride || meta.icon;
                    return (
                      <button
                        key={it.id}
                        data-cursor={globalIdx}
                        data-testid={`palette-item-${it.group}-${idx}`}
                        onMouseEnter={() => setCursor(globalIdx)}
                        onClick={() => runItem(it)}
                        className={`group flex w-full items-center gap-3 px-4 py-2 text-left transition ${
                          activeRow ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        {it.avatar ? (
                          <img src={it.avatar} alt="" className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10" />
                        ) : it.cover ? (
                          <img src={it.cover} alt="" className="h-6 w-6 rounded object-cover" />
                        ) : (
                          <div className={`rounded-md border ${activeRow ? "border-white/25" : "border-white/[0.08]"} p-1`}>
                            <IconRow size={12} className={meta.accent ? "text-[var(--ancra-accent)]" : "text-ancr-dim"} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-[13.5px]">{it.title}</div>
                          {it.subtitle && <div className="mt-0.5 truncate font-mono text-[10px] text-ancr-mute">{it.subtitle}</div>}
                        </div>
                        <ChevronRight size={13} className={activeRow ? "text-white" : "text-ancr-mute opacity-0 group-hover:opacity-100"} />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Preview panel */}
          <aside className="hidden md:flex w-[300px] flex-col border-l border-white/[0.06] bg-black/40">
            {active ? (
              <div className="flex-1 p-6">
                <div className="ancr-label">{GROUPS[active.group]?.label}</div>
                <div className="mt-2 font-serif text-2xl leading-tight">{active.title}</div>
                {active.subtitle && <div className="mt-2 font-mono text-[11px] text-ancr-dim">{active.subtitle}</div>}

                {active.prompt && (
                  <div className="mt-6 rounded-xl border border-[var(--ancra-accent)]/25 bg-[var(--ancra-accent)]/[0.06] p-4">
                    <div className="flex items-center gap-2 mb-2"><Sparkles size={12} className="text-[var(--ancra-accent)]" /><div className="ancr-label">AIAH prompt</div></div>
                    <div className="text-[13px] leading-relaxed text-ancr-dim">"{active.prompt}"</div>
                  </div>
                )}
                {active.to && (
                  <div className="mt-6 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">
                    Route · <span className="text-ancr-dim">{active.to}</span>
                  </div>
                )}
                {active.action && (
                  <div className="mt-6 font-mono text-[10px] text-ancr-mute uppercase tracking-widest">
                    Action · <span className="text-ancr-dim">{active.action}</span>
                  </div>
                )}

                <div className="mt-8 space-y-2">
                  <div className="ancr-label">Quick actions</div>
                  <button className="ancr-btn ancr-btn-primary w-full justify-center text-[10px] py-2">Open · ↵</button>
                  <button className="ancr-btn ancr-btn-ghost w-full justify-center text-[10px] py-2">Ask AIAH about this</button>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/50 px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-ancr-mute">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1.5 py-0.5">↑</kbd><kbd className="rounded border border-white/10 px-1.5 py-0.5">↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1.5 py-0.5">↵</kbd> open</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-white/10 px-1.5 py-0.5">esc</kbd> close</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={10} className="text-[var(--ancra-accent)]" />
            Powered by AIAH™
          </div>
        </div>
      </div>
    </div>
  );
}
