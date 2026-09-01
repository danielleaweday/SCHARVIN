import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LANDING } from '@/constants/testIds';
import Nav from '@/components/Nav';
import { InheiraMark, AncrMark } from '@/components/BrandLogos';
import {
    ArrowRight, Fingerprint, Users, FileSignature, Coins, Shield, Sparkles,
    Circle, Check, Play, Mic, Music2, MessageSquare, Send, Piano, Type,
    ShieldCheck, Award, BarChart3, Radio, Globe, MapPin, Building2,
    TrendingUp, Rocket, Layers,
} from 'lucide-react';

// Editorial imagery — dark, cinematic, documentary-style (Unsplash editorial pool).
// TODO for team: replace with commissioned photography before public launch.
const IMG_STUDIO_CONSOLE = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=srgb&fm=jpg&w=1600&q=80';
const IMG_PIANO_SESSION = 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80';
const IMG_LYRIC_WRITING = 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80';
const IMG_VOCAL_BOOTH = 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80';
const IMG_GUITAR_LATE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80';
const IMG_MPC_HANDS = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80';
const IMG_LEGACY_PORTRAIT = 'https://images.unsplash.com/photo-1499415479124-43c32433a620?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80';
const IMG_MENTORSHIP = 'https://images.unsplash.com/photo-1519508234439-4f23643125c1?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80';

const CAMPS = [
    { city: 'Chicago', country: 'USA', img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Atlanta', country: 'USA', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Nashville', country: 'USA', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Los Angeles', country: 'USA', img: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'London', country: 'UK', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Accra', country: 'Ghana', img: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Lagos', country: 'Nigeria', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Kingston', country: 'Jamaica', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
    { city: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1533050487297-09b450131914?crop=entropy&cs=srgb&fm=jpg&w=900&q=80' },
];

const COLLABORATORS = [
    { name: 'Danielle',  role: 'Topline / Lyrics',   color: '#F472B6', pct: 50, initials: 'D' },
    { name: 'Cam',        role: 'Co-write / Melody',   color: '#818CF8', pct: 40, initials: 'C' },
    { name: 'Jimmie',     role: 'Production',          color: '#38BDF8', pct: 10, initials: 'J' },
];

const users = [
    'Songwriters', 'Producers', 'Artists', 'Composers', 'Engineers', 'Publishers',
    'Managers', 'Attorneys', 'Labels', 'Universities', 'Studios', 'Writing Camps',
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50">
            <Nav />

            {/* HERO — celestial, near-empty, belief-first */}
            <section data-testid={LANDING.hero} className="relative overflow-hidden border-b border-zinc-900 bg-black">
                {/* celestial atmospherics — softer, cooler palette (indigo/sky/lavender, low saturation) */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    {/* single ambient wash */}
                    <div className="absolute top-[-40%] left-1/2 -translate-x-1/2 w-[1600px] h-[1600px] rounded-full opacity-50"
                         style={{ background: 'radial-gradient(circle at center, rgba(129,140,248,0.10) 0%, rgba(56,189,248,0.06) 35%, transparent 65%)' }} />
                    {/* the single intentional star — the "creative spark" */}
                    <div className="absolute top-[22%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white opacity-90"
                         style={{ boxShadow: '0 0 24px 6px rgba(224,231,255,0.65), 0 0 48px 14px rgba(129,140,248,0.35), 0 0 96px 32px rgba(56,189,248,0.18)' }} />
                    {/* whisper-thin arc, softened */}
                    <div className="absolute top-[24%] left-0 right-0 h-px opacity-40"
                         style={{ background: 'linear-gradient(90deg, transparent 15%, rgba(191,219,254,0.35) 40%, rgba(224,231,255,0.55) 50%, rgba(196,181,253,0.35) 60%, transparent 85%)' }} />
                    {/* extremely sparse starfield */}
                    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(1px 1px at 22% 32%, white 50%, transparent), radial-gradient(1px 1px at 78% 58%, white 50%, transparent), radial-gradient(1px 1px at 38% 74%, white 50%, transparent)', backgroundSize: '720px 720px' }} />
                </div>

                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-40 md:pt-56 pb-40 md:pb-64 text-center">
                    {/* Small, restrained brand descriptor */}
                    <div className="font-mono-metadata text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-slate-400 mb-24 md:mb-32">
                        The Operating System for Creative Ownership &amp; Legacy
                    </div>

                    {/* Headline — emotional entry point, first */}
                    <h1 className="font-display font-black text-5xl md:text-7xl lg:text-[7.5rem] tracking-tighter leading-[0.95] text-white max-w-5xl mx-auto">
                        Where Creativity<br />
                        <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">Becomes Legacy.</span>
                    </h1>

                    {/* Logo — supporting brand mark, below the message */}
                    <div className="mt-20 md:mt-24 flex justify-center">
                        <InheiraMark
                            className="h-32 md:h-44 lg:h-48 w-auto"
                        />
                    </div>

                    {/* One supporting sentence */}
                    <p className="mt-20 md:mt-24 max-w-2xl mx-auto text-base md:text-lg leading-relaxed text-zinc-400">
                        Every idea. Every collaborator. Every contribution.<br className="hidden md:block" />
                        Documented from creation to ownership, publishing, release, and legacy.
                    </p>

                    <div className="mt-16 md:mt-20 flex flex-wrap items-center gap-4 justify-center">
                        <Link to="/auth?mode=register">
                            <Button data-testid={LANDING.ctaPrimary} size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-10 h-12 rounded-md shadow-[0_0_60px_rgba(129,140,248,0.18)]">
                                Begin Creating
                                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                            </Button>
                        </Link>
                        <a href="#story">
                            <Button data-testid={LANDING.ctaSecondary} variant="outline" size="lg" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white px-8 h-12 rounded-md">
                                Read the belief
                            </Button>
                        </a>
                    </div>

                    <div className="mt-32 md:mt-40 font-mono-metadata text-[10px] uppercase tracking-[0.5em] text-zinc-600">
                        Powered by ANCR™
                    </div>
                </div>
            </section>

            {/* MANIFESTO — the belief, distilled to a single unforgettable line */}
            <section id="story" className="border-b border-zinc-900 relative overflow-hidden bg-black">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-25"
                         style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.15), transparent 70%)' }} />
                </div>
                <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-32 md:py-56 text-center">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.5em] text-slate-500 mb-14">
                        · A BELIEF ·
                    </div>
                    <p className="font-display font-black text-3xl md:text-5xl lg:text-6xl tracking-tighter leading-[1.1] text-white">
                        Technology should never replace the artist.<br />
                        <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">It should remove every obstacle between the artist and their work.</span>
                    </p>
                    <div className="mt-16 font-mono-metadata text-[10px] uppercase tracking-[0.5em] text-zinc-600">
                        From Creation to Legacy. · Powered by ANCR™
                    </div>
                </div>
            </section>

            {/* MARQUEE */}
            <section className="border-b border-zinc-900 py-8 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap font-mono-metadata text-xs uppercase tracking-[0.4em] text-zinc-700">
                    {[...users, ...users].map((u, i) => (
                        <span key={i} className="mx-8">— {u}</span>
                    ))}
                </div>
            </section>

            {/* SECTION 2 — Studio Workspace mockup */}
            <StudioMockupSection />

            {/* SECTION 3 — Cinematic full-width photo: The Creative Moment */}
            <CinematicMoment />

            {/* SECTION 4 — Songwriting Camps horizontal scroll */}
            <SongwritingCampsSection />

            {/* SECTION 5 — Studio Sessions cinematic strip */}
            <StudioSessionsStrip />

            {/* SECTION 6 — Creative Evidence™ mockup */}
            <CreativeEvidenceSection />

            {/* SECTION 7 — Creator Passport™ mockup */}
            <CreatorPassportSection />

            {/* SECTION 8 — Intelligence Layer mockup */}
            <IntelligenceSection />

            {/* SECTION 9 — Publishing Command Center mockup */}
            <PublishingSection />

            {/* SECTION 9.5 — LIFE OF A SONG timeline (Chapter IX) */}
            <LifeOfASongSection />

            {/* SECTION 10 — Legacy cinematic close */}
            <LegacySection />


            {/* POWERED BY ANCR — prominent ecosystem section */}
            <section className="border-b border-zinc-900 relative overflow-hidden bg-gradient-to-b from-zinc-950 via-blue-950/10 to-zinc-950">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
                    <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
                        <div className="md:col-span-5">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-6">
                                / A FLAGSHIP OF THE ANCR ECOSYSTEM
                            </div>
                            <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1.05] text-white mb-8">
                                Powered by <span className="text-blue-400">ANCR</span>.
                            </h2>
                            <p className="text-zinc-400 leading-relaxed mb-8 text-lg">
                                INHEIRA™ lives inside the Artist Discovery &amp; Development Network — the connective tissue between creation, ownership, publishing, royalty distribution, and legacy across the modern creative industry.
                            </p>
                            <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono-metadata text-sm uppercase tracking-[0.25em]">
                                <span className="text-blue-400">Discover.</span>
                                <span className="text-blue-400">Develop.</span>
                                <span className="text-blue-400">Deploy.</span>
                            </div>
                        </div>
                        <div className="md:col-span-6 md:col-start-7">
                            <div className="relative p-8 md:p-12 border border-blue-500/20 bg-zinc-950 overflow-hidden">
                                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.15), transparent 60%)' }} />
                                <div className="relative flex items-center justify-center">
                                    <AncrMark className="h-40 md:h-56 w-auto" />
                                </div>
                                <div className="relative mt-6 pt-6 border-t border-blue-500/10 text-center font-mono-metadata text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-400">
                                    Artist Discovery &amp; Development Network
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 border-t border-zinc-900">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="grid md:grid-cols-12 gap-10 items-start mb-12">
                        <div className="md:col-span-6">
                            <InheiraMark className="h-20 md:h-24 w-auto mb-6 -ml-1" />
                            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
                                The operating system for creative ownership and legacy. From Creation to Legacy.
                            </p>
                        </div>
                        <div className="md:col-span-5 md:col-start-8">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-4">Powered by</div>
                            <AncrMark className="h-16 md:h-20 w-auto" />
                            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mt-4 font-mono-metadata uppercase tracking-[0.2em]">
                                Artist Discovery &amp; Development Network
                            </p>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                        <div>INHEIRA™ · A flagship of the ANCR ecosystem</div>
                        <div>© {new Date().getFullYear()} · From Creation to Legacy.</div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


/* -------------------------------------------------------------------------- */
/* SECTION 2 — STUDIO WORKSPACE MOCKUP                                        */
/* -------------------------------------------------------------------------- */
function StudioMockupSection() {
    return (
        <section className="border-b border-zinc-900 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.10), transparent 65%)' }} />
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
                <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
                    <div className="md:col-span-4">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER I · WHERE DO IDEAS BEGIN?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">THE STUDIO</div>
                        <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tighter leading-[1.05] text-white mb-8">
                            Every great creation begins differently.
                        </h2>
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Every contribution deserves to be remembered. Inside the studio, INHEIRA captures every lyric, melody, revision, voice memo and decision — color-coded to the creator who made it.
                        </p>
                    </div>
                    <div className="md:col-span-8">
                        <StudioMockupCard />
                    </div>
                </div>
            </div>
        </section>
    );
}

function StudioMockupCard() {
    return (
        <div className="relative border border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_-30px_rgba(129,140,248,0.35)]">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
                <div className="flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Session · REC 00:47:22
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600">
                    SESSION / SES_A1B24C
                </div>
            </div>
            <div className="grid grid-cols-12">
                <aside className="col-span-12 sm:col-span-3 border-r border-zinc-900 p-5">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Collaborators</div>
                    <div className="space-y-3">
                        {COLLABORATORS.map((c) => (
                            <div key={c.name} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-black font-display font-bold text-sm" style={{ background: c.color, boxShadow: `0 0 20px ${c.color}55` }}>{c.initials}</div>
                                <div className="min-w-0">
                                    <div className="text-white text-sm truncate">{c.name}</div>
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-500 truncate">{c.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Splits · Composition</div>
                    <SplitDonut />
                </aside>
                <div className="col-span-12 sm:col-span-6 border-r border-zinc-900 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Verse 1 · Draft v3</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-600">Auto-saved · 3s ago</div>
                    </div>
                    <div className="space-y-2 text-sm text-white leading-relaxed">
                        <LyricLine text="Held the pen like it was mine to keep" color="#F472B6" author="D" />
                        <LyricLine text="Wrote the truth before the world could speak" color="#F472B6" author="D" />
                        <LyricLine text="Every line a promise, every promise real" color="#818CF8" author="C" />
                        <LyricLine text="Not the story I was told to feel" color="#F472B6" author="D" />
                        <LyricLine text="From the silence, something new" color="#818CF8" author="C" />
                    </div>
                    <div className="mt-6 border-t border-zinc-900 pt-4 space-y-3">
                        <div className="flex items-center gap-3 text-xs">
                            <Mic className="w-3.5 h-3.5 text-sky-400" strokeWidth={1.5} />
                            <span className="text-zinc-400">Voice memo · 00:24</span>
                            <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-400/60" style={{ width: '38%' }} />
                            </div>
                            <span className="font-mono-metadata text-[10px] text-zinc-600">JIMMIE</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                            <span className="text-zinc-300 italic truncate">&ldquo;What if we drop the pre-chorus and let the bridge breathe?&rdquo;</span>
                            <span className="font-mono-metadata text-[10px] text-zinc-600">CAM · NOW</span>
                        </div>
                    </div>
                </div>
                <aside className="col-span-12 sm:col-span-3 p-5">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Session Timeline</div>
                    <div className="space-y-3 text-xs">
                        <TimelineEvent color="#F472B6" label="Lyric line added" who="Danielle" time="Now" />
                        <TimelineEvent color="#818CF8" label="Melody phrase" who="Cam" time="0:32 ago" />
                        <TimelineEvent color="#38BDF8" label="Voice memo" who="Jimmie" time="1:14 ago" />
                        <TimelineEvent color="#F472B6" label="Section renamed" who="Danielle" time="3:02 ago" />
                        <TimelineEvent color="#818CF8" label="Chord change" who="Cam" time="4:41 ago" />
                    </div>
                    <div className="mt-8 border-t border-zinc-900 pt-5">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Progress</div>
                        <div className="space-y-2 text-[11px] text-zinc-400">
                            <ProgressRow label="Lyrics" pct={72} />
                            <ProgressRow label="Melody" pct={58} />
                            <ProgressRow label="Production" pct={34} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
function LyricLine({ text, color, author }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-1.5 w-0.5 h-4 rounded-full" style={{ background: color }} />
            <div className="flex-1">{text}</div>
            <span className="font-mono-metadata text-[10px] uppercase tracking-[0.2em]" style={{ color }}>{author}</span>
        </div>
    );
}
function TimelineEvent({ color, label, who, time }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            <div className="flex-1 min-w-0">
                <div className="text-white truncate">{label}</div>
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.15em] text-zinc-500">{who} · {time}</div>
            </div>
        </div>
    );
}
function ProgressRow({ label, pct }) {
    return (
        <div>
            <div className="flex justify-between font-mono-metadata text-[9px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                <span>{label}</span><span>{pct}%</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-400 to-sky-300" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
function SplitDonut() {
    let offset = 0;
    const r = 34, cx = 44, cy = 44;
    const C = 2 * Math.PI * r;
    return (
        <div className="flex items-center gap-3">
            <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#18181b" strokeWidth="10" />
                {COLLABORATORS.map((c) => {
                    const dash = (c.pct / 100) * C;
                    const el = <circle key={c.name} cx={cx} cy={cy} r={r} fill="none" stroke={c.color} strokeWidth="10" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} transform={`rotate(-90 ${cx} ${cy})`} />;
                    offset += dash;
                    return el;
                })}
                <text x="44" y="49" textAnchor="middle" className="fill-white font-display font-bold" fontSize="14">100%</text>
            </svg>
            <div className="space-y-1 text-[10px] font-mono-metadata uppercase tracking-[0.15em]">
                {COLLABORATORS.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-zinc-400">
                        <span className="w-1.5 h-1.5" style={{ background: c.color }} />
                        <span>{c.name}</span><span className="text-zinc-600">{c.pct}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* SECTION 3 — CINEMATIC FULL-WIDTH */
function CinematicMoment() {
    return (
        <section className="border-b border-zinc-900 relative h-[80vh] min-h-[600px] overflow-hidden">
            <img src={IMG_PIANO_SESSION} alt="creators around a piano" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="relative h-full flex items-end">
                <div className="max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-16 md:pb-24">
                    <div className="max-w-3xl">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-white/60 mb-3">CHAPTER II · THE MOMENT</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-white/40 mb-6">WHEN IDEAS COME ALIVE</div>
                        <h2 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] text-white">
                            Where ideas<br />become records.
                        </h2>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* SECTION 4 — SONGWRITING CAMPS */
function SongwritingCampsSection() {
    return (
        <section className="border-b border-zinc-900 bg-black relative">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-24 md:pt-36 pb-8">
                <div className="grid md:grid-cols-12 gap-8 mb-12 md:mb-16">
                    <div className="md:col-span-7">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER III · WHO CREATES WITH ME?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">WRITING CAMPS · WORLDWIDE</div>
                        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1.05] text-white">
                            Creativity happens everywhere.
                        </h2>
                    </div>
                    <div className="md:col-span-4 md:col-start-9 flex items-end">
                        <p className="text-zinc-400 leading-relaxed">
                            From Nashville to Lagos to Tokyo — every writing camp, every session, every contribution documented inside one permanent creative record.
                        </p>
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-6 snap-x snap-mandatory">
                    {CAMPS.map((c) => (
                        <div key={c.city} className="snap-start flex-shrink-0 w-[280px] md:w-[360px] group relative aspect-[3/4] overflow-hidden border border-zinc-900 hover:border-zinc-700 transition-all">
                            <img src={c.img} alt={c.city} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-2">
                                    <MapPin className="w-3 h-3 inline mr-1" strokeWidth={1.5} />{c.country}
                                </div>
                                <div className="font-display font-bold text-3xl md:text-4xl text-white tracking-tight">{c.city}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-24 md:pb-32 text-center">
                <div className="font-mono-metadata text-xs uppercase tracking-[0.5em] text-slate-400">Built inside INHEIRA.</div>
            </div>
        </section>
    );
}

/* SECTION 5 — STUDIO SESSIONS strip */
function StudioSessionsStrip() {
    const shots = [
        { src: IMG_STUDIO_CONSOLE, label: 'PRODUCER · CONSOLE' },
        { src: IMG_VOCAL_BOOTH,    label: 'VOCAL · TRACKING' },
        { src: IMG_MPC_HANDS,      label: 'BEAT · MPC' },
        { src: IMG_GUITAR_LATE,    label: 'GUITAR · LATE NIGHT' },
    ];
    return (
        <section className="border-b border-zinc-900 bg-black">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
                <div className="grid md:grid-cols-12 gap-8 mb-14">
                    <div className="md:col-span-6">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER IV · HOW DOES A SONG BECOME ITSELF?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">SESSIONS</div>
                        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1.05] text-white">
                            From the first idea to the final mix.
                        </h2>
                    </div>
                    <div className="md:col-span-5 md:col-start-8 flex items-end">
                        <p className="text-zinc-400 leading-relaxed">
                            Writing. Producing. Engineering. Editing. Every stage of the record is documented — inside the same session, inside the same permanent history.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {shots.map((s) => (
                        <div key={s.label} className="relative aspect-[3/4] overflow-hidden border border-zinc-900 group">
                            <img src={s.src} alt={s.label} className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 font-mono-metadata text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-slate-300">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* SECTION 6 — CREATIVE EVIDENCE™ */
function CreativeEvidenceSection() {
    const lyricLines = [
        { text: 'I remember every word you wrote to me', who: 'D', color: '#F472B6' },
        { text: 'Every promise, every melody', who: 'D', color: '#F472B6' },
        { text: "Late night, city lights, we're free", who: 'C', color: '#818CF8' },
        { text: "This one's ours, this one's forever", who: 'D', color: '#F472B6' },
        { text: 'Built from silence, held together', who: 'C', color: '#818CF8' },
        { text: 'Sample flip, the beat, the pocket', who: 'J', color: '#38BDF8' },
    ];
    return (
        <section className="border-b border-zinc-900 bg-black relative overflow-hidden">
            <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.12), transparent 65%)' }} />
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
                <div className="grid md:grid-cols-12 gap-10 items-start mb-12">
                    <div className="md:col-span-6">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER V · HOW DO WE PROTECT IT?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">CREATIVE EVIDENCE™</div>
                        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1.05] text-white mb-6">
                            Every contribution becomes evidence.
                        </h2>
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            Every lyric. Every melody. Every revision. Color-coded to the creator who made it. Never a question of who did what.
                        </p>
                    </div>
                    <div className="md:col-span-5 md:col-start-8">
                        <div className="border border-zinc-800 bg-zinc-950 p-6">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-4">Ownership · Lyrics</div>
                            <div className="space-y-3">
                                {COLLABORATORS.map((c) => (
                                    <div key={c.name} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: c.color }}>{c.initials}</div>
                                        <div className="flex-1 text-white">{c.name}</div>
                                        <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                            <div className="h-full" style={{ width: `${c.pct}%`, background: c.color }} />
                                        </div>
                                        <div className="w-10 text-right font-mono-metadata text-xs" style={{ color: c.color }}>{c.pct}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border border-zinc-800 bg-zinc-950">
                    <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Verse 1 · Draft v4 · Locked</div>
                        <div className="flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                            <ShieldCheck className="w-3 h-3" strokeWidth={2} />Immutable
                        </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-2 text-white leading-relaxed">
                        {lyricLines.map((l, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <span className="mt-2 w-1 h-4 rounded-full" style={{ background: l.color }} />
                                <div className="flex-1 text-base md:text-lg" style={{ background: `linear-gradient(90deg, ${l.color}18, transparent 60%)`, padding: '2px 6px' }}>{l.text}</div>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-black font-display font-bold text-[10px] opacity-80" style={{ background: l.color }}>{l.who}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* SECTION 7 — CREATOR PASSPORT™ */
function CreatorPassportSection() {
    const discography = [
        { title: 'Held Together', role: 'Topline / Lyrics', year: '2025', splits: '50%' },
        { title: 'City Lights',    role: 'Co-Writer',        year: '2024', splits: '35%' },
        { title: 'The Promise',    role: 'Lyricist',         year: '2024', splits: '60%' },
        { title: 'Silence',        role: 'Topline',          year: '2023', splits: '45%' },
    ];
    return (
        <section className="border-b border-zinc-900 bg-black">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
                <div className="grid md:grid-cols-12 gap-10 items-start">
                    <div className="md:col-span-4">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER VI · WHO ARE YOU, AS A CREATOR?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">CREATOR PASSPORT™</div>
                        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-[1.05] text-white mb-8">
                            One permanent identity across every session.
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Discography. Publishing. Verified credentials. Every writer, producer, engineer and artist carries the same profile — for their entire career.
                        </p>
                    </div>
                    <div className="md:col-span-8">
                        <div className="border border-zinc-800 bg-zinc-950">
                            <div className="relative h-40 md:h-56 border-b border-zinc-900 overflow-hidden">
                                <img src={IMG_LYRIC_WRITING} alt="" className="w-full h-full object-cover opacity-40" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950" />
                            </div>
                            <div className="p-6 md:p-8 -mt-16 md:-mt-24 relative">
                                <div className="flex items-end gap-5">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-zinc-950 flex items-center justify-center text-black font-display font-black text-4xl" style={{ background: '#F472B6', boxShadow: '0 0 30px rgba(244,114,182,0.35)' }}>D</div>
                                    <div className="pb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="font-display font-bold text-3xl text-white">Danielle Stephens</div>
                                            <ShieldCheck className="w-5 h-5 text-emerald-400" strokeWidth={2} />
                                        </div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Songwriter · Topliner · Lyrics · ASCAP · IPI 00782341552</div>
                                    </div>
                                </div>
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <PassportStat label="Songs" value="47" />
                                    <PassportStat label="Collaborators" value="128" />
                                    <PassportStat label="Publishing" value="Songtrust" />
                                    <PassportStat label="Verified" value="Since 2023" />
                                </div>
                                <div className="mt-8">
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Recent discography</div>
                                    <div className="border border-zinc-900 divide-y divide-zinc-900">
                                        {discography.map((d) => (
                                            <div key={d.title} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-zinc-900/40 transition-colors">
                                                <div>
                                                    <div className="text-white">{d.title}</div>
                                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-zinc-500">{d.role} · {d.year}</div>
                                                </div>
                                                <div className="font-mono-metadata text-xs text-pink-400">{d.splits}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
function PassportStat({ label, value }) {
    return (
        <div className="border border-zinc-900 p-4">
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className="font-display font-bold text-lg text-white">{value}</div>
        </div>
    );
}

/* SECTION 8 — INTELLIGENCE */
function IntelligenceSection() {
    return (
        <section className="border-b border-zinc-900 bg-black relative overflow-hidden">
            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.10), transparent 65%)' }} />
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
                <div className="grid md:grid-cols-12 gap-10 items-center">
                    <div className="md:col-span-8 md:order-1 order-2">
                        <div className="border border-zinc-800 bg-zinc-950">
                            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-3">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-sky-400 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" strokeWidth={2} />INHEIRA INTELLIGENCE™
                                </div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">SONG_A1B24C · REPORT v3</div>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-zinc-900 border-b border-zinc-900">
                                <ScoreCell label="Commercial" value="87" hint="Strong pop appeal" />
                                <ScoreCell label="Release Ready" value="72" hint="Publishing pending" />
                                <ScoreCell label="Sync Potential" value="64" hint="Film / TV eligible" />
                            </div>
                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <IntelStat icon={Radio}       label="Priority DSP"    value="Spotify Editorial" />
                                <IntelStat icon={Globe}       label="Top Audience"    value="US · UK · CA" />
                                <IntelStat icon={TrendingUp}  label="10Y Forecast"    value="$142k" />
                                <IntelStat icon={Award}       label="Publishing"      value="ASCAP · Songtrust" />
                            </div>
                            <div className="border-t border-zinc-900 p-6">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Executive summary</div>
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    Strong lyrical hook. Vocal top-line built for streaming and playlist placement. Sync-eligible for coming-of-age drama and independent film supervisors. Recommend release after publishing and mechanical registration complete.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 md:order-2 order-1">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER VII · HOW DO WE UNDERSTAND IT?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">SONG INTELLIGENCE™</div>
                        <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-[1.05] text-white mb-6">
                            Commercial intelligence, from the first session.
                        </h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Streaming potential. Audience. Sync opportunities. Publishing readiness. 10-year revenue forecast. The Song Intelligence Report™ becomes A&amp;R-ready the moment a session finalizes.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
function ScoreCell({ label, value, hint }) {
    return (
        <div className="p-6">
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">{label}</div>
            <div className="font-display font-black text-5xl md:text-6xl text-white tracking-tighter">{value}</div>
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.2em] text-sky-400 mt-2">{hint}</div>
        </div>
    );
}
function IntelStat({ icon: Icon, label, value }) {
    return (
        <div className="border border-zinc-900 p-4">
            <Icon className="w-4 h-4 text-indigo-300 mb-3" strokeWidth={1.5} />
            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">{label}</div>
            <div className="text-white text-sm">{value}</div>
        </div>
    );
}

/* SECTION 9 — PUBLISHING */
function PublishingSection() {
    const items = [
        { label: 'ISRC',       status: 'ready',   value: 'USRC17607839' },
        { label: 'UPC',        status: 'ready',   value: '0000123456789' },
        { label: 'ISWC',       status: 'ready',   value: 'T-070.235.813-5' },
        { label: 'IPI',        status: 'ready',   value: '00782341552' },
        { label: 'Publisher',  status: 'ready',   value: 'Songtrust' },
        { label: 'PRO',        status: 'ready',   value: 'ASCAP' },
        { label: 'Mechanical', status: 'pending', value: 'MLC · queued' },
        { label: 'Copyright',  status: 'ready',   value: 'PA Form drafted' },
        { label: 'Metadata',   status: 'ready',   value: 'DDEX ERN-4' },
        { label: 'Artwork',    status: 'ready',   value: '3000×3000 · PNG' },
        { label: 'DSPs',       status: 'pending', value: '10 destinations' },
        { label: 'Marketing',  status: 'draft',   value: 'Campaign v1' },
    ];
    return (
        <section className="border-b border-zinc-900 bg-black">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-36">
                <div className="grid md:grid-cols-12 gap-10 items-start">
                    <div className="md:col-span-5">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER VIII · HOW DO WE RELEASE IT?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-6">PUBLISHING</div>
                        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tighter leading-[1.05] text-white mb-6">
                            Everything a song needs to be released.
                        </h2>
                        <p className="text-zinc-400 leading-relaxed text-lg">
                            ISRC. UPC. ISWC. Metadata. Artwork. DSPs. PRO registration. Marketing. All in one pre-release command center.
                        </p>
                    </div>
                    <div className="md:col-span-6 md:col-start-7">
                        <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Release Readiness</div>
                                <div className="flex items-center gap-2 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-emerald-400">
                                    <Circle className="w-2 h-2 fill-emerald-400 stroke-emerald-400" />83% Ready
                                </div>
                            </div>
                            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-8">
                                <div className="h-full bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400" style={{ width: '83%' }} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {items.map((it) => <PublishingCell key={it.label} {...it} />)}
                            </div>
                            <button className="mt-8 w-full h-11 border border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-mono-metadata text-[11px] uppercase tracking-[0.3em] hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2">
                                <Rocket className="w-3.5 h-3.5" strokeWidth={2} />Publish when ready
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
function PublishingCell({ label, value, status }) {
    const color = status === 'ready' ? '#10B981' : status === 'pending' ? '#818CF8' : '#71717A';
    return (
        <div className="border border-zinc-900 px-3 py-3 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <div className="min-w-0 flex-1">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500">{label}</div>
                <div className="text-white text-xs truncate">{value}</div>
            </div>
        </div>
    );
}

/* SECTION 10 — LEGACY */
/* SECTION 9.5 — LIFE OF A SONG */
const SONG_LIFE = [
    { time: '11:42 PM',       place: 'Chicago · Bedroom',        title: 'A voice memo.',              body: 'Danielle hums a melody into her phone. 47 seconds. Nothing yet — and everything.', icon: Mic,          side: 'left'  },
    { time: 'The next morning', place: 'Zoom · Nashville / LA',    title: 'Lyrics.',                    body: 'Cam pulls up the memo. Writes the first verse in a shared session. Every line time-stamped.', icon: Type,       side: 'right' },
    { time: 'Three days later', place: 'Studio · Atlanta',         title: 'A room full of creators.',   body: 'Jimmie loops a beat. Vocals go down. Every contribution color-coded. Nothing lost.', icon: Music2,        side: 'left'  },
    { time: 'Week two',        place: 'The mix room',              title: 'Mix. Master.',               body: 'Engineer commits the final. Session locked. Version 4. Immutable.', icon: Layers,     side: 'right' },
    { time: 'Before release',   place: 'INHEIRA Intelligence™',    title: 'Understood.',                 body: 'Commercial 87. Sync-eligible. Playlist-ready. Priority audience: US, UK, CA.', icon: Sparkles,   side: 'left'  },
    { time: 'Release day',      place: '10 DSPs · Worldwide',      title: 'Published.',                 body: 'ISRC. UPC. ISWC. IPI. Publishing filed. PROs registered. Metadata delivered.', icon: Rocket,     side: 'right' },
    { time: 'Month one',        place: 'Spotify Editorial',         title: 'Playlisted.',                 body: 'Added to New Music Friday. 2 million streams in the first week.', icon: Radio,      side: 'left'  },
    { time: 'Year one',         place: 'Global',                    title: '100 million streams.',         body: 'The song lives on radios, in cars, in headphones, in memory.', icon: TrendingUp, side: 'right' },
    { time: 'Two years later',  place: 'The Grammys',               title: 'Song of the Year.',           body: 'Danielle, Cam, and Jimmie share the stage. The credits are exact. The receipts are perfect.', icon: Award,      side: 'left'  },
    { time: 'Forever',          place: 'INHEIRA Vaulta™',           title: 'Legacy.',                    body: 'Royalties keep flowing. The song outlives the room it was born in.', icon: ShieldCheck,side: 'right' },
];

function LifeOfASongSection() {
    return (
        <section className="border-b border-zinc-900 bg-black relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-25"
                     style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.14), transparent 65%)' }} />
            </div>
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-40">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">CHAPTER IX · WHAT IS THE LIFE OF A SONG?</div>
                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-indigo-300/60 mb-8">FROM VOICE MEMO TO LEGACY</div>
                    <h2 className="font-display font-black text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[1.02] text-white mb-6">
                        One song.<br />
                        <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">Every step. Preserved.</span>
                    </h2>
                    <p className="text-zinc-400 leading-relaxed max-w-xl mx-auto">
                        Not a feature list. The life of a real record — from the first hum into a phone at 11:42 PM to the moment it outlives the room it was born in.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical spine */}
                    <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px"
                         style={{ background: 'linear-gradient(180deg, transparent, rgba(129,140,248,0.5), rgba(56,189,248,0.5), rgba(196,181,253,0.5), transparent)' }} />

                    <div className="space-y-16 md:space-y-24">
                        {SONG_LIFE.map((s, i) => (
                            <SongLifeStep key={i} step={s} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function SongLifeStep({ step, index }) {
    const Icon = step.icon;
    const isRight = step.side === 'right';
    return (
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
            {/* Node dot on spine */}
            <div className="absolute left-4 md:left-1/2 top-4 md:top-6 -translate-x-1/2 z-10">
                <div className="w-3 h-3 rounded-full border-2 border-black" style={{ background: '#818CF8', boxShadow: '0 0 20px rgba(129,140,248,0.7)' }} />
            </div>

            {/* Card — alternates left/right */}
            <div className={`pl-12 md:pl-0 ${isRight ? 'md:col-start-2 md:pl-16' : 'md:col-start-1 md:pr-16 md:text-right'}`}>
                <div className={`flex items-center gap-3 mb-4 ${isRight ? '' : 'md:justify-end'}`}>
                    <span className="font-mono-metadata text-[9px] uppercase tracking-[0.35em] text-indigo-300/70">
                        STEP {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">{step.time}</span>
                </div>
                <div className={`flex items-center gap-3 mb-3 ${isRight ? '' : 'md:justify-end'}`}>
                    <div className="w-8 h-8 rounded-full border border-indigo-400/40 bg-indigo-400/5 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-indigo-200" strokeWidth={1.5} />
                    </div>
                    <div className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">{step.title}</div>
                </div>
                <div className={`font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ${isRight ? '' : 'md:justify-end md:flex'}`}>
                    <MapPin className="w-3 h-3 inline mr-1.5" strokeWidth={1.5} />
                    {step.place}
                </div>
                <p className="text-zinc-300 leading-relaxed max-w-md md:inline-block">
                    {step.body}
                </p>
            </div>
        </div>
    );
}


function LegacySection() {
    return (
        <section className="border-b border-zinc-900 relative min-h-[90vh] overflow-hidden bg-black">
            <img src={IMG_LEGACY_PORTRAIT} alt="creators across generations" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
            <div className="relative h-full min-h-[90vh] flex flex-col justify-end">
                <div className="max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-20 md:pb-32">
                    <div className="max-w-4xl">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-white/60 mb-4">CHAPTER X · HOW DOES IT OUTLIVE US?</div>
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.5em] text-white/40 mb-8">LEGACY</div>
                        <h2 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] text-white">
                            What you create today<br />
                            <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">should still matter tomorrow.</span>
                        </h2>
                        <p className="mt-10 max-w-2xl text-lg text-zinc-300 leading-relaxed">
                            Songwriter. Producer. Engineer. Artist. Label. Publisher. Attorney. Every generation of the creative industry — connected by one permanent record.
                        </p>
                        <div className="mt-14 flex flex-wrap items-center gap-4">
                            <Link to="/auth?mode=register">
                                <Button size="lg" className="bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-10 h-12 rounded-md shadow-[0_0_60px_rgba(129,140,248,0.20)]">
                                    Begin Creating
                                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                                </Button>
                            </Link>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.5em] text-slate-400 ml-2">Powered by ANCR™</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
