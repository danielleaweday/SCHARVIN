import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '@/components/Nav';
import { api } from '@/lib/api';
import { CATEGORIES, findService, totalServices } from '@/lib/integrationsCatalog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Check, Search, Lock, ShieldCheck, Plug, PlugZap, Clock, ArrowLeft, X, KeyRound, History, Zap, Settings as SettingsIcon } from 'lucide-react';

const SERVICE_COLOR = {
    ancrlab: '#818cf8', ancrwav: '#3B82F6', ccdp: '#10B981', vaulta: '#818cf8', anthropic: '#818cf8',
    spotify: '#1DB954', apple: '#FA243C', amazon: '#00A8E1', youtube: '#FF0000', tidal: '#000000',
    pandora: '#3668FF', deezer: '#A238FF', qobuz: '#0070D1', audiomack: '#FFA500', boomplay: '#00C853',
    ableton: '#DAFF00', logic: '#FA243C', protools: '#EE1D48', flstudio: '#F26522', cubase: '#EA5B0C',
    studioone: '#00A2FF', reason: '#B5E853', reaper: '#F17600', bandlab: '#FF3A5C', soundtrap: '#FE4A49',
    distrokid: '#00C853', tunecore: '#F26522', cdbaby: '#E71B4C', unitedmasters: '#FFD100', symphonic: '#00A651',
    toolost: '#7C4DFF', stem: '#0EA5E9', onerpm: '#FF00FF', orchard: '#F97316', awal: '#818cf8',
    ascap: '#0057B7', bmi: '#0033A0', sesac: '#FFCB05', socan: '#EF3E42', prs: '#E30613', apra: '#004E9F', sacem: '#E30613', gmr: '#818cf8',
    songtrust: '#818cf8', sentric: '#0EA5E9', kobalt: '#EF4444', downtown: '#6366f1', sonypub: '#000000', umpg: '#EAB308', wcm: '#3B82F6',
    mlc: '#818cf8', soundexchange: '#10B981', musicreports: '#818cf8', isrc_reg: '#818cf8', upc_serv: '#3B82F6', ddex: '#71717A',
    stripe: '#635BFF', paypal: '#003087', quickbooks: '#2CA01C', xero: '#13B5EA', plaid: '#111111', square: '#000000',
    slack: '#4A154B', teams: '#5059C9', zoom: '#2D8CFF', meet: '#00897B', discord: '#5865F2', whatsapp: '#25D366',
    gcal: '#4285F4', outlook: '#0078D4', apple_cal: '#FF3B30',
    openai: '#10A37F', gemini: '#4285F4', perplexity: '#22A5A5', custom: '#818cf8',
    google: '#4285F4', microsoft: '#0078D4', github: '#8B949E', linkedin: '#0A66C2', magic: '#818cf8', '2fa': '#10B981', passkeys: '#3B82F6',
    gdrive: '#4285F4', dropbox: '#0061FF', onedrive: '#0078D4', box: '#0061D5', icloud: '#3B82F6', s3: '#F97316', objstore: '#818cf8',
};

function colorFor(id) { return SERVICE_COLOR[id] || '#71717A'; }

export default function ConnectedServices() {
    const [state, setState] = useState({});
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/integrations');
                const map = {};
                for (const it of data) map[it.integration_id] = it;
                // seed defaults for first-time users
                for (const cat of CATEGORIES) {
                    for (const s of cat.services) {
                        if (!map[s.id] && s.defaultConnected) {
                            map[s.id] = { integration_id: s.id, connected: true, permissions: Object.fromEntries((s.permissions || []).map((p) => [p, true])), last_sync: new Date().toISOString() };
                        }
                    }
                }
                setState(map);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return CATEGORIES.map((cat) => {
            if (activeCategory !== 'all' && activeCategory !== cat.id) return null;
            const services = cat.services.filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
            if (services.length === 0) return null;
            return { ...cat, services };
        }).filter(Boolean);
    }, [query, activeCategory]);

    const connectedCount = Object.values(state).filter((s) => s.connected).length;

    const toggle = async (service, connected) => {
        try {
            const perms = connected ? Object.fromEntries((service.permissions || []).map((p) => [p, true])) : (state[service.id]?.permissions || {});
            const { data } = await api.patch(`/integrations/${service.id}`, { connected, permissions: perms });
            setState({ ...state, [service.id]: data });
            toast.success(`${service.name} ${connected ? 'connected' : 'disconnected'}`);
        } catch {
            toast.error('Failed to update');
        }
    };

    const togglePermission = async (serviceId, permission, value) => {
        try {
            const { data } = await api.patch(`/integrations/${serviceId}`, { permissions: { [permission]: value } });
            setState({ ...state, [serviceId]: data });
        } catch {
            toast.error('Failed to update');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            <Nav />
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
                <Link to="/profile">
                    <Button variant="ghost" className="text-zinc-500 hover:text-white mb-6 -ml-4">
                        <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={1.5} /> Back to profile
                    </Button>
                </Link>

                {/* Header */}
                <div className="grid md:grid-cols-12 gap-6 mb-12 pb-8 border-b border-zinc-900">
                    <div className="md:col-span-8">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-4 flex items-center gap-2">
                            <Plug className="w-3.5 h-3.5" strokeWidth={1.5} /> CONNECTED SERVICES
                        </div>
                        <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter text-white leading-[0.95]">Connect your entire creative stack.</h1>
                        <p className="mt-6 text-zinc-500 max-w-2xl leading-relaxed">
                            INHEIRA™ works as the creative hub, securely connecting to first-party and third-party platforms. Every connection uses a permissions-based model — you control exactly what is shared.
                        </p>
                    </div>
                    <div className="md:col-span-4 flex md:justify-end items-start">
                        <div className="p-6 border border-indigo-400/30 bg-indigo-400/5 min-w-[260px]">
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2">Connections</div>
                            <div className="font-display font-black text-5xl text-white">{connectedCount}<span className="text-zinc-500 text-2xl"> / {totalServices()}</span></div>
                            <div className="mt-1 font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">Active integrations</div>
                        </div>
                    </div>
                </div>

                {/* Search + filters */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={1.5} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search integrations…"
                            className="w-full h-11 pl-10 bg-zinc-900 border border-zinc-800 text-white focus:border-indigo-400 outline-none text-sm"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <FilterChip label="All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
                        {CATEGORIES.map((c) => (
                            <FilterChip key={c.id} label={c.title.replace(' & ', ' + ')} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} />
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-24 text-zinc-500 font-mono-metadata text-xs uppercase tracking-[0.3em]">Loading integrations…</div>
                ) : (
                    <div className="space-y-14">
                        {filtered.map((cat) => (
                            <section key={cat.id}>
                                <div className="mb-6 flex items-end justify-between">
                                    <div>
                                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2">/ {cat.title.toUpperCase()}</div>
                                        <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tighter text-white">{cat.subtitle}</h2>
                                    </div>
                                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-600">{cat.services.length} services</div>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cat.services.map((s) => {
                                        const st = state[s.id] || { connected: false, permissions: {} };
                                        return (
                                            <ServiceCard
                                                key={s.id}
                                                service={s}
                                                state={st}
                                                color={colorFor(s.id)}
                                                onToggle={(connected) => toggle(s, connected)}
                                                onManage={() => setSelectedService(s.id)}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>

            {selectedService && (
                <ManageDialog
                    service={findService(selectedService)}
                    state={state[selectedService] || { connected: false, permissions: {} }}
                    color={colorFor(selectedService)}
                    onClose={() => setSelectedService(null)}
                    onToggleConnection={(c) => toggle(findService(selectedService), c)}
                    onTogglePermission={(perm, val) => togglePermission(selectedService, perm, val)}
                />
            )}
        </div>
    );
}

function FilterChip({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 font-mono-metadata text-[10px] uppercase tracking-[0.25em] border transition-all whitespace-nowrap ${active ? 'border-indigo-400 bg-indigo-400/10 text-indigo-300' : 'border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'}`}
        >
            {label}
        </button>
    );
}

function ServiceCard({ service, state, color, onToggle, onManage }) {
    const connected = state.connected;
    const grantedCount = Object.entries(state.permissions || {}).filter(([, v]) => v).length;
    const initials = service.name.replace(/[^\w]/g, '').slice(0, 2).toUpperCase();
    return (
        <div className={`p-6 border bg-zinc-950 transition-all hover:-translate-y-0.5 relative overflow-hidden ${connected ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]' : 'border-zinc-900 hover:border-zinc-700'}`}>
            <div className="absolute top-0 left-0 h-0.5 w-full transition-opacity" style={{ background: connected ? color : 'transparent' }} />

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md flex items-center justify-center font-display font-black text-sm border" style={{ background: `${color}15`, borderColor: `${color}60`, color }}>
                        {initials}
                    </div>
                    <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                            {service.name}
                            {service.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />}
                        </div>
                        <div className={`font-mono-metadata text-[9px] uppercase tracking-[0.25em] mt-0.5 ${connected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {connected ? 'CONNECTED' : 'NOT CONNECTED'}
                        </div>
                    </div>
                </div>
                <Switch checked={connected} onCheckedChange={onToggle} />
            </div>

            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{service.description}</p>

            <div className="mb-4">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Permissions</div>
                <div className="flex flex-wrap gap-1.5">
                    {(service.permissions || []).slice(0, 4).map((p) => {
                        const granted = state.permissions?.[p];
                        return (
                            <span key={p} className={`px-2 py-1 text-[10px] font-mono-metadata border ${granted ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-zinc-800 text-zinc-500'}`}>
                                {p}
                            </span>
                        );
                    })}
                    {(service.permissions || []).length > 4 && (
                        <span className="px-2 py-1 text-[10px] font-mono-metadata border border-zinc-800 text-zinc-500">
                            +{service.permissions.length - 4}
                        </span>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono-metadata uppercase tracking-[0.25em] text-zinc-500">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {state.last_sync ? new Date(state.last_sync).toLocaleDateString() : 'Never'}
                </div>
                <button onClick={onManage} className="text-indigo-300 hover:text-indigo-200 transition-colors flex items-center gap-1">
                    Manage <SettingsIcon className="w-3 h-3" strokeWidth={1.5} />
                </button>
            </div>
        </div>
    );
}

function ManageDialog({ service, state, color, onClose, onToggleConnection, onTogglePermission }) {
    if (!service) return null;
    const initials = service.name.replace(/[^\w]/g, '').slice(0, 2).toUpperCase();
    const grantedCount = Object.entries(state.permissions || {}).filter(([, v]) => v).length;
    const totalPerms = (service.permissions || []).length;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
            <div className="max-w-2xl w-full bg-zinc-950 border border-zinc-800 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-zinc-900 flex items-start justify-between sticky top-0 bg-zinc-950 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-md flex items-center justify-center font-display font-black text-lg border" style={{ background: `${color}15`, borderColor: `${color}60`, color }}>
                            {initials}
                        </div>
                        <div>
                            <div className="font-display font-bold text-2xl text-white flex items-center gap-2">
                                {service.name}
                                {service.verified && <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={2} />}
                            </div>
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-1">{service.description}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Connection status */}
                    <div className={`p-4 border ${state.connected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-800'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-1">Connection status</div>
                                <div className={`font-display font-bold text-lg ${state.connected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                    {state.connected ? 'Connected' : 'Not connected'}
                                </div>
                            </div>
                            <Switch checked={state.connected} onCheckedChange={onToggleConnection} />
                        </div>
                        {state.connected && (
                            <div className="mt-3 pt-3 border-t border-zinc-900 grid grid-cols-2 gap-4 font-mono-metadata text-xs">
                                <div>
                                    <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">Last sync</div>
                                    <div className="text-white">{state.last_sync ? new Date(state.last_sync).toLocaleString() : '—'}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 mb-1">Permissions</div>
                                    <div className="text-emerald-400">{grantedCount} of {totalPerms} granted</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Permissions */}
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3 flex items-center gap-2">
                            <KeyRound className="w-3.5 h-3.5" strokeWidth={1.5} /> Permissions
                        </div>
                        <div className="space-y-2">
                            {(service.permissions || []).map((p) => {
                                const granted = state.permissions?.[p];
                                return (
                                    <div key={p} className="p-3 border border-zinc-900 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-white">{p}</div>
                                            <div className={`font-mono-metadata text-[9px] uppercase tracking-[0.25em] mt-0.5 ${granted ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                                {granted ? 'Granted' : 'Not granted'}
                                            </div>
                                        </div>
                                        <Switch checked={Boolean(granted)} onCheckedChange={(v) => onTogglePermission(p, v)} disabled={!state.connected} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Data sharing summary */}
                    <div className="p-4 border border-indigo-400/20 bg-indigo-400/[0.03]">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} /> Data Sharing Summary
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {state.connected
                                ? `You have granted ${service.name} access to ${grantedCount} data ${grantedCount === 1 ? 'permission' : 'permissions'}. All data flows are encrypted in transit (TLS 1.3) and at rest.`
                                : `${service.name} currently has no access to your INHEIRA™ data. Enable the connection above to configure permissions.`}
                        </p>
                    </div>

                    {/* Audit log */}
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-3 flex items-center gap-2">
                            <History className="w-3.5 h-3.5" strokeWidth={1.5} /> Activity History
                        </div>
                        <div className="space-y-1.5">
                            {(state.audit_log || []).length === 0 ? (
                                <div className="text-sm text-zinc-600 italic">No activity yet.</div>
                            ) : (
                                [...(state.audit_log || [])].reverse().slice(0, 10).map((a, i) => (
                                    <div key={i} className="p-2 border border-zinc-900 flex items-center justify-between text-xs">
                                        <span className="text-zinc-300 capitalize">{a.action.replace(/_/g, ' ')}</span>
                                        <span className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">{new Date(a.at).toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-zinc-900">
                        {state.connected ? (
                            <>
                                <Button variant="outline" onClick={() => onToggleConnection(false)} className="flex-1 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300">
                                    <PlugZap className="w-4 h-4 mr-2" strokeWidth={1.5} /> Disconnect
                                </Button>
                                <Button onClick={() => onToggleConnection(true)} className="flex-1 bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold">
                                    <Zap className="w-4 h-4 mr-2" strokeWidth={2} /> Re-sync now
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => onToggleConnection(true)} className="w-full bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold">
                                <Plug className="w-4 h-4 mr-2" strokeWidth={2} /> Connect {service.name}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
