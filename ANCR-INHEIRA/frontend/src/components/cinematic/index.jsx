import { LIFE_STAGES } from '@/lib/lifeOfSong';

/*
 * INHEIRA — Shared cinematic components.
 * The single source of truth for the aesthetic that every Phase 1–4 surface
 * established. Legacy pages import these so no visual clue betrays that parts
 * were built at different times.
 */

/* ---------------------------- Chapter Band ---------------------------- */
export function ChapterBand({ num, eyebrow, title, subtitle, right, bgImg, dim = false, children, contained = true }) {
    const inner = (
        <>
            <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
                <div className="max-w-3xl">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">
                        {num ? `/ CHAPTER ${num}` : eyebrow || ''}
                        {num && eyebrow ? ` · ${eyebrow.toUpperCase()}` : ''}
                    </div>
                    {title && (
                        <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter leading-[0.95]">
                            <span className={dim ? 'text-white' : 'bg-gradient-to-r from-white via-indigo-50 to-violet-100 bg-clip-text text-transparent'}>
                                {title}
                            </span>
                        </h2>
                    )}
                    {subtitle && <p className="mt-4 text-zinc-400 text-sm md:text-base leading-relaxed">{subtitle}</p>}
                </div>
                {right}
            </div>
            {children}
        </>
    );
    return (
        <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
            {bgImg && (
                <>
                    <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0.95))' }} />
                </>
            )}
            <div className={`relative ${contained ? 'max-w-[1400px] mx-auto' : ''} px-6 md:px-10 py-16 md:py-20`}>
                {inner}
            </div>
        </section>
    );
}

/* ---------------------------- Cinematic Hero ---------------------------- */
export function CinematicHero({ eyebrow, title, subtitle, right, tintColor, extraTop, extraBottom, children }) {
    const glow = tintColor || 'rgba(129,140,248,0.16)';
    return (
        <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-40 left-1/3 -translate-x-1/2 w-[1200px] h-[600px] rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${glow}, transparent 65%)` }} />
                <div className="absolute -top-24 right-0 w-[600px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.14), transparent 65%)' }} />
            </div>
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16">
                {extraTop}
                <div className="grid md:grid-cols-12 gap-8 items-end">
                    <div className="md:col-span-8">
                        {eyebrow && (
                            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-6">
                                {eyebrow}
                            </div>
                        )}
                        <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.9]">
                            <span className="bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">{title}</span>
                        </h1>
                        {subtitle && <p className="mt-6 text-zinc-400 max-w-xl text-base leading-relaxed">{subtitle}</p>}
                    </div>
                    {right && <div className="md:col-span-4 flex md:justify-end items-start">{right}</div>}
                </div>
                {children}
                {extraBottom}
            </div>
        </section>
    );
}

/* ---------------------------- Life of a Song spine ---------------------------- */
export function LifeSpine({ currentStage = 1, compact = false }) {
    return (
        <div className={compact ? '' : 'pt-8 border-t border-zinc-900 mt-10'}>
            <div className="flex items-center justify-between mb-4">
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-600">/ LIFE OF A SONG™</div>
                <div className="font-mono-metadata text-[9px] uppercase tracking-[0.4em] text-zinc-500">
                    Stage {String(currentStage).padStart(2,'0')} / 10
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="relative h-10" style={{ minWidth: 640 }}>
                    <div className="absolute left-2 right-2 top-1/2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
                    <div className="absolute left-2 top-1/2 h-px bg-gradient-to-r from-indigo-400 to-sky-300" style={{ width: `calc(${((currentStage - 1) / (LIFE_STAGES.length - 1)) * 100}% - 4px)` }} />
                    <div className="absolute inset-0 flex justify-between items-center">
                        {LIFE_STAGES.map((st, i) => {
                            const idx = i + 1;
                            const done = idx < currentStage;
                            const current = idx === currentStage;
                            return (
                                <div key={st.key} className="flex flex-col items-center gap-1.5" style={{ width: 60 }}>
                                    <div className={`w-2.5 h-2.5 rounded-full border ${current ? 'bg-white border-white shadow-[0_0_16px_rgba(255,255,255,0.7)]' : done ? 'bg-indigo-400 border-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'bg-zinc-900 border-zinc-800'}`} />
                                    <div className={`font-mono-metadata text-[8px] uppercase tracking-[0.25em] whitespace-nowrap ${current ? 'text-white' : done ? 'text-indigo-300' : 'text-zinc-700'}`}>
                                        {String(idx).padStart(2,'0')} · {st.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------- Identity Strip ---------------------------- */
export function IdentityStrip({ collaborators = [], colorForAncrId, size = 8, label }) {
    if (!collaborators.length) return null;
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex -space-x-2">
                {collaborators.slice(0, size).map((c, i) => {
                    const col = c.color || (colorForAncrId ? colorForAncrId(c.user_id || String(i)).hex : '#818cf8');
                    const initials = (c.name || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
                    return (
                        <div key={c.user_id || i} title={c.name} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black font-display font-bold text-[10px]" style={{ background: col, boxShadow: `0 0 14px ${col}66` }}>
                            {initials}
                        </div>
                    );
                })}
            </div>
            {label && (
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">{label}</div>
            )}
        </div>
    );
}

/* ---------------------------- Empty Block ---------------------------- */
export function EmptyBlock({ title, hint }) {
    return (
        <div className="p-12 border border-dashed border-zinc-800 text-center bg-zinc-950/20">
            <div className="font-display font-semibold text-xl text-zinc-300 mb-2">{title}</div>
            <div className="text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">{hint}</div>
        </div>
    );
}

/* ---------------------------- Chapter Anchor (sticky nav helper) ---------------------------- */
export function ChapterAnchor({ id }) {
    return <span id={id} className="block relative -top-16" aria-hidden="true" />;
}

/* ---------------------------- Footer signature ---------------------------- */
export function ANCRFooter({ left = 'Powered by ANCR™', right = 'INHEIRA™ · From Creation to Legacy' }) {
    return (
        <footer className="border-t border-zinc-900 bg-black">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 flex flex-wrap items-center justify-between gap-4">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">{left}</div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-600">{right}</div>
            </div>
        </footer>
    );
}
