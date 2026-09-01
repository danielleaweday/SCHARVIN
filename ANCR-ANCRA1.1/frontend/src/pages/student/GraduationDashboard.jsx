import React from "react";
import { Section, Chip, ProgressRing, StatCell } from "@/components/common/Primitives";
import { CheckCircle2, Circle, ExternalLink, Sparkles } from "lucide-react";

const REQUIREMENTS = [
  { id: "r1", label: "30 Song Progress™ · minimum 20 mastered", value: "13/20", pct: 65, done: false },
  { id: "r2", label: "Portfolio Panel · Mid-term signed", value: "Passed", pct: 100, done: true },
  { id: "r3", label: "Capstone™ · 2 developed", value: "1/2", pct: 50, done: false },
  { id: "r4", label: "Industry Sessions · 6 attended", value: "8/6", pct: 100, done: true },
  { id: "r5", label: "COHEIR™ Mentor Reviews · 4", value: "3/4", pct: 75, done: false },
  { id: "r6", label: "ANCRID™ Booking Packet™ finalised", value: "v2 ready", pct: 100, done: true },
  { id: "r7", label: "Vaulta™ Financial Literacy passed", value: "72/100", pct: 72, done: false },
  { id: "r8", label: "ANCRLaunch™ Career readiness > 80%", value: "74%", pct: 74, done: false },
];

const EMPLOYER_VIEWS = [
  { org: "Sony Publishing", when: "8h ago", role: "A&R Coordinator" },
  { org: "Interscope", when: "2d ago", role: "Junior Producer" },
  { org: "Kobalt", when: "5d ago", role: "Publishing Associate" },
];

export default function GraduationDashboard() {
  const overall = 74;
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="ANCRLaunch™ · Graduation Dashboard"
        title={<span><em className="italic text-ancr-dim">You are</em> {overall}% ready</span>}
        sub="A live view of every requirement between now and graduation. Every input updates in real time from ANCRA, INHEIRA, COHEIR, Vaulta, and ANCRLaunch."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 ancr-card p-6 flex flex-col items-center">
          <ProgressRing value={overall} size={220} label="Graduation" sub="Spring 2027 target" />
          <div className="mt-6 flex items-center gap-2">
            <Chip tone="accent">On track</Chip>
            <Chip>+4% this week</Chip>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-3">
          {REQUIREMENTS.map((r) => (
            <div key={r.id} className="ancr-card flex items-center gap-5 p-4">
              {r.done ? <CheckCircle2 size={18} className="text-emerald-300 flex-shrink-0" /> : <Circle size={18} className="text-ancr-dim flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px]">{r.label}</div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className={`h-full ${r.done ? "bg-emerald-400" : "bg-white"}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
              <div className="font-mono text-[12px] w-24 text-right">{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Employer views + AI */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 ancr-card overflow-hidden">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <div className="ancr-label">Employer views · ANCRID™</div>
            <div className="mt-1 font-serif text-2xl">12 in the last 30 days</div>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {EMPLOYER_VIEWS.map((e) => (
              <div key={e.org} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <div className="font-serif text-[15px]">{e.org}</div>
                  <div className="font-mono text-[11px] text-ancr-mute">{e.role} · viewed {e.when}</div>
                </div>
                <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3">Send Packet <ExternalLink size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="ancr-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={13} className="text-[var(--ancra-accent)]" />
              <div className="ancr-label">AIAH™ next best move</div>
            </div>
            <p className="font-serif text-lg leading-snug text-ancr-dim">
              Master 4 more songs by June to hit the 20-mastered gate. Two — Meridian and Petrichor — are one mixdown pass away.
            </p>
            <button className="ancr-btn ancr-btn-primary mt-4 text-[10px] py-1.5 px-3">Schedule ANCRLAB™ session</button>
          </div>

          <div className="ancr-card p-6">
            <div className="ancr-label mb-3">Career readiness inputs</div>
            <div className="grid grid-cols-2 gap-3">
              <StatCell label="Portfolio" value="87" />
              <StatCell label="Sessions" value="8" />
              <StatCell label="Reviews" value="24" />
              <StatCell label="Financial" value="72" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
