import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Nav from '@/components/Nav';
import ModuleLink from '@/components/ModuleLink';
import { PROFILE_UI } from '@/constants/testIds';
import { toast } from 'sonner';
import { ShieldCheck, ArrowUpRight, Fingerprint, User, Sparkles } from 'lucide-react';
import { ANCRFooter } from '@/components/cinematic';
import { colorForAncrId } from '@/lib/collaboratorColors';

// Cinematic studio scenery per chapter — TODO: swap with commissioned shots.
const IMG_HERO      = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // mixing console close
const IMG_BASIC     = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // dark control room
const IMG_PUBLISHING= 'https://images.unsplash.com/photo-1560787313-5dff3307e257?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // publishing meeting
const IMG_TEAM      = 'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // ensemble / band
const IMG_CREATIVE  = 'https://images.unsplash.com/photo-1519475889208-0968e5438f7d?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // vinyl / instruments
const IMG_ABOUT     = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // live moment
const IMG_SOCIAL    = 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?crop=entropy&cs=srgb&fm=jpg&w=1800&q=80'; // stage crowd

export default function Profile() {
    const { user, refresh } = useAuth();
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                legal_name: user.legal_name || '',
                professional_name: user.professional_name || user.name || '',
                phone: user.phone || '',
                country: user.country || '',
                pro: user.pro || '',
                ipi_number: user.ipi_number || '',
                publisher: user.publisher || '',
                publishing_split: user.publishing_split || '',
                label: user.label || '',
                manager: user.manager || '',
                attorney: user.attorney || '',
                website: user.website || '',
                biography: user.biography || '',
                disciplines: (user.disciplines || []).join(', '),
                instruments: (user.instruments || []).join(', '),
                genres: (user.genres || []).join(', '),
                social_twitter: user.social_links?.twitter || '',
                social_instagram: user.social_links?.instagram || '',
            });
        }
    }, [user]);

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                legal_name: form.legal_name || null,
                professional_name: form.professional_name || null,
                phone: form.phone || null,
                country: form.country || null,
                pro: form.pro || null,
                ipi_number: form.ipi_number || null,
                publisher: form.publisher || null,
                publishing_split: form.publishing_split ? parseFloat(form.publishing_split) : null,
                label: form.label || null,
                manager: form.manager || null,
                attorney: form.attorney || null,
                website: form.website || null,
                biography: form.biography || null,
                disciplines: form.disciplines ? form.disciplines.split(',').map((s) => s.trim()).filter(Boolean) : [],
                instruments: form.instruments ? form.instruments.split(',').map((s) => s.trim()).filter(Boolean) : [],
                genres: form.genres ? form.genres.split(',').map((s) => s.trim()).filter(Boolean) : [],
                social_links: {
                    twitter: form.social_twitter || '',
                    instagram: form.social_instagram || '',
                },
            };
            await api.put('/profile/me', payload);
            await refresh();
            toast.success('RightPrint updated');
        } catch (e) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const identityColor = colorForAncrId(user?.user_id || 'self');
    const initials = (user?.name || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div data-testid={PROFILE_UI.root} className="min-h-screen bg-black text-white">
            <Nav />

            {/* HERO — cinematic full-bleed studio banner */}
            <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
                <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{ backgroundImage: `url(${IMG_HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 60%, #000 100%)' }} />
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-40 right-0 w-[900px] h-[500px] rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${identityColor.glow}, transparent 65%)` }} />
                </div>

                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16">
                    <div className="grid md:grid-cols-12 gap-8 items-end">
                        <div className="md:col-span-8">
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] flex items-center gap-2" style={{ color: identityColor.hex }}>
                                    <Fingerprint className="w-3 h-3" strokeWidth={1.5} /> RIGHTPRINT™
                                </div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] flex items-center gap-1.5 text-emerald-300">
                                    <ShieldCheck className="w-3 h-3" strokeWidth={2} /> {user?.verification_status?.toUpperCase() || 'PENDING'}
                                </div>
                                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-zinc-500">
                                    · Permanent creator identity
                                </div>
                            </div>
                            <h1 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.9]">
                                <span className="bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">{user?.professional_name || user?.name}</span>
                            </h1>
                            <div className="mt-5 font-mono-metadata text-xs text-zinc-400">{user?.email}</div>
                            <p className="mt-8 text-zinc-300 leading-relaxed max-w-2xl">
                                Store your legal name, PRO, publisher, and IPI once. Everything you save here becomes part of your <span className="text-white">Creator DNA™</span> — reusable across every session, every song, every deal.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <ModuleLink module="ancrid" subpath={`/${user?.user_id || ''}`}>
                                    <Button className="bg-white text-black hover:bg-zinc-200 font-bold h-11 px-5">
                                        <Sparkles className="w-4 h-4 mr-2" strokeWidth={2} /> Open your Creator DNA™
                                    </Button>
                                </ModuleLink>
                                <Link to="/settings/integrations">
                                    <Button variant="outline" className="border-zinc-800 bg-black/40 hover:bg-zinc-900 text-white font-mono-metadata text-[10px] uppercase tracking-[0.3em] h-11">
                                        Connected Services <ArrowUpRight className="w-3 h-3 ml-2" strokeWidth={2} />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Avatar with identity color glow */}
                        <div className="md:col-span-4 flex md:justify-end">
                            <div className="relative">
                                <div className="absolute -inset-6 rounded-full opacity-70 blur-2xl" style={{ background: `radial-gradient(circle, ${identityColor.glow}, transparent 70%)` }} />
                                {user?.picture ? (
                                    <img src={user.picture} alt="" className="relative w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4" style={{ borderColor: identityColor.hex, boxShadow: `0 0 60px ${identityColor.glow}` }} />
                                ) : (
                                    <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-black font-display font-black text-6xl md:text-7xl" style={{ background: identityColor.hex, boxShadow: `0 0 60px ${identityColor.glow}` }}>{initials}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CHAPTER I · BASIC */}
            <ChapterSection num="I" title="Who you are." subtitle="The signature name industry systems will use to attribute your work forever." img={IMG_BASIC}>
                <div className="grid md:grid-cols-2 gap-6">
                    <Field label="Legal name"        testid={PROFILE_UI.legalName}       value={form.legal_name}        onChange={set('legal_name')} />
                    <Field label="Professional name" testid={PROFILE_UI.professionalName} value={form.professional_name} onChange={set('professional_name')} />
                    <Field label="Phone"             testid={PROFILE_UI.phone}           value={form.phone}             onChange={set('phone')} />
                    <Field label="Country"           testid={PROFILE_UI.country}         value={form.country}           onChange={set('country')} />
                </div>
                <DNAHint dim="Legacy" note="Complete identity fuels the Legacy dimension of your Creator DNA™." />
            </ChapterSection>

            {/* CHAPTER II · PUBLISHING */}
            <ChapterSection num="II" title="How you get paid." subtitle="PRO. IPI. Publisher. The paper trail that routes every performance royalty to you." img={IMG_PUBLISHING}>
                <div className="grid md:grid-cols-2 gap-6">
                    <Field label="PRO (ASCAP / BMI / SESAC / …)" testid={PROFILE_UI.pro}   value={form.pro}              onChange={set('pro')} />
                    <Field label="IPI / CAE Number"              testid={PROFILE_UI.ipi}   value={form.ipi_number}       onChange={set('ipi_number')} />
                    <Field label="Publisher"                     testid={PROFILE_UI.publisher} value={form.publisher}    onChange={set('publisher')} />
                    <Field label="Publishing split (%)"          value={form.publishing_split} onChange={set('publishing_split')} />
                </div>
                <DNAHint dim="Business" note="Every field here strengthens the Business dimension of your Creator DNA™." />
            </ChapterSection>

            {/* CHAPTER III · TEAM */}
            <ChapterSection num="III" title="Who is with you." subtitle="Label, manager, attorney, website. The team behind the creator." img={IMG_TEAM}>
                <div className="grid md:grid-cols-2 gap-6">
                    <Field label="Label"    testid={PROFILE_UI.label}    value={form.label}    onChange={set('label')} />
                    <Field label="Manager"  testid={PROFILE_UI.manager}  value={form.manager}  onChange={set('manager')} />
                    <Field label="Attorney" testid={PROFILE_UI.attorney} value={form.attorney} onChange={set('attorney')} />
                    <Field label="Website"  testid={PROFILE_UI.website}  value={form.website}  onChange={set('website')} />
                </div>
                <DNAHint dim="Collaboration" note="Team relationships feed your Collaboration dimension." />
            </ChapterSection>

            {/* CHAPTER IV · CREATIVE */}
            <ChapterSection num="IV" title="What you do." subtitle="Disciplines. Instruments. Genres. The colors of your creative signature." img={IMG_CREATIVE}>
                <div className="grid gap-6">
                    <Field label="Disciplines (comma separated)" testid={PROFILE_UI.disciplines} value={form.disciplines} onChange={set('disciplines')} placeholder="Songwriter, Producer, Engineer" />
                    <Field label="Instruments (comma separated)" testid={PROFILE_UI.instruments} value={form.instruments} onChange={set('instruments')} placeholder="Vocals, Piano, Guitar" />
                    <Field label="Genres (comma separated)"      testid={PROFILE_UI.genres}      value={form.genres}      onChange={set('genres')}      placeholder="Pop, R&B, Hip-hop" />
                </div>
                <DNAHint dim="Creative" note="This is the heartbeat of the Creative dimension." />
            </ChapterSection>

            {/* CHAPTER V · ABOUT */}
            <ChapterSection num="V" title="Your story." subtitle="One paragraph the industry will read on every deal. Say who you are." img={IMG_ABOUT}>
                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">Biography</Label>
                <Textarea
                    value={form.biography || ''}
                    onChange={set('biography')}
                    data-testid={PROFILE_UI.biography}
                    rows={6}
                    className="mt-2 bg-black border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400 text-base leading-relaxed"
                    placeholder="Tell the industry who you are."
                />
            </ChapterSection>

            {/* CHAPTER VI · SOCIAL */}
            <ChapterSection num="VI" title="Where creators find you." subtitle="Social handles surfaced on your Creator Passport™." img={IMG_SOCIAL}>
                <div className="grid md:grid-cols-2 gap-6">
                    <Field label="Twitter / X" value={form.social_twitter}   onChange={set('social_twitter')}   placeholder="@handle" />
                    <Field label="Instagram"   value={form.social_instagram} onChange={set('social_instagram')} placeholder="@handle" />
                </div>
            </ChapterSection>

            {/* SAVE BAR */}
            <section className="border-b border-zinc-900 bg-black">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-2">/ SIGN THE PRINT</div>
                        <div className="font-display font-black text-2xl text-white">Save your RightPrint™</div>
                        <div className="mt-1 text-sm text-zinc-500">Every field committed here becomes permanent evidence.</div>
                    </div>
                    <Button
                        data-testid={PROFILE_UI.saveBtn}
                        onClick={save}
                        disabled={saving}
                        size="lg"
                        className="bg-white text-black hover:bg-zinc-200 font-bold h-12 px-8"
                    >
                        {saving ? 'Saving…' : 'Save RightPrint'}
                    </Button>
                </div>
            </section>

            <ANCRFooter left="RightPrint™ · Permanent identity" right="INHEIRA™ · Powered by ANCR™" />
        </div>
    );
}

/* ---------------- Cinematic section wrapper with studio scenery ---------------- */
function ChapterSection({ num, title, subtitle, img, children }) {
    return (
        <section className="relative border-b border-zinc-900 bg-black overflow-hidden">
            <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.92) 100%)' }} />
            <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-20">
                <div className="grid md:grid-cols-12 gap-8">
                    <div className="md:col-span-4">
                        <div className="font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-3">/ CHAPTER {num}</div>
                        <h2 className="font-display font-black text-3xl md:text-4xl tracking-tighter leading-[0.95]">
                            <span className="bg-gradient-to-r from-white via-indigo-50 to-violet-100 bg-clip-text text-transparent">{title}</span>
                        </h2>
                        {subtitle && <p className="mt-4 text-zinc-400 text-sm leading-relaxed">{subtitle}</p>}
                    </div>
                    <div className="md:col-span-8 space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
}

function DNAHint({ dim, note }) {
    return (
        <div className="mt-6 flex items-center gap-3 border border-indigo-400/20 bg-indigo-400/[0.04] px-4 py-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 shrink-0" strokeWidth={1.5} />
            <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-200">
                Creator DNA™ · <span className="text-white">{dim}</span> dimension
            </div>
            <div className="text-xs text-zinc-400 truncate">{note}</div>
        </div>
    );
}

function Field({ label, value, onChange, testid, placeholder }) {
    return (
        <div>
            <Label className="text-zinc-400 text-xs uppercase tracking-widest font-mono-metadata">{label}</Label>
            <Input
                value={value || ''}
                onChange={onChange}
                data-testid={testid}
                placeholder={placeholder}
                className="mt-2 bg-black/60 border-zinc-800 text-white focus:border-indigo-400 focus:ring-indigo-400 h-11"
            />
        </div>
    );
}
