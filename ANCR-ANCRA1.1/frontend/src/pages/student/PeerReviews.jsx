import React from "react";
import { Section, Chip } from "@/components/common/Primitives";
import { MessageSquare, ThumbsUp, ThumbsDown, Play } from "lucide-react";

const PEER_REVIEWS = [
  { id: "pr1", from: "Ava Reyes", track: "The Understudy", kind: "Song · demo", when: "12m", stars: 4, note: "Second verse loses melodic tension — try inverting the interval on 'gone'.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: "pr2", from: "Noah King", track: "Halogen · v2", kind: "Mix", when: "1h", stars: 5, note: "Sub-bass sits perfectly. Kick could breathe more at 60Hz.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop" },
  { id: "pr3", from: "Lena Park", track: "Kite String · lyric", kind: "Lyric", when: "3h", stars: 5, note: "Chorus 3 line — the 'motorway' image reappears exactly. Consider a variation.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
];

const ASSIGNED = [
  { id: "a1", from: "Dre Walker", track: "Terminal · demo", due: "Today · 18:00",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: "a2", from: "Ava Reyes", track: "Every Small Rebellion", due: "Thu",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
];

export default function PeerReviews() {
  const [tab, setTab] = React.useState("received");
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Peer Reviews"
        title={<span><em className="italic text-ancr-dim">Move</em> together, faster</span>}
        sub="Structured, timestamped feedback across the cohort. Every review is signed to ANCRID™ and counts toward your peer contribution score."
      />
      <div className="mt-8 inline-flex rounded-full border border-white/[0.08] bg-white/[0.02] p-1 font-mono text-[10px] uppercase tracking-widest">
        {["received", "to_review", "given"].map((t) => (
          <button key={t} data-testid={`peer-tab-${t}`} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full transition ${tab === t ? "bg-white text-black" : "text-ancr-dim hover:text-white"}`}>
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {tab === "received" && (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PEER_REVIEWS.map((r) => (
            <article key={r.id} className="ancr-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={r.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
                  <div>
                    <div className="font-serif text-[15px]">{r.from}</div>
                    <div className="font-mono text-[10px] text-ancr-mute">{r.when}</div>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-ancr-dim">{"★".repeat(r.stars)}<span className="text-ancr-mute">{"★".repeat(5 - r.stars)}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Chip tone="accent">{r.track}</Chip>
                <Chip>{r.kind}</Chip>
              </div>
              <p className="mt-4 font-serif text-lg leading-snug text-ancr-dim">"{r.note}"</p>
              <div className="mt-4 flex items-center gap-2">
                <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><Play size={11} /> Listen</button>
                <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><MessageSquare size={11} /> Reply</button>
                <div className="flex-1" />
                <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><ThumbsUp size={11} /></button>
                <button className="ancr-btn ancr-btn-ghost text-[10px] py-1.5 px-3"><ThumbsDown size={11} /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "to_review" && (
        <div className="mt-8 space-y-3">
          {ASSIGNED.map((a) => (
            <div key={a.id} className="ancr-card flex items-center gap-4 p-5">
              <img src={a.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10" />
              <div className="flex-1">
                <div className="font-serif text-[15px]">{a.from}</div>
                <div className="font-mono text-[11px] text-ancr-mute">{a.track}</div>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--ancra-accent)]">Due {a.due}</div>
              <button data-testid={`open-review-${a.id}`} className="ancr-btn ancr-btn-primary text-[10px] py-1.5 px-3">Review</button>
            </div>
          ))}
        </div>
      )}

      {tab === "given" && (
        <div className="mt-8 font-mono text-[12px] text-ancr-mute">You've completed 24 reviews this semester · 4.7★ average signal.</div>
      )}
    </div>
  );
}
