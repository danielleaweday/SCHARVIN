import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Nav from '@/components/Nav';
import { SESSION_UI } from '@/constants/testIds';
import { toast } from 'sonner';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CinematicHero, LifeSpine, ANCRFooter } from '@/components/cinematic';

const IMG_STUDIO = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80';

export default function NewSession() {
    const nav = useNavigate();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: '',
        working_title: '',
        project: '',
        album: '',
        location: '',
        session_type: 'private',
        context: 'industry',
        date: new Date().toISOString().slice(0, 10),
    });

    const set = (k) => (e) => setForm({ ...form, [k]: e.target ? e.target.value : e });

    const create = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.post('/sessions', form);
            toast.success('Session created');
            nav(`/sessions/${data.session_id}/studio`);
        } catch (e) {
            toast.error(e?.response?.data?.detail || 'Failed to create session');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div data-testid={SESSION_UI.createRoot} className="min-h-screen bg-black text-white">
            <Nav />

            <CinematicHero
                eyebrow={<span className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-indigo-300" strokeWidth={1.5} /> NEW SESSION · STAGE 01 · IDEA</span>}
                title={<>Where every song<br />begins.</>}
                subtitle="Name the moment. From here it becomes permanent evidence — every contribution time-stamped, every collaborator identified, every ownership decision documented."
                extraBottom={<LifeSpine currentStage={1} />}
            />

            <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{ backgroundImage: `url(${IMG_STUDIO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.75), rgba(0,0,0,0.95))' }} />
                <div className="relative max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20">
                    <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER I · NAME THE MOMENT</div>
                    <h2 className="font-display font-black text-3xl md:text-4xl tracking-tighter text-white mb-10 leading-[0.95]">
                        <span className="bg-gradient-to-r from-white via-indigo-50 to-violet-100 bg-clip-text text-transparent">Begin the record.</span>
                    </h2>

                    <form onSubmit={create} className="space-y-8">
                        <div>
                            <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Song title *</Label>
                            <Input required value={form.title} onChange={set('title')} data-testid={SESSION_UI.titleInput} className="mt-2 bg-black/60 border-zinc-800 text-white h-14 focus:border-indigo-400 focus:ring-indigo-400 text-2xl font-display" placeholder="e.g. Skyline" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Working title</Label>
                                <Input value={form.working_title} onChange={set('working_title')} data-testid={SESSION_UI.workingTitleInput} className="mt-2 bg-black/60 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" placeholder="Optional" />
                            </div>
                            <div>
                                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Project / EP / Album</Label>
                                <Input value={form.project} onChange={set('project')} data-testid={SESSION_UI.projectInput} className="mt-2 bg-black/60 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" placeholder="Optional" />
                            </div>
                            <div>
                                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Location</Label>
                                <Input value={form.location} onChange={set('location')} data-testid={SESSION_UI.locationInput} className="mt-2 bg-black/60 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" placeholder="Studio, city" />
                            </div>
                            <div>
                                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Date</Label>
                                <Input type="date" value={form.date} onChange={set('date')} className="mt-2 bg-black/60 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400" />
                            </div>
                            <div>
                                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Session Type</Label>
                                <Select value={form.session_type} onValueChange={(v) => setForm({ ...form, session_type: v })}>
                                    <SelectTrigger data-testid={SESSION_UI.typeSelect} className="mt-2 bg-black/60 border-zinc-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Context</Label>
                                <Select value={form.context} onValueChange={(v) => setForm({ ...form, context: v })}>
                                    <SelectTrigger data-testid={SESSION_UI.contextSelect} className="mt-2 bg-black/60 border-zinc-800 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        <SelectItem value="industry">Industry</SelectItem>
                                        <SelectItem value="university">University</SelectItem>
                                        <SelectItem value="writing_camp">Writing Camp</SelectItem>
                                        <SelectItem value="studio">Studio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="pt-6 flex items-center gap-4">
                            <Button type="submit" data-testid={SESSION_UI.submitCreate} disabled={saving} size="lg" className="bg-white text-black hover:bg-zinc-200 font-bold h-12 px-6">
                                {saving ? 'Creating…' : 'Begin the session'}
                                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => nav(-1)} className="text-zinc-400 hover:text-white">Cancel</Button>
                        </div>
                    </form>
                </div>
            </section>

            <ANCRFooter left="From Idea to Legacy" right="Powered by ANCR™" />
        </div>
    );
}
