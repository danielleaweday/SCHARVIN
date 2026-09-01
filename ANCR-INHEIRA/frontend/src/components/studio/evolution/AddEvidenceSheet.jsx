import { useState } from 'react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UploadCloud, Link2, FileText } from 'lucide-react';
import { EVIDENCE_KINDS } from './evidence';

/*
 * INHEIRA — Add Evidence
 * Captures a single Creative Evidence™ artifact and appends it to the version.
 * The full evidence taxonomy is supported architecturally now, even though
 * file-upload UI enables progressively.
 */

const TEXT_KINDS = new Set(['rich_text', 'lyrics', 'chord_chart', 'lead_sheet']);
const LINK_KIND = 'cloud_link';

export default function AddEvidenceSheet({ open, onOpenChange, sessionId, versionId, onCreated }) {
    const [saving, setSaving] = useState(false);
    const [f, setF] = useState({ kind: 'rich_text', title: '', description: '', content: '', cloud_link_url: '', file_url: '', mime_type: '' });

    const submit = async () => {
        if (!f.title.trim()) { toast.error('Give this evidence a title'); return; }
        setSaving(true);
        try {
            const payload = {
                kind: f.kind,
                title: f.title.trim(),
                description: f.description.trim() || null,
                content: TEXT_KINDS.has(f.kind) ? (f.content || null) : null,
                cloud_link_url: f.kind === LINK_KIND ? (f.cloud_link_url.trim() || null) : null,
                file_url: !TEXT_KINDS.has(f.kind) && f.kind !== LINK_KIND ? (f.file_url.trim() || null) : null,
                mime_type: f.mime_type || null,
            };
            const { data } = await api.post(`/sessions/${sessionId}/versions/${versionId}/evidence`, payload);
            toast.success('Evidence sealed to this version');
            onCreated?.(data);
            onOpenChange(false);
            setF({ kind: 'rich_text', title: '', description: '', content: '', cloud_link_url: '', file_url: '', mime_type: '' });
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to add evidence');
        } finally {
            setSaving(false);
        }
    };

    const isText = TEXT_KINDS.has(f.kind);
    const isLink = f.kind === LINK_KIND;
    const isFile = !isText && !isLink;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black border-zinc-900 text-white max-w-2xl p-0 overflow-hidden" data-testid="add-evidence-sheet">
                <div className="border-b border-zinc-900 bg-gradient-to-br from-sky-500/10 via-black to-black px-8 py-7">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-sky-200 mb-3">/ ADD CREATIVE EVIDENCE™</div>
                    <DialogHeader>
                        <DialogTitle className="font-display font-black text-2xl tracking-tighter">Attach evidence to this version</DialogTitle>
                    </DialogHeader>
                    <p className="mt-2 text-sm text-zinc-400">Every artifact you attach here becomes part of this version's immutable evidence package.</p>
                </div>

                <div className="px-8 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div>
                        <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Evidence type</label>
                        <Select value={f.kind} onValueChange={(v) => setF({ ...f, kind: v })}>
                            <SelectTrigger className="mt-2 bg-black border-zinc-800 text-white" data-testid="evidence-kind"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800 text-white max-h-[300px]">
                                {EVIDENCE_KINDS.map((k) => <SelectItem key={k.key} value={k.key}>{k.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Title *</label>
                        <Input data-testid="evidence-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Verse 2 lyrics · draft 4" className="mt-2 bg-black border-zinc-800 text-white focus:border-sky-400 focus:ring-sky-400" />
                    </div>
                    <div>
                        <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Description</label>
                        <Textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-2 bg-black border-zinc-800 text-white focus:border-sky-400 focus:ring-sky-400" data-testid="evidence-description" />
                    </div>

                    {isText && (
                        <div>
                            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Contents</label>
                            <Textarea rows={10} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder={f.kind === 'lyrics' ? 'Paste lyrics here…' : 'Enter the text of this evidence…'} className="mt-2 bg-black border-zinc-800 text-white focus:border-sky-400 focus:ring-sky-400 font-mono text-sm" data-testid="evidence-content" />
                            <p className="mt-1.5 text-[11px] text-zinc-600 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Text-native evidence — sealed with the record.</p>
                        </div>
                    )}

                    {isLink && (
                        <div>
                            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Cloud link URL</label>
                            <Input data-testid="evidence-cloud-url" value={f.cloud_link_url} onChange={(e) => setF({ ...f, cloud_link_url: e.target.value })} placeholder="https://drive.google.com/... or https://we.tl/..." className="mt-2 bg-black border-zinc-800 text-white" />
                            <p className="mt-1.5 text-[11px] text-zinc-600 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> The link and the moment it was attached become part of the record.</p>
                        </div>
                    )}

                    {isFile && (
                        <>
                            <div className="border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
                                <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Direct upload enabling progressively</div>
                                <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                                    For now, paste an external URL (S3, Drive, WeTransfer, etc.). The schema is ready to
                                    swap in direct object-store uploads without changing the record.
                                </p>
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">File URL</label>
                                <Input data-testid="evidence-file-url" value={f.file_url} onChange={(e) => setF({ ...f, file_url: e.target.value })} placeholder="https://…" className="mt-2 bg-black border-zinc-800 text-white" />
                            </div>
                            <div>
                                <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">MIME type (optional)</label>
                                <Input data-testid="evidence-mime" value={f.mime_type} onChange={(e) => setF({ ...f, mime_type: e.target.value })} placeholder="e.g. audio/wav" className="mt-2 bg-black border-zinc-800 text-white" />
                            </div>
                        </>
                    )}
                </div>

                <div className="border-t border-zinc-900 bg-zinc-950/60 px-8 py-4 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">Cancel</Button>
                    <Button onClick={submit} disabled={saving} className="bg-white text-black hover:bg-zinc-200 font-bold" data-testid="evidence-submit">
                        {saving ? 'Sealing…' : 'Attach as evidence'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
