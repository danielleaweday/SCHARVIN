import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MODULE_LIST, moduleHref } from '@/lib/moduleRegistry';
import { Grid3x3, ExternalLink } from 'lucide-react';

/**
 * INHEIRA — Ecosystem Menu
 *
 * The primary nav is INHEIRA's own surfaces only. Sibling ANCR modules
 * (ANCRID, Vaulta, and future modules) live behind this menu — an honest
 * ecosystem drawer that reflects the platform's real product boundaries.
 * `Coming soon` modules are visible but non-clickable so the ecosystem
 * roadmap is transparent without pretending features exist.
 */
export default function EcosystemMenu() {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const nav = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        const onClick = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('click', onClick);
        return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
    }, [open]);

    const go = (mod, e) => {
        e.stopPropagation();
        if (mod.availability === 'coming_soon') return;
        // ANCRID's route requires the current user's id; Vaulta and INHEIRA
        // resolve normally via moduleHref.
        let href = moduleHref(mod.module_id);
        if (mod.module_id === 'ancrid') {
            if (!user?.user_id) return;
            href = `${mod.route_prefix}/${user.user_id}`;
        }
        if (!href) return;
        if (mod.external_url) { window.location.href = mod.external_url; return; }
        setOpen(false);
        nav(href);
    };

    return (
        <div className="relative" ref={btnRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                data-testid="ecosystem-menu-trigger"
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-mono-metadata text-xs uppercase tracking-[0.2em]"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Ecosystem"
            >
                <Grid3x3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                Ecosystem
            </button>
            {open && (
                <div
                    role="menu"
                    data-testid="ecosystem-menu"
                    className="absolute right-0 top-8 w-[340px] border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl z-50"
                >
                    <div className="border-b border-white/5 px-4 py-3">
                        <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-500">/ ANCR ECOSYSTEM</div>
                        <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Sibling modules INHEIRA connects to. Each is its own product with its own scope.
                        </div>
                    </div>
                    <ul className="max-h-[380px] overflow-y-auto py-1">
                        {MODULE_LIST.map((mod) => {
                            const soon = mod.availability === 'coming_soon';
                            const isInheira = mod.module_id === 'inheira';
                            return (
                                <li key={mod.module_id}>
                                    <button
                                        onClick={(e) => go(mod, e)}
                                        disabled={soon || isInheira}
                                        data-testid={`ecosystem-item-${mod.module_id}`}
                                        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                                            soon || isInheira ? 'cursor-not-allowed opacity-55' : 'hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: mod.color }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-display font-semibold text-white text-sm">{mod.display_name}</span>
                                                {isInheira && <span className="font-mono-metadata text-[8px] uppercase tracking-[0.3em] text-zinc-500 border border-zinc-800 px-1.5 py-0.5">You are here</span>}
                                                {soon && <span className="font-mono-metadata text-[8px] uppercase tracking-[0.3em] text-amber-200 border border-amber-400/30 bg-amber-400/[0.06] px-1.5 py-0.5">Coming soon</span>}
                                                {mod.external_url && <ExternalLink className="w-3 h-3 text-zinc-500" />}
                                            </div>
                                            <div className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{mod.tagline}</div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
