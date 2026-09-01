import { useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/Nav';
import ModuleLink from '@/components/ModuleLink';
import { CANONICAL_CAST, COLLABORATOR_PALETTE } from '@/lib/collaboratorColors';
import { MapPin, Users, Music2, Mic, Piano, Clock, ArrowRight, Flame, Sparkles } from 'lucide-react';

const ROOMS = [
    { id: 'rm_atl_01', name: 'ATL · Fall Camp Room A', city: 'Atlanta',   country: 'USA',     img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80', participants: ['ancr_marcus','ancr_chris','ancr_jimmie'],           status: 'Live · REC 01:14', wip: 'Skyline (Verse 2 rewrite)', activity: 'Bass arrangement · piano voicings',   mood: 'Late night' },
    { id: 'rm_nsh_01', name: 'Nashville · Room 3',      city: 'Nashville', country: 'USA',    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80', participants: ['ancr_danielle','ancr_chris'],                     status: 'Idle · 2h ago',   wip: 'Held Together (chorus)',  activity: 'Guitar overdub queued',             mood: 'Reflective' },
    { id: 'rm_lon_01', name: 'London · Kensington Studio', city: 'London', country: 'UK',    img: 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80', participants: ['ancr_sarah','ancr_marcus'],                       status: 'Live · REC 00:22', wip: 'Untitled (rough take)',   activity: 'Tracking vocals · keys arrangement', mood: 'Cinematic' },
    { id: 'rm_lag_01', name: 'Lagos · Camp Suite 1',    city: 'Lagos',     country: 'Nigeria', img: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80', participants: ['ancr_jimmie','ancr_sarah','ancr_danielle'],       status: 'Live · REC 00:47', wip: 'Afterglow (bridge)',       activity: 'MPC · vocal chops',                 mood: 'High energy' },
    { id: 'rm_tok_01', name: 'Tokyo · Room 707',        city: 'Tokyo',     country: 'Japan',   img: 'https://images.unsplash.com/photo-1519508234439-4f23643125c1?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80', participants: ['ancr_chris','ancr_danielle'],                     status: 'Idle · yesterday', wip: 'City Lights (revisit)',    activity: 'Reharmonization draft',              mood: 'Ambient' },
    { id: 'rm_kgn_01', name: 'Kingston · Beach House',  city: 'Kingston',  country: 'Jamaica', img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80', participants: ['ancr_marcus','ancr_jimmie'],                      status: 'Idle · 3d ago',    wip: 'Salt (arrangement)',       activity: 'Rhythm section demo',                mood: 'Warm' },
];

const nameByAncr = Object.fromEntries(CANONICAL_CAST.map(c => [c.ancr_id, c]));

export default function WritingRooms() {
    const [filter, setFilter] = useState('all');
    const rooms = filter === 'live' ? ROOMS.filter(r => r.status.startsWith('Live')) : ROOMS;
    const liveCount = ROOMS.filter(r => r.status.startsWith('Live')).length;

    return (
        <div className="min-h-screen bg-black text-white">
            <Nav />

            {/* HERO */}
            <section className="relative border-b border-zinc-900 overflow-hidden bg-black">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full opacity-30"
                         style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.14), transparent 65%)' }} />
                </div>
                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4">/ WRITING ROOMS · WORLDWIDE</div>
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.95] text-white max-w-3xl">
                            The rooms<br />
                            <span className="bg-gradient-to-r from-sky-200 via-indigo-100 to-violet-200 bg-clip-text text-transparent">where songs are made.</span>
                        </h1>
                        <div className="flex items-center gap-6 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                            <div><span className="text-white font-display font-bold text-2xl block leading-none">{ROOMS.length}</span> Active rooms</div>
                            <div><span className="text-emerald-400 font-display font-bold text-2xl block leading-none">{liveCount}</span> Live now</div>
                            <div><span className="text-white font-display font-bold text-2xl block leading-none">6</span> Cities</div>
                        </div>
                    </div>
                    <div className="mt-10 flex items-center gap-3">
                        <button onClick={() => setFilter('all')} data-testid="wr-filter-all" className={`h-9 px-4 rounded-full border font-mono-metadata text-[10px] uppercase tracking-[0.3em] transition-colors ${filter==='all' ? 'border-white bg-white text-black' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>All rooms</button>
                        <button onClick={() => setFilter('live')} data-testid="wr-filter-live" className={`h-9 px-4 rounded-full border font-mono-metadata text-[10px] uppercase tracking-[0.3em] transition-colors flex items-center gap-2 ${filter==='live' ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live now
                        </button>
                    </div>
                </div>
            </section>

            {/* ROOM GRID */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {rooms.map((r) => <RoomCard key={r.id} room={r} />)}
                    </div>
                </div>
            </section>

            {/* CANONICAL CAST — identity color legend */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-6">/ COLLABORATORS · IDENTITY COLORS</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {CANONICAL_CAST.map(c => {
                            const p = COLLABORATOR_PALETTE[c.color];
                            return (
                                <ModuleLink key={c.ancr_id} module="ancrid" subpath={`/${c.ancr_id}`} className="border border-zinc-900 p-5 hover:border-zinc-700 transition-colors group">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-black font-display font-bold text-sm" style={{ background: p.hex, boxShadow: `0 0 22px ${p.glow}` }}>{c.initials}</div>
                                        <div className="min-w-0">
                                            <div className="text-white text-sm truncate">{c.name}</div>
                                            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500 truncate">{c.role}</div>
                                        </div>
                                    </div>
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em]" style={{ color: p.hex }}>Identity · {p.name}</div>
                                </ModuleLink>
                            );
                        })}
                    </div>
                    <p className="mt-8 max-w-2xl text-sm text-zinc-500 leading-relaxed">
                        Every collaborator carries a consistent identity color across the platform &mdash; cursors, comments, contributions, Creative Evidence™, timeline events, session activity, and version history. A creator recognizes who contributed what without needing to read a name.
                    </p>
                </div>
            </section>
        </div>
    );
}

function RoomCard({ room }) {
    const live = room.status.startsWith('Live');
    return (
        <div className="group relative border border-zinc-900 bg-zinc-950 hover:border-zinc-700 transition-colors overflow-hidden">
            <div className="relative aspect-[16/10] overflow-hidden">
                <img src={room.img} alt={room.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute top-3 left-3 font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" strokeWidth={1.5} />
                    {room.city} · {room.country}
                </div>
                <div className={`absolute top-3 right-3 flex items-center gap-1.5 font-mono-metadata text-[10px] uppercase tracking-[0.3em] ${live ? 'text-emerald-300' : 'text-zinc-400'}`}>
                    {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {room.status}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="font-display font-bold text-xl text-white leading-tight">{room.name}</div>
                </div>
            </div>
            <div className="p-5">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500 mb-1">Currently working on</div>
                <div className="text-white text-sm mb-4">{room.wip}</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" strokeWidth={1.5} />
                    <span>{room.activity}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {room.participants.map(pid => {
                            const c = nameByAncr[pid];
                            if (!c) return null;
                            const p = COLLABORATOR_PALETTE[c.color];
                            return (
                                <div key={pid} title={c.name} className="w-7 h-7 rounded-full border-2 border-zinc-950 flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: p.hex, boxShadow: `0 0 14px ${p.glow}` }}>{c.initials}</div>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1 font-mono-metadata text-[9px] uppercase tracking-[0.3em] text-zinc-500">
                        <Flame className="w-3 h-3" strokeWidth={1.5} />
                        {room.mood}
                    </div>
                </div>
                <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-mono-metadata uppercase tracking-[0.25em] text-zinc-500">
                        <span className="inline-flex items-center gap-1"><Piano className="w-3 h-3" strokeWidth={1.5} /> Keys</span>
                        <span className="inline-flex items-center gap-1"><Mic className="w-3 h-3" strokeWidth={1.5} /> Vocal</span>
                        <span className="inline-flex items-center gap-1"><Music2 className="w-3 h-3" strokeWidth={1.5} /> MPC</span>
                    </div>
                    <button className="text-xs font-mono-metadata uppercase tracking-[0.3em] text-white flex items-center gap-1 hover:text-indigo-300 transition-colors">
                        Enter room <ArrowRight className="w-3 h-3" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
}
