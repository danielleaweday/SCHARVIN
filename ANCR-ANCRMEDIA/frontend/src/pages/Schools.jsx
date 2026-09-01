import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/lib/api";
import { AlbumCard, VideoCard, CreatorCard, SectionHeader } from "@/components/MediaCards";
import { Building2, MapPin, Users, Sparkles } from "lucide-react";
import { fmtNum } from "@/lib/format";

export function Schools() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/institutions").then((r) => setItems(r.data)); }, []);
  return (
    <div className="px-8 py-10" data-testid="schools-page">
      <div className="mb-8">
        <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">CCDP Institutions</div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-tight mt-2">Every school. One network.</h1>
        <p className="text-white/50 mt-2 font-sans-alt text-sm max-w-2xl">Discover student and faculty work from every participating institution in the Contemporary Creative Development Program.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((s) => (
          <Link
            key={s.id}
            to={`/schools/${s.id}`}
            data-testid={`school-card-${s.id}`}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden group card-hover border border-white/[0.06]"
          >
            <img src={s.cover} alt={s.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${s.brand_color}55 65%, #0A0A0A 100%)` }} />
            <div className="absolute inset-0 grain opacity-70" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="text-[10px] tracking-[0.22em] uppercase text-white/70 flex items-center gap-2">
                <MapPin size={11} /> {s.flag} {s.city} · {s.country}
              </div>
              <div className="font-display text-2xl mt-2 leading-tight">{s.name}</div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-white/70">
                <span className="flex items-center gap-1"><Users size={11} /> {fmtNum(s.creator_count)} creators</span>
                <span className="flex items-center gap-1"><Sparkles size={11} /> {fmtNum(s.release_count)} releases</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SchoolDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { setData(null); api.get(`/institutions/${slug}`).then((r) => setData(r.data)); }, [slug]);
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;
  const { institution, faculty, students, newest_releases, featured_videos, livestreams } = data;
  return (
    <div data-testid="school-detail" className="pb-16">
      <section className="relative h-[380px] overflow-hidden">
        <img src={institution.cover} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 20%, ${institution.brand_color}66 60%, #0A0A0A 100%)` }} />
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-x-0 bottom-0 p-8">
          <div className="text-[10px] tracking-[0.28em] uppercase text-white/70">Institution · CCDP Member since {institution.founded}</div>
          <h1 className="font-display text-5xl sm:text-6xl font-black tracking-tighter leading-tight mt-3">{institution.name}</h1>
          <div className="mt-2 text-white/70 text-sm font-sans-alt">{institution.flag} {institution.city}, {institution.country} · {institution.tagline}</div>
        </div>
      </section>
      <div className="px-8 mt-8 space-y-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetaCard label="Students" value={fmtNum(institution.students_count)} />
          <MetaCard label="Creators on ANCRMEDIA" value={fmtNum(students.length + faculty.length)} />
          <MetaCard label="Releases" value={fmtNum(newest_releases.length)} />
          <MetaCard label="Faculty" value={fmtNum(faculty.length)} />
        </div>
        {newest_releases.length > 0 && (
          <section>
            <SectionHeader title="Newest releases" subtitle="Fresh from the students of this institution" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {newest_releases.map((a) => <AlbumCard key={a.id} album={a} />)}
            </div>
          </section>
        )}
        {featured_videos.length > 0 && (
          <section>
            <SectionHeader title="Featured on ANCRVIEW" subtitle="Music videos, masterclasses, and capstone projects" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured_videos.slice(0, 4).map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          </section>
        )}
        {faculty.length > 0 && (
          <section>
            <SectionHeader title="Faculty" subtitle="Mentors and artist-educators in residence" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {faculty.map((c) => <CreatorCard key={c.id} creator={c} />)}
            </div>
          </section>
        )}
        <section>
          <SectionHeader title="Students" subtitle="Class of 2024–2027" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {students.map((c) => <CreatorCard key={c.id} creator={c} />)}
          </div>
        </section>
        {livestreams.length > 0 && (
          <section>
            <SectionHeader title="Livestreams" subtitle="Upcoming and recent broadcasts" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {livestreams.map((l) => (
                <div key={l.id} className="glass rounded-2xl p-4 flex gap-3">
                  <img src={l.thumbnail} className="w-24 h-24 rounded-lg object-cover" alt="" />
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50">{l.category}</div>
                    <div className="font-display text-sm mt-1">{l.title}</div>
                    <div className="text-[11px] text-white/50 mt-1">{l.is_live_now ? "🔴 Live now" : new Date(l.starts_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MetaCard({ label, value }) {
  return (
    <div className="p-5 rounded-2xl glass">
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
      <div className="font-display text-2xl mt-1 tabular-nums">{value}</div>
    </div>
  );
}
