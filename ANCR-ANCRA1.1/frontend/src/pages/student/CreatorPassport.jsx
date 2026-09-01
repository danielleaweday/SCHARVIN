import React from "react";
import { Link } from "react-router-dom";
import { Section, Chip } from "@/components/common/Primitives";
import { QrCode, Fingerprint, ArrowUpRight } from "lucide-react";

export default function CreatorPassport() {
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="ANCRID™ · Creator Passport"
        title={<span><em className="italic text-ancr-dim">Your</em> verified creative identity</span>}
        sub="A single professional identity that travels across every ANCR module — signed portfolio, verified skills, Creator Mobility™, and a ready-to-send Booking Packet™."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Passport card */}
        <div className="lg:col-span-5">
          <div className="ancr-card ancr-scan relative overflow-hidden">
            <div className="ancr-halo ancr-halo-accent -right-24 -top-24 h-64 w-64" />
            <div className="p-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="ancr-label">ANCRID™</div>
                  <div className="mt-1 font-mono text-[10px] text-ancr-mute">Creator Passport · Series 07</div>
                </div>
                <Fingerprint size={20} className="text-[var(--ancra-accent)]" />
              </div>

              <div className="mt-8 flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10" />
                <div>
                  <div className="font-serif text-3xl leading-none">Maya Ellis</div>
                  <div className="mt-1 font-mono text-[11px] text-ancr-dim">@mayaellis · Songwriting & Production</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <PassportStat label="Portfolio" value="87" />
                <PassportStat label="Skills" value="24" />
                <PassportStat label="Mobility" value="US · EU · UK" small />
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

        {/* Booking Packet */}
        <div className="lg:col-span-7 space-y-5">
          <div className="ancr-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="ancr-label">Professional Booking Packet™</div>
                <div className="mt-1 font-serif text-2xl">Ready to send · v2</div>
              </div>
              <button className="ancr-btn ancr-btn-primary">Send Packet</button>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-ancr-dim max-w-2xl">
              Your booking packet auto-assembles from ANCRWAV™ releases, INHEIRA™ credits, ANCRLAB™ project reels, COHEIR™ reviewer signatures, and industry endorsements. One click to share with venues, publishers, or labels.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip>3 signed tracks</Chip>
              <Chip>2 press mentions</Chip>
              <Chip>6 endorsements</Chip>
              <Chip tone="success">Tax + rights verified</Chip>
            </div>
          </div>

          <Link
            to="/hub/ANCRID"
            data-testid="passport-open-ancrid"
            className="group flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition hover:border-white/25 hover:bg-white/[0.04]"
          >
            <div>
              <div className="ancr-label mb-1">Full ANCRID™</div>
              <div className="font-serif text-xl">Manage identity, mobility, and skills</div>
            </div>
            <ArrowUpRight size={18} className="text-ancr-dim group-hover:text-white transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PassportStat({ label, value, small }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="ancr-label">{label}</div>
      <div className={`mt-2 font-mono ${small ? "text-xs" : "text-2xl"} tracking-tight`}>{value}</div>
    </div>
  );
}
