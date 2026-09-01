import * as Icons from "lucide-react";

/* Distinct, on-brand code-built interface mockups for every ecosystem platform.
   Abstract/representative UI — no real screenshots, never blank. */

const KIND = {
  ancr: "os", ancra: "learn", ancrlab: "studio", ancrsync: "collab",
  ancrlaunch: "career", ancrid: "identity", passport: "passport", coheir: "network",
  vaulta: "finance", adca: "learn", ancrd: "feed", ancrwav: "music",
  ancrview: "video", inheira: "rights", ancrmedia: "mediahub", cynaiah: "film",
  viearta: "wellness", sovreign: "market",
};

const alpha = (hex, a) => `${hex}${a}`;

const Bar = ({ w = "100%", h = 7, c }) => (
  <div className="rounded-full" style={{ width: w, height: h, background: c || "rgba(255,255,255,0.12)" }} />
);
const Tile = ({ className = "", style, children }) => (
  <div className={`rounded-lg border border-white/10 bg-white/[0.04] ${className}`} style={style}>{children}</div>
);
const Ring = ({ pct = 66, c, size = 40 }) => {
  const r = size / 2 - 4, C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
};
const Wave = ({ c, bars = 22 }) => (
  <div className="flex h-10 items-center gap-[3px]">
    {Array.from({ length: bars }).map((_, i) => (
      <span key={i} className="w-[3px] rounded-full" style={{ height: `${20 + Math.abs(Math.sin(i * 1.3)) * 70}%`, background: i % 4 === 0 ? c : "rgba(255,255,255,0.22)" }} />
    ))}
  </div>
);
const Avatar = ({ c }) => <span className="h-6 w-6 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${c}, rgba(255,255,255,0.15))` }} />;

const Body = ({ kind, accent }) => {
  const I = Icons;
  switch (kind) {
    case "os":
      return (
        <div className="grid h-full grid-rows-[auto_1fr] gap-2.5">
          <div className="grid grid-cols-4 gap-2">
            {["Users", "Active", "Modules", "Uptime"].map((s, i) => (
              <Tile key={s} className="p-2">
                <div className="text-[8px] uppercase tracking-wide text-ccdp-cream/45">{s}</div>
                <div className="mt-1 font-display text-sm font-bold text-white">{["12.4k", "3.1k", "18", "99.9%"][i]}</div>
              </Tile>
            ))}
          </div>
          <Tile className="grid grid-cols-4 place-items-center gap-2 p-3">
            {[I.GraduationCap, I.Music2, I.Users, I.Wallet, I.BadgeCheck, I.PlayCircle, I.Rocket, I.Shield].map((Ic, i) => (
              <span key={i} className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: alpha(accent, "22") }}><Ic className="h-4 w-4" style={{ color: accent }} /></span>
            ))}
          </Tile>
        </div>
      );
    case "learn":
      return (
        <div className="flex h-full flex-col gap-2.5">
          <Tile className="flex items-center gap-3 p-3">
            <Ring pct={72} c={accent} />
            <div className="flex-1 space-y-1.5"><Bar w="70%" /><Bar w="45%" c={alpha(accent, "88")} /></div>
            <span className="rounded-md px-2 py-1 text-[8px] font-bold" style={{ background: alpha(accent, "22"), color: accent }}>72%</span>
          </Tile>
          <div className="grid flex-1 grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Tile key={i} className="flex flex-col justify-between p-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: alpha(accent, "22") }}><I.BookOpen className="h-3.5 w-3.5" style={{ color: accent }} /></span>
                <div className="space-y-1"><Bar w="80%" h={5} /><Bar w="55%" h={5} /></div>
              </Tile>
            ))}
          </div>
        </div>
      );
    case "studio":
      return (
        <div className="flex h-full flex-col gap-2">
          {["Vocals", "Beat", "Keys"].map((t, i) => (
            <Tile key={t} className="flex items-center gap-2 p-2">
              <span className="w-10 text-[8px] font-semibold text-ccdp-cream/55">{t}</span>
              <div className="flex-1"><Wave c={[accent, "#e0349e", "#f59e0b"][i]} bars={26} /></div>
            </Tile>
          ))}
          <div className="mt-auto flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] py-2">
            <I.SkipBack className="h-3.5 w-3.5 text-ccdp-cream/60" />
            <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: accent }}><I.Play className="h-3.5 w-3.5 text-white" /></span>
            <I.SkipForward className="h-3.5 w-3.5 text-ccdp-cream/60" />
            <span className="ml-3"><I.Circle className="h-3 w-3" style={{ color: "#ef4444", fill: "#ef4444" }} /></span>
          </div>
        </div>
      );
    case "collab":
      return (
        <div className="flex h-full flex-col gap-2.5">
          <div className="flex items-center gap-2">
            {["#2e7bff", "#e0349e", "#f59e0b"].map((c) => <Avatar key={c} c={c} />)}
            <span className="ml-auto rounded-full px-2 py-0.5 text-[8px] font-semibold" style={{ background: alpha(accent, "22"), color: accent }}>Live</span>
          </div>
          <Tile className="relative flex-1 overflow-hidden p-3">
            <div className="grid grid-cols-3 gap-2">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 rounded-md" style={{ background: i % 2 ? "rgba(255,255,255,0.05)" : alpha(accent, "1a") }} />)}</div>
            <span className="absolute left-[30%] top-[40%] flex items-center gap-1"><I.MousePointer2 className="h-3.5 w-3.5" style={{ color: "#e0349e" }} /><span className="rounded px-1 text-[7px] text-white" style={{ background: "#e0349e" }}>Aria</span></span>
            <span className="absolute left-[62%] top-[62%] flex items-center gap-1"><I.MousePointer2 className="h-3.5 w-3.5" style={{ color: accent }} /><span className="rounded px-1 text-[7px] text-white" style={{ background: accent }}>Kai</span></span>
          </Tile>
        </div>
      );
    case "career":
      return (
        <div className="flex h-full flex-col gap-2.5">
          <div className="grid grid-cols-3 gap-2">
            {[["Applications", "24"], ["Interviews", "6"], ["Offers", "2"]].map(([l, v]) => (
              <Tile key={l} className="p-2"><div className="text-[8px] uppercase tracking-wide text-ccdp-cream/45">{l}</div><div className="mt-1 font-display text-sm font-bold text-white">{v}</div></Tile>
            ))}
          </div>
          {["Producer — Studio Row", "A&R Analyst — Label X", "Creative Lead — Agency"].map((r, i) => (
            <Tile key={r} className="flex items-center gap-2.5 p-2">
              <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: alpha(accent, "22") }}><I.Briefcase className="h-3.5 w-3.5" style={{ color: accent }} /></span>
              <div className="flex-1"><div className="text-[9px] font-semibold text-white">{r}</div><Bar w={["60%", "45%", "72%"][i]} h={5} c={alpha(accent, "66")} /></div>
              <I.ArrowUpRight className="h-3.5 w-3.5 text-ccdp-cream/40" />
            </Tile>
          ))}
        </div>
      );
    case "identity":
      return (
        <div className="flex h-full flex-col items-center gap-2.5 pt-1">
          <div className="relative">
            <span className="block h-14 w-14 rounded-full" style={{ background: `linear-gradient(135deg, ${accent}, #e0349e)` }} />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-[#0b0a12]" style={{ background: accent }}><I.Check className="h-2.5 w-2.5 text-white" strokeWidth={3} /></span>
          </div>
          <div className="text-center"><div className="text-[11px] font-bold text-white">Verified Creator</div><div className="text-[8px] text-ccdp-cream/45">DID · ANCR ID</div></div>
          <div className="grid w-full grid-cols-3 gap-2">
            {["Credentials", "Rights", "Wallet"].map((l) => (
              <Tile key={l} className="flex flex-col items-center gap-1 p-2"><I.ShieldCheck className="h-4 w-4" style={{ color: accent }} /><span className="text-[7px] text-ccdp-cream/55">{l}</span></Tile>
            ))}
          </div>
        </div>
      );
    case "passport":
      return (
        <div className="flex h-full gap-2.5">
          <Tile className="flex w-1/2 flex-col justify-between p-3" style={{ background: alpha(accent, "14") }}>
            <div className="flex items-center justify-between"><I.Globe2 className="h-4 w-4" style={{ color: accent }} /><span className="text-[7px] font-bold uppercase tracking-widest text-ccdp-cream/50">Passport</span></div>
            <div className="space-y-1"><Bar w="70%" /><Bar w="90%" c={alpha(accent, "88")} /><Bar w="50%" /></div>
            <div className="grid grid-cols-4 gap-1">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-[3px]" style={{ background: i % 3 ? "rgba(255,255,255,0.14)" : accent }} />)}</div>
          </Tile>
          <div className="flex w-1/2 flex-col gap-2">
            {["Visa — EU", "Residency", "Work Permit"].map((r) => (
              <Tile key={r} className="flex items-center gap-2 p-2"><span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: alpha(accent, "22") }}><I.Stamp className="h-3 w-3" style={{ color: accent }} /></span><span className="text-[8px] font-semibold text-ccdp-cream/70">{r}</span></Tile>
            ))}
          </div>
        </div>
      );
    case "network":
      return (
        <div className="flex h-full flex-col gap-2">
          {["Mentor · Grammy Producer", "Peer · Film Composer", "Mentor · Label Exec"].map((r, i) => (
            <Tile key={r} className="flex items-center gap-2.5 p-2">
              <Avatar c={["#2e7bff", "#e0349e", "#f59e0b"][i]} />
              <div className="flex-1"><div className="text-[9px] font-semibold text-white">{r.split(" · ")[0]}</div><div className="text-[7px] text-ccdp-cream/45">{r.split(" · ")[1]}</div></div>
              <span className="rounded-md px-2 py-1 text-[7px] font-bold" style={{ background: alpha(accent, "22"), color: accent }}>Connect</span>
            </Tile>
          ))}
          <Tile className="mt-auto flex items-center justify-around p-2">{["#2e7bff", "#7a3ff2", "#e0349e", "#f59e0b"].map((c) => <Avatar key={c} c={c} />)}</Tile>
        </div>
      );
    case "finance":
      return (
        <div className="flex h-full flex-col gap-2.5">
          <Tile className="p-3"><div className="text-[8px] uppercase tracking-wide text-ccdp-cream/45">Royalty Balance</div><div className="mt-0.5 font-display text-xl font-extrabold text-white">$48,210</div></Tile>
          <Tile className="flex flex-1 items-end gap-1.5 p-3">
            {[40, 62, 48, 78, 90, 66, 84].map((h, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 4 ? accent : alpha(accent, "55") }} />)}
          </Tile>
          <div className="grid grid-cols-3 gap-2">{[["Royalties", "$31k"], ["Contracts", "9"], ["Tax Set", "$7k"]].map(([l, v]) => <Tile key={l} className="p-2"><div className="text-[7px] uppercase text-ccdp-cream/45">{l}</div><div className="text-[11px] font-bold text-white">{v}</div></Tile>)}</div>
        </div>
      );
    case "rights": {
      const segs = [["#2e7bff", 40], ["#e0349e", 30], ["#f59e0b", 18], ["#7a3ff2", 12]]; let off = 0; const C = 2 * Math.PI * 26;
      return (
        <div className="flex h-full gap-3">
          <Tile className="flex w-1/2 items-center justify-center p-2">
            <svg width="90" height="90" viewBox="0 0 70 70">
              {segs.map(([c, p], i) => { const el = <circle key={i} cx="35" cy="35" r="26" fill="none" stroke={c} strokeWidth="9" strokeDasharray={`${(C * p) / 100} ${C}`} strokeDashoffset={-off} transform="rotate(-90 35 35)" />; off += (C * p) / 100; return el; })}
            </svg>
          </Tile>
          <div className="flex w-1/2 flex-col justify-center gap-2">
            {[["Writer", "40%", "#2e7bff"], ["Producer", "30%", "#e0349e"], ["Label", "18%", "#f59e0b"], ["Feature", "12%", "#7a3ff2"]].map(([l, v, c]) => (
              <div key={l} className="flex items-center gap-2 text-[9px]"><span className="h-2 w-2 rounded-full" style={{ background: c }} /><span className="text-ccdp-cream/70">{l}</span><span className="ml-auto font-bold text-white">{v}</span></div>
            ))}
          </div>
        </div>
      );
    }
    case "music":
      return (
        <div className="flex h-full flex-col gap-2.5">
          <Tile className="flex items-center gap-3 p-3" style={{ background: alpha(accent, "14") }}>
            <span className="grid h-11 w-11 place-items-center rounded-md" style={{ background: `linear-gradient(135deg, ${accent}, #e0349e)` }}><I.Music2 className="h-5 w-5 text-white" /></span>
            <div className="flex-1"><div className="text-[10px] font-bold text-white">Now Playing</div><Bar w="60%" h={5} /></div>
            <span className="grid h-7 w-7 place-items-center rounded-full" style={{ background: accent }}><I.Play className="h-3.5 w-3.5 text-white" /></span>
          </Tile>
          <Wave c={accent} bars={30} />
          <div className="flex-1 space-y-1.5">{["Midnight Sessions", "Golden Hour", "Reverie"].map((t) => <Tile key={t} className="flex items-center gap-2 p-1.5"><I.Music className="h-3 w-3" style={{ color: accent }} /><span className="text-[8px] text-ccdp-cream/70">{t}</span><I.Heart className="ml-auto h-3 w-3 text-ccdp-cream/30" /></Tile>)}</div>
        </div>
      );
    case "video":
      return (
        <div className="flex h-full flex-col gap-2">
          <Tile className="relative grid flex-1 place-items-center p-0" style={{ background: `linear-gradient(135deg, ${alpha(accent, "33")}, rgba(0,0,0,0.4))` }}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/90"><I.Play className="h-4 w-4 text-black" style={{ marginLeft: 2 }} /></span>
            <div className="absolute bottom-2 left-2 right-2"><Bar w="45%" h={4} c={accent} /></div>
          </Tile>
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="aspect-video rounded-md border border-white/10" style={{ background: `linear-gradient(135deg, ${alpha(accent, "22")}, rgba(255,255,255,0.03))` }} />)}</div>
        </div>
      );
    case "mediahub":
      return (
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-2">
          {[[I.Music2, "Audio"], [I.Video, "Video"], [I.Radio, "Live"], [I.Share2, "Distribute"]].map(([Ic, l], i) => (
            <Tile key={l} className="flex flex-col justify-between p-2.5" style={{ background: i % 2 ? "rgba(255,255,255,0.04)" : alpha(accent, "14") }}>
              <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: alpha(accent, "22") }}><Ic className="h-3.5 w-3.5" style={{ color: accent }} /></span>
              <div><div className="text-[9px] font-semibold text-white">{l}</div><Bar w="70%" h={4} /></div>
            </Tile>
          ))}
        </div>
      );
    case "film":
      return (
        <div className="flex h-full flex-col gap-2">
          <Tile className="relative grid flex-1 place-items-center" style={{ background: `linear-gradient(135deg, ${alpha(accent, "33")}, rgba(0,0,0,0.45))` }}>
            <I.Clapperboard className="h-7 w-7 text-white/80" />
            <span className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[7px] font-bold text-white" style={{ background: alpha(accent, "cc") }}>SCENE 12 · TAKE 3</span>
          </Tile>
          <div className="flex gap-1.5">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-7 flex-1 rounded-sm border border-white/10" style={{ background: i === 3 ? alpha(accent, "55") : "rgba(255,255,255,0.05)" }} />)}</div>
        </div>
      );
    case "wellness":
      return (
        <div className="flex h-full flex-col gap-2.5">
          <Tile className="flex items-center justify-around p-3">
            {[["Body", 78, "#f59e0b"], ["Mind", 64, "#7a3ff2"], ["Rest", 88, "#2e7bff"]].map(([l, p, c]) => (
              <div key={l} className="flex flex-col items-center gap-1"><Ring pct={p} c={c} size={44} /><span className="text-[7px] text-ccdp-cream/55">{l}</span></div>
            ))}
          </Tile>
          <div className="space-y-1.5">{["Focus session — 10:00", "Breathwork — 14:30", "Recovery — 20:00"].map((r) => <Tile key={r} className="flex items-center gap-2 p-2"><I.HeartPulse className="h-3 w-3" style={{ color: accent }} /><span className="text-[8px] text-ccdp-cream/70">{r}</span></Tile>)}</div>
        </div>
      );
    case "market":
      return (
        <div className="grid h-full grid-cols-2 gap-2">
          {[["Beat Pack", "$120"], ["Sample Kit", "$45"], ["Session Time", "$300"], ["License", "$80"]].map(([n, p]) => (
            <Tile key={n} className="flex flex-col justify-between p-2.5">
              <div className="mb-1 h-8 rounded-md" style={{ background: `linear-gradient(135deg, ${alpha(accent, "44")}, rgba(255,255,255,0.04))` }} />
              <div className="text-[9px] font-semibold text-white">{n}</div>
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold" style={{ color: accent }}>{p}</span><I.ShoppingBag className="h-3 w-3 text-ccdp-cream/40" /></div>
            </Tile>
          ))}
        </div>
      );
    case "feed":
    default:
      return (
        <div className="flex h-full flex-col gap-2">
          {["#2e7bff", "#e0349e", "#f59e0b"].map((c, i) => (
            <Tile key={i} className="p-2.5">
              <div className="flex items-center gap-2"><Avatar c={c} /><div className="flex-1"><Bar w="40%" h={5} /></div><span className="text-[7px] text-ccdp-cream/35">now</span></div>
              <div className="mt-2 space-y-1"><Bar w="92%" h={5} /><Bar w="70%" h={5} /></div>
              <div className="mt-2 flex gap-3"><I.Heart className="h-3 w-3 text-ccdp-cream/40" /><I.MessageCircle className="h-3 w-3 text-ccdp-cream/40" /><I.Repeat2 className="h-3 w-3 text-ccdp-cream/40" /></div>
            </Tile>
          ))}
        </div>
      );
  }
};

export const PlatformMock = ({ platform }) => {
  const accent = platform.accent || "#7a3ff2";
  const kind = KIND[platform.id] || "feed";
  const label = (platform.tagline || "").split("·")[0].trim() || platform.name;
  return (
    <div className="flex h-full w-full flex-col bg-[#0b0a12]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        </span>
        <span className="ml-2 truncate text-[10px] font-semibold tracking-wide text-ccdp-cream/70">{platform.name}</span>
        <span className="ml-auto truncate rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white" style={{ background: alpha(accent, "33") }}>{label}</span>
      </div>
      <div className="flex min-h-0 flex-1">
        {/* mini nav rail */}
        <div className="hidden w-9 flex-col items-center gap-3 border-r border-white/10 py-3 sm:flex">
          <span className="h-5 w-5 rounded-md" style={{ background: alpha(accent, "44") }} />
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 w-4 rounded-full bg-white/12" />)}
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-3">
          <Body kind={kind} accent={accent} />
        </div>
      </div>
    </div>
  );
};
