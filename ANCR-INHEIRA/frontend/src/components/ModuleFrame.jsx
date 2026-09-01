import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { moduleForPath, MODULES } from '@/lib/moduleRegistry';

/**
 * INHEIRA / ANCR — Module Frame
 *
 * A small chrome that appears at the very top of any ANCR module page that
 * INHEIRA renders (ANCRID, Vaulta today; others tomorrow). Its job is to make
 * the module boundary honest: users always know when they've entered a
 * different product within the ecosystem — even though the URL is local.
 *
 * The frame never lies about being "another tab". It simply names the
 * module, links back to INHEIRA, and (when a module later ships standalone)
 * changes zero UI — only moduleRegistry.external_url flips.
 */
export default function ModuleFrame({ pathname, children }) {
    const mod = moduleForPath(pathname || '/');
    if (!mod || mod.module_id === 'inheira') return <>{children}</>;

    return (
        <div>
            <div className="border-b border-white/[0.06] bg-black/60 backdrop-blur-md" data-testid={`module-frame-${mod.module_id}`}>
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-11 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: mod.color }} />
                        <span className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-400">
                            / {mod.owning_product} · {mod.display_name}
                        </span>
                    </div>
                    <span className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-600 hidden sm:inline">
                        {mod.tagline}
                    </span>
                    <Link
                        to="/dashboard"
                        data-testid={`module-frame-back-${mod.module_id}`}
                        className="ml-auto font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                        Return to {MODULES.inheira.display_name}
                        <ArrowUpRight className="w-3 h-3 rotate-180" />
                    </Link>
                </div>
            </div>
            {children}
        </div>
    );
}
