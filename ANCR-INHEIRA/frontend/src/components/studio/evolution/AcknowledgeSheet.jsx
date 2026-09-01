import { useState } from 'react';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { ACK_KINDS, ROLES } from './evidence';

/*
 * INHEIRA — Acknowledgement capture
 * Every acknowledgement is a permanent piece of human testimony attached
 * to a version. It answers four questions the spec requires:
 *   1. What did you contribute?
 *   2. What did you observe others contribute?
 *   3. Do you agree this version accurately represents the work at this point in time?
 *   4. Are there any disputes or concerns?
 *
 * Once submitted, this record is immutable. It can only be superseded by
 * a later acknowledgement attached to a newer version.
 */

export default function AcknowledgeSheet({ open, onOpenChange, sessionId, versionId, versionTitle, onCreated }) {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        kind: 'signature', role: '', on_behalf_of_name: '',
        contribution_statement: '', observations: '',
        agrees_with_version: 'yes', disputes: '', media_url: '',
    });

    const submit = async () => {
        setSaving(true);
        try {
            const payload = {
                kind: form.kind,
                role: form.role || null,
                on_behalf_of_name: form.on_behalf_of_name.trim() || null,
                contribution_statement: form.contribution_statement,
                observations: form.observations,
                agrees_with_version: form.agrees_with_version === 'yes',
                disputes: form.disputes,
                media_url: form.media_url.trim() || null,
            };
            const { data } = await api.post(`/sessions/${sessionId}/versions/${versionId}/acknowledgements`, payload);
            toast.success('Acknowledgement sealed · permanent testimony');
            onCreated?.(data);
            onOpenChange(false);
            setForm({ kind: 'signature', role: '', on_behalf_of_name: '', contribution_statement: '', observations: '', agrees_with_version: 'yes', disputes: '', media_url: '' });
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to submit acknowledgement');
        } finally {
            setSaving(false);
        }
    };

    const isMedia = form.kind === 'audio' || form.kind === 'video';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-black border-zinc-900 text-white max-w-2xl p-0 overflow-hidden" data-testid="acknowledge-sheet">
                <div className="border-b border-zinc-900 bg-gradient-to-br from-emerald-500/10 via-black to-black px-8 py-7">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-emerald-200 mb-3">/ ACKNOWLEDGEMENT · IMMUTABLE HUMAN TESTIMONY</div>
                    <DialogHeader>
                        <DialogTitle className="font-display font-black text-2xl tracking-tighter">Acknowledge {versionTitle}</DialogTitle>
                    </DialogHeader>
                    <p className="mt-2 text-sm text-zinc-400">Your answers become permanent Creative Evidence™ attached to this version.</p>
                </div>

                <div className="px-8 py-6 max-h-[60vh] overflow-y-auto space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Kind</label>
                            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                                <SelectTrigger className="mt-2 bg-black border-zinc-800 text-white" data-testid="ack-kind"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                    {ACK_KINDS.map((k) => <SelectItem key={k.key} value={k.key}>{k.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Role</label>
                            <Select value={form.role || 'unset'} onValueChange={(v) => setForm({ ...form, role: v === 'unset' ? '' : v })}>
                                <SelectTrigger className="mt-2 bg-black border-zinc-800 text-white" data-testid="ack-role"><SelectValue placeholder="Your role" /></SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                    <SelectItem value="unset">Unspecified</SelectItem>
                                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Logging on behalf of (optional)</label>
                        <Input data-testid="ack-onbehalf" value={form.on_behalf_of_name} onChange={(e) => setForm({ ...form, on_behalf_of_name: e.target.value })} placeholder="Leave blank if this is your own acknowledgement" className="mt-2 bg-black border-zinc-800 text-white" />
                    </div>

                    <div className="border-t border-zinc-900 pt-5">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">/ THE FOUR QUESTIONS</div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-zinc-300">1. What did you contribute to this version?</label>
                                <Textarea rows={3} value={form.contribution_statement} onChange={(e) => setForm({ ...form, contribution_statement: e.target.value })} className="mt-1.5 bg-black border-zinc-800 text-white focus:border-emerald-400 focus:ring-emerald-400" data-testid="ack-contribution" />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-300">2. What did you observe others contribute?</label>
                                <Textarea rows={3} value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="mt-1.5 bg-black border-zinc-800 text-white focus:border-emerald-400 focus:ring-emerald-400" data-testid="ack-observations" />
                            </div>
                            <div>
                                <label className="text-sm text-zinc-300">3. Do you agree this version accurately represents the work at this point in time?</label>
                                <RadioGroup value={form.agrees_with_version} onValueChange={(v) => setForm({ ...form, agrees_with_version: v })} className="mt-2 flex gap-6">
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                        <RadioGroupItem value="yes" id="agree-yes" data-testid="ack-agree-yes" /> Yes, I agree
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                        <RadioGroupItem value="no" id="agree-no" data-testid="ack-agree-no" /> No, I do not agree
                                    </label>
                                </RadioGroup>
                            </div>
                            <div>
                                <label className="text-sm text-zinc-300">4. Any disputes or concerns?</label>
                                <Textarea rows={2} value={form.disputes} onChange={(e) => setForm({ ...form, disputes: e.target.value })} placeholder="Optional but strongly encouraged" className="mt-1.5 bg-black border-zinc-800 text-white focus:border-emerald-400 focus:ring-emerald-400" data-testid="ack-disputes" />
                            </div>
                        </div>
                    </div>

                    {isMedia && (
                        <div className="border-t border-zinc-900 pt-5">
                            <label className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-zinc-500">Media URL</label>
                            <Input data-testid="ack-media-url" value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="Paste the URL to your audio / video acknowledgement" className="mt-2 bg-black border-zinc-800 text-white" />
                            <p className="mt-1.5 text-[11px] text-zinc-600">In-browser recording will be enabled in a follow-up pass. The schema is ready.</p>
                        </div>
                    )}

                    <div className="border border-emerald-400/30 bg-emerald-400/[0.04] p-4 flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-200 mt-0.5 shrink-0" strokeWidth={1.5} />
                        <p className="text-[11px] leading-relaxed text-zinc-300">
                            Once sealed, this acknowledgement is <span className="text-white">immutable</span>. It cannot be edited
                            or deleted — only superseded by a later acknowledgement attached to a newer version. This is by
                            design: your testimony belongs to the historical record.
                        </p>
                    </div>
                </div>

                <div className="border-t border-zinc-900 bg-zinc-950/60 px-8 py-4 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">Cancel</Button>
                    <Button onClick={submit} disabled={saving} className="bg-white text-black hover:bg-zinc-200 font-bold" data-testid="ack-submit">
                        {saving ? 'Sealing…' : 'Seal as permanent testimony'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
