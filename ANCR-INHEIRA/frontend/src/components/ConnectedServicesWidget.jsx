import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { CATEGORIES, totalServices } from '@/lib/integrationsCatalog';
import { ArrowUpRight, Plug, ShieldCheck } from 'lucide-react';

const HIGHLIGHT_IDS = ['ancrlab', 'ancrwav', 'vaulta', 'anthropic', 'ascap', 'distrokid', 'spotify', 'gdrive'];

export default function ConnectedServicesWidget() {
    const [state, setState] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/integrations');
                const map = {};
                for (const it of data) map[it.integration_id] = it;
                // seed defaults for viz
                for (const cat of CATEGORIES) {
                    for (const s of cat.services) {
                        if (!map[s.id] && s.defaultConnected) {
                            map[s.id] = { integration_id: s.id, connected: true };
                        }
                    }
                }
                setState(map);
            } finally {
                setLoaded(true);
            }
        })();
    }, []);

    const connected = Object.values(state).filter((s) => s.connected).length;

    return (
        <div className="border border-zinc-900 bg-zinc-950 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Plug className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400">/ Connected Services</div>
                </div>
                <Link to="/settings/integrations" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
                <div className="font-display font-black text-3xl text-white">{loaded ? connected : '—'}</div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">/ {totalServices()} active</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {HIGHLIGHT_IDS.map((id) => {
                    const st = state[id];
                    const active = st?.connected;
                    return (
                        <div key={id} className={`aspect-square rounded-md border flex items-center justify-center font-mono-metadata text-[9px] uppercase tracking-[0.15em] ${active ? 'border-emerald-500/40 bg-emerald-500/[0.05] text-emerald-400' : 'border-zinc-800 text-zinc-600'}`}>
                            {id.slice(0, 3).toUpperCase()}
                        </div>
                    );
                })}
            </div>
            <Link to="/settings/integrations" className="mt-4 flex items-center justify-between text-xs text-zinc-500 hover:text-white transition-colors">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" strokeWidth={1.5} /> Permission-based · view-only until granted</span>
                <span className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-indigo-400">Manage</span>
            </Link>
        </div>
    );
}
