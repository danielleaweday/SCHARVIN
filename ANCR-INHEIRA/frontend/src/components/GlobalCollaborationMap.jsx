import { GLOBE } from '@/constants/testIds';
import { MapPin } from 'lucide-react';

// Approximate normalized coords in a 100x50 grid (equirectangular-ish)
const CITY_MAP = {
    'chicago': { x: 26, y: 20, label: 'Chicago' },
    'nashville': { x: 28, y: 23, label: 'Nashville' },
    'los angeles': { x: 18, y: 22, label: 'Los Angeles' },
    'la': { x: 18, y: 22, label: 'Los Angeles' },
    'new york': { x: 30, y: 21, label: 'New York' },
    'nyc': { x: 30, y: 21, label: 'New York' },
    'london': { x: 49, y: 17, label: 'London' },
    'paris': { x: 50, y: 18, label: 'Paris' },
    'berlin': { x: 52, y: 17, label: 'Berlin' },
    'accra': { x: 50, y: 30, label: 'Accra' },
    'lagos': { x: 51, y: 32, label: 'Lagos' },
    'kingston': { x: 27, y: 27, label: 'Kingston' },
    'tokyo': { x: 87, y: 22, label: 'Tokyo' },
    'seoul': { x: 85, y: 22, label: 'Seoul' },
    'sydney': { x: 89, y: 41, label: 'Sydney' },
    'mumbai': { x: 71, y: 27, label: 'Mumbai' },
    'sao paulo': { x: 37, y: 37, label: 'São Paulo' },
    'mexico': { x: 22, y: 26, label: 'Mexico City' },
    'toronto': { x: 27, y: 19, label: 'Toronto' },
    'atlanta': { x: 27, y: 24, label: 'Atlanta' },
};

const DEFAULT_CITIES = ['chicago', 'nashville', 'los angeles', 'london', 'accra', 'lagos', 'kingston', 'tokyo'];

function normalize(city) {
    if (!city) return null;
    const k = city.toLowerCase().trim().split(',')[0];
    return CITY_MAP[k] || null;
}

export default function GlobalCollaborationMap({ collaborators = [] }) {
    // Derive points: use collaborator country/location if we have it, else pick from default rotating list
    const points = collaborators.map((c, i) => {
        const loc = normalize(c.country) || normalize(c.location);
        const fallback = CITY_MAP[DEFAULT_CITIES[i % DEFAULT_CITIES.length]];
        return { ...(loc || fallback), color: c.color || '#8B5CF6', name: c.name || 'Collaborator' };
    });

    return (
        <div data-testid={GLOBE.root} className="border border-zinc-900 bg-zinc-950 p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Global Collaboration</div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">Songs are built worldwide.</h2>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    {points.length} nodes
                </div>
            </div>

            <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-blue-950/20 via-zinc-950 to-zinc-950 border border-zinc-900 overflow-hidden">
                {/* World grid */}
                <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#27272A" strokeWidth="0.15" />
                        </pattern>
                        <radialGradient id="glow">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <rect width="100" height="50" fill="url(#grid)" />

                    {/* Latitude lines (equator etc) */}
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#3F3F46" strokeWidth="0.15" strokeDasharray="0.5 0.5" />

                    {/* Connecting lines */}
                    {points.map((p, i) =>
                        points.slice(i + 1).map((q, j) => (
                            <line
                                key={`${i}-${j}`}
                                x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                                stroke={p.color}
                                strokeWidth="0.15"
                                strokeOpacity="0.4"
                                strokeDasharray="1 0.8"
                            >
                                <animate attributeName="stroke-dashoffset" from="0" to="12" dur="8s" repeatCount="indefinite" />
                            </line>
                        ))
                    )}

                    {/* Nodes */}
                    {points.map((p, i) => (
                        <g key={i} data-testid={GLOBE.node}>
                            <circle cx={p.x} cy={p.y} r="2.5" fill="url(#glow)" />
                            <circle cx={p.x} cy={p.y} r="0.8" fill={p.color}>
                                <animate attributeName="r" values="0.8;1.2;0.8" dur="2.5s" repeatCount="indefinite" />
                            </circle>
                        </g>
                    ))}
                </svg>

                {/* City labels overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {points.map((p, i) => (
                        <div
                            key={i}
                            className="absolute font-mono-metadata text-[9px] uppercase tracking-[0.25em]"
                            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(8px, -50%)', color: p.color }}
                        >
                            {p.label} · {p.name.split(' ')[0]}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid md:grid-cols-4 gap-3">
                {points.slice(0, 8).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-zinc-900">
                        <MapPin className="w-3.5 h-3.5" style={{ color: p.color }} strokeWidth={1.5} />
                        <div>
                            <div className="text-sm text-white">{p.name}</div>
                            <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500">{p.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
