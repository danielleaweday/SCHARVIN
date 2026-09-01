import React from "react";
import ModuleShell from "@/components/shell/ModuleShell";
import EcosystemLauncher from "@/components/ecosystem/EcosystemLauncher";
import { Section, Chip } from "@/components/common/Primitives";
import { QrCode, Fingerprint, Shield, Globe, Award } from "lucide-react";

export default function ANCRIDModule() {
  return (
    <ModuleShell current="ANCRID">
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 md:px-10 py-14">
        <div className="ancr-label mb-3" style={{ color: "#10B981" }}>ANCRID™ · Creator Identity</div>
        <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight max-w-3xl">
          <em className="italic text-ancr-dim">One identity.</em><br />Every ecosystem module.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ancr-dim">
          ANCRID is the verified professional identity every creator carries across the ANCR ecosystem — signed portfolio, verified skills, Creator Mobility™, and a ready-to-send Professional Booking Packet™.
        </p>
      </section>

      <div className="px-6 md:px-10 py-10 space-y-12">
        <EcosystemLauncher current="ANCRID" />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Passport card */}
          <div className="lg:col-span-5">
            <div className="ancr-card ancr-scan relative overflow-hidden">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />
              <div className="p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="ancr-label">ANCRID™</div>
                    <div className="mt-1 font-mono text-[10px] text-ancr-mute">Creator Passport · Series 07</div>
                  </div>
                  <Fingerprint size={20} className="text-[#10B981]" />
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10" />
                  <div>
                    <div className="font-serif text-3xl leading-none">Maya Ellis</div>
                    <div className="mt-1 font-mono text-[11px] text-ancr-dim">@mayaellis · Songwriting & Production</div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <PP label="Portfolio" value="87" />
                  <PP label="Skills" value="24" />
                  <PP label="Mobility" value="US · EU · UK" small />
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
                  <div className="rounded-lg border border-white/10 p-2"><QrCode size={40} /></div>
                  <div className="text-right">
                    <div className="ancr-label mb-1">Issued</div>
                    <div className="font-mono text-[11px]">Aug 2024</div>
                    <div className="mt-2 ancr-label mb-0.5">Signed</div>
                    <div className="font-serif italic text-[13px]">Terrence Bloom</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verifications + Booking Packet */}
          <div className="lg:col-span-7 space-y-5">
            <div className="ancr-card p-6">
              <div className="flex items-center gap-2 mb-4"><Shield size={13} className="text-[#10B981]" /><div className="ancr-label" style={{ color: "#10B981" }}>Verifications</div></div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: "Identity verified", v: "ID + biometric" },
                  { k: "Skills verified", v: "24 · faculty signed" },
                  { k: "Portfolio signed", v: "12 pieces · industry" },
                  { k: "Copyright cleared", v: "13 works · INHEIRA" },
                  { k: "Financial ready", v: "Vaulta enrolled" },
                  { k: "Mobility active", v: "US · EU · UK" },
                ].map((v) => (
                  <div key={v.k} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="ancr-label">{v.k}</div>
                    <div className="mt-2 font-mono text-[12px]">{v.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ancr-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="ancr-label">Professional Booking Packet™</div>
                  <div className="mt-1 font-serif text-2xl">v2 · ready to send</div>
                </div>
                <button className="ancr-btn ancr-btn-primary">Send Packet</button>
              </div>
              <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-ancr-dim">
                Auto-assembles from ANCRWAV™ releases, INHEIRA™ credits, ANCRLAB™ reels, COHEIR™ signatures, and industry endorsements. One click to share with venues, publishers, or labels.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip>3 signed tracks</Chip>
                <Chip>2 press mentions</Chip>
                <Chip>6 endorsements</Chip>
                <Chip tone="success">Tax + rights verified</Chip>
              </div>
            </div>

            <div className="ancr-card p-6">
              <div className="flex items-center gap-2 mb-3"><Globe size={13} className="text-[#10B981]" /><div className="ancr-label" style={{ color: "#10B981" }}>Creator Mobility™</div></div>
              <p className="text-[13.5px] leading-relaxed text-ancr-dim">
                Every creator in ANCR travels with pre-cleared professional standing. Your ANCRID™ opens doors to studios, venues, and industry partners in the US, EU, and UK — with more regions coming online quarterly.
              </p>
            </div>
          </div>
        </section>
      </div>
    </ModuleShell>
  );
}

function PP({ label, value, small }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="ancr-label">{label}</div>
      <div className={`mt-2 font-mono ${small ? "text-xs" : "text-2xl"} tracking-tight`}>{value}</div>
    </div>
  );
}
