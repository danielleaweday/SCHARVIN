// INHEIRA — Life of a Song™ canonical stages + Chapter map.
// Used across Dashboard (Creator Home), StudioSession, and future release/publishing flows
// so that every surface treats a song's journey identically.

import {
    Sparkles, PenLine, Mic, Layers, Signal, ShieldCheck,
    Radio, Activity, Trophy, Infinity as InfinityIcon,
} from 'lucide-react';

// 10-stage arc — mirrors Landing Chapter IX
export const LIFE_STAGES = [
    { key: 'idea',        label: 'Idea',        Icon: Sparkles },
    { key: 'lyrics',      label: 'Lyrics',      Icon: PenLine },
    { key: 'session',     label: 'Session',     Icon: Mic },
    { key: 'mix',         label: 'Mix',         Icon: Layers },
    { key: 'understood',  label: 'Understood',  Icon: Signal },
    { key: 'published',   label: 'Published',   Icon: ShieldCheck },
    { key: 'playlisted',  label: 'Playlisted',  Icon: Radio },
    { key: 'streams',     label: 'Streams',     Icon: Activity },
    { key: 'recognized',  label: 'Recognized',  Icon: Trophy },
    { key: 'legacy',      label: 'Legacy',      Icon: InfinityIcon },
];

// Studio Session Chapter groups — every existing tab is preserved,
// but visually organized into the 5 chapters of one continuous studio.
export const STUDIO_CHAPTERS = [
    { key: 'idea',        label: 'Idea',        stage: 1, tabs: ['overview'] },
    { key: 'write',       label: 'Write',       stage: 2, tabs: ['lyrics', 'melody', 'chords', 'arrangement', 'evolution'] },
    { key: 'record',      label: 'Record',      stage: 3, tabs: ['voice', 'files'] },
    { key: 'collaborate', label: 'Collaborate', stage: 3, tabs: ['collaborators', 'chat'] },
    { key: 'release',     label: 'Release',     stage: 6, tabs: ['rights', 'publishing', 'analytics'] },
];

export function chapterForTab(tabValue) {
    return STUDIO_CHAPTERS.find((c) => c.tabs.includes(tabValue))?.key || 'idea';
}

// Infer a Life of a Song stage index (1..10) from a session's state.
// Kept intentionally forgiving of missing / string / null fields.
export function inferSessionStage(s) {
    if (!s) return 1;
    const earnings = Number(s.total_earnings) || 0;
    const completion = Number(s.completion) || 0;
    const contribs = Number(s.contributions_count) || (Array.isArray(s.contributions) ? s.contributions.length : 0);
    const lyricCount = Number(s.lyrics_line_count) || (Array.isArray(s.lyrics_sections) ? s.lyrics_sections.length : 0);
    const collabs = Array.isArray(s.collaborators) ? s.collaborators.length : 0;

    if (s.splits_status === 'finalized' && earnings > 100) return 8;
    if (s.splits_status === 'finalized')                    return 6;
    if (s.splits_status === 'proposed')                     return 5;
    if (completion >= 60)                                    return 4;
    if (collabs > 0 && contribs > 0)                         return 3;
    if (lyricCount > 0)                                      return 2;
    return 1;
}

export function stageMeta(idx1based) {
    return LIFE_STAGES[Math.max(0, Math.min(LIFE_STAGES.length - 1, idx1based - 1))];
}
