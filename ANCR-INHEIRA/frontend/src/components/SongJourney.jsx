import { JOURNEY } from '@/constants/testIds';
import { Lightbulb, PenLine, Users, Sliders, Waves, Award, ShieldCheck, Send, Rocket, Coins, Check, Lock } from 'lucide-react';

const STEPS = [
    { key: 'idea', label: 'Idea', icon: Lightbulb },
    { key: 'lyrics', label: 'Writing', icon: PenLine },
    { key: 'collab', label: 'Collaboration', icon: Users },
    { key: 'production', label: 'Production', icon: Sliders },
    { key: 'mix', label: 'Mix', icon: Waves },
    { key: 'master', label: 'Master', icon: Award },
    { key: 'publishing', label: 'Publishing', icon: ShieldCheck },
    { key: 'distribution', label: 'Distribution', icon: Send },
    { key: 'release', label: 'Release', icon: Rocket },
    { key: 'royalties', label: 'Royalties', icon: Coins },
];

function statusFor(session, key) {
    const c = session.completion || {};
    const map = {
        idea: 'complete', // always complete once session created
        collab: (session.collaborators || []).length > 1 ? 'complete' : 'in_progress',
        lyrics: c.lyrics || 'not_started',
        production: c.production || 'not_started',
        mix: c.mix || 'not_started',
        master: c.master || 'not_started',
        publishing: c.publishing || 'not_started',
        distribution: c.distribution || 'locked',
        release: c.release || 'locked',
        royalties: session.splits_status === 'finalized' ? 'in_progress' : 'locked',
    };
    return map[key];
}

const COLORS = {
    complete: '#10B981',
    in_progress: '#8B5CF6',
    not_started: '#52525B',
    locked: '#3F3F46',
};

export default function SongJourney({ session }) {
    const current = STEPS.findIndex((s) => statusFor(session, s.key) === 'in_progress');
    return (
        <div data-testid={JOURNEY.root} className="border border-zinc-900 bg-zinc-950 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2">/ Song Journey</div>
                    <h2 className="font-display font-bold text-2xl text-white tracking-tight">From idea to royalties.</h2>
                </div>
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    Step {Math.max(1, current + 1)} of {STEPS.length}
                </div>
            </div>
            <div className="relative">
                {/* Track */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-800 md:hidden" />
                <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-zinc-800" />
                <div className="grid md:grid-cols-10 gap-4">
                    {STEPS.map((s, i) => {
                        const status = statusFor(session, s.key);
                        const c = COLORS[status];
                        const Icon = s.icon;
                        const isCurrent = i === current;
                        return (
                            <div key={s.key} data-testid={JOURNEY.step} className="relative flex md:flex-col items-center md:text-center gap-3 md:gap-2 z-10">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all"
                                    style={{
                                        background: status === 'complete' ? `${c}20` : '#09090B',
                                        borderColor: c,
                                        boxShadow: isCurrent ? `0 0 20px ${c}80` : status === 'complete' ? `0 0 10px ${c}40` : 'none',
                                    }}
                                >
                                    {status === 'complete' ? (
                                        <Check className="w-4 h-4" style={{ color: c }} strokeWidth={2.5} />
                                    ) : status === 'locked' ? (
                                        <Lock className="w-3.5 h-3.5" style={{ color: c }} strokeWidth={1.5} />
                                    ) : (
                                        <Icon className="w-4 h-4" style={{ color: c }} strokeWidth={1.5} />
                                    )}
                                </div>
                                <div>
                                    <div className="font-display font-semibold text-sm text-white leading-tight">{s.label}</div>
                                    <div className="font-mono-metadata text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: c }}>
                                        {(status || '').replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
