/*
 * INHEIRA — Creative Evidence Intelligence™
 * Shared evidence + acknowledgement taxonomy for the Evolution surface.
 * These constants mirror the backend enums (server.py) so every kind we
 * capture here has a corresponding accepted value on the API.
 */

export const EVIDENCE_KINDS = [
    { key: 'rich_text', label: 'Rich text notes', icon: 'FileText', family: 'writing' },
    { key: 'voice_memo', label: 'Voice memo', icon: 'Mic', family: 'audio' },
    { key: 'audio', label: 'Audio (WAV / MP3 / AIFF)', icon: 'Music', family: 'audio' },
    { key: 'lyrics', label: 'Lyrics document', icon: 'FileText', family: 'writing' },
    { key: 'chord_chart', label: 'Chord chart', icon: 'Music4', family: 'writing' },
    { key: 'lead_sheet', label: 'Lead sheet', icon: 'FileMusic', family: 'writing' },
    { key: 'midi', label: 'MIDI', icon: 'Piano', family: 'musical' },
    { key: 'musicxml', label: 'MusicXML', icon: 'FileMusic', family: 'musical' },
    { key: 'daw_export', label: 'DAW session export', icon: 'Layers', family: 'daw' },
    { key: 'stem', label: 'Individual stem', icon: 'AudioWaveform', family: 'audio' },
    { key: 'mix', label: 'Full mix', icon: 'AudioLines', family: 'audio' },
    { key: 'image', label: 'Image / whiteboard', icon: 'Image', family: 'visual' },
    { key: 'video', label: 'Video clip', icon: 'Video', family: 'visual' },
    { key: 'screenshot', label: 'Screenshot', icon: 'Camera', family: 'visual' },
    { key: 'cloud_link', label: 'Linked cloud file', icon: 'Link2', family: 'link' },
];

export const EVIDENCE_KIND_MAP = Object.fromEntries(EVIDENCE_KINDS.map((k) => [k.key, k]));

export const ACK_KINDS = [
    { key: 'signature', label: 'Digital signature' },
    { key: 'written', label: 'Written acknowledgement' },
    { key: 'audio', label: 'Audio acknowledgement' },
    { key: 'video', label: 'Video acknowledgement' },
    { key: 'producer_note', label: 'Producer note' },
    { key: 'engineer_note', label: 'Engineer note' },
    { key: 'witness', label: 'Witness acknowledgement' },
    { key: 'ai_summary', label: 'AI session summary' },
];

export const ROLES = ['writer', 'producer', 'engineer', 'artist', 'session player', 'witness', 'contributor'];

export const FAMILY_COLOR = {
    writing: '#a78bfa',   // violet-400
    audio: '#38bdf8',     // sky-400
    musical: '#f472b6',   // pink-400
    daw: '#f59e0b',       // amber-500
    visual: '#4ade80',    // green-400
    link: '#94a3b8',      // slate-400
};

/**
 * Documentation-completeness copy — never a percentage of contribution,
 * only a documentation-collection progress hint.
 */
export function completenessLabel(ratio) {
    if (ratio >= 0.9) return 'Extensively documented';
    if (ratio >= 0.66) return 'Well documented';
    if (ratio >= 0.33) return 'In progress';
    if (ratio > 0) return 'Just begun';
    return 'Awaiting documentation';
}
