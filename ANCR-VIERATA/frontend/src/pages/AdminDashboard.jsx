import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Shield, Users, BarChart2, MessageCircle } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [students, setStudents] = useState([]);
  const [agg, setAgg] = useState(null);
  const [ref, setRef] = useState([]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    api.get("/admin/students").then(({ data }) => setStudents(data.items));
    api.get("/admin/aggregate").then(({ data }) => setAgg(data));
    api.get("/admin/consented-reflections").then(({ data }) => setRef(data.items));
  }, [user]);

  if (loading) return null;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="fade-up" data-testid="admin-page">
      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "#14B8A6" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <Shield className="w-3.5 h-3.5" /> Staff dashboard
          </div>
          <h1 className="font-display text-4xl tracking-tight leading-[1.05]">Aggregate patterns · consent-shared reflections</h1>
          <p className="text-white/65 mt-2 max-w-2xl text-sm">Individual student data is never exposed here. Only students who have opted in appear in the shared-reflections list.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 inline-flex items-center gap-1"><Users className="w-3 h-3" /> Enrolled students</div>
          <div className="font-display text-3xl mt-1">{students.length}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 inline-flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Active this week</div>
          <div className="font-display text-3xl mt-1">{agg?.students_active ?? 0}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Consent-shared reflections</div>
          <div className="font-display text-3xl mt-1">{ref.length}</div>
        </div>
      </div>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl mb-3">Aggregate averages (7 days)</h2>
        {agg && agg.students_active > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Avg energy</div>
                <div className="font-display text-2xl mt-1">{agg.energy}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Avg stress</div>
                <div className="font-display text-2xl mt-1">{agg.stress}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Avg sleep</div>
                <div className="font-display text-2xl mt-1">{agg.sleep} h</div>
              </div>
            </div>
            {Object.keys(agg.by_discipline || {}).length > 0 && (
              <div className="mt-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">By discipline</div>
                <ul className="space-y-1.5">
                  {Object.entries(agg.by_discipline).map(([d, v]) => (
                    <li key={d} className="text-sm text-white/70 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                      <span>{d}</span>
                      <span className="text-white/60 text-xs font-mono">E {v.energy} · S {v.stress} · Sleep {v.sleep}h · n={v.n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-4 text-[11px] text-white/40">{agg.notice}</p>
          </>
        ) : (
          <div className="text-white/50 text-sm">Not enough activity in the last 7 days to compute aggregates.</div>
        )}
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8 mb-6">
        <h2 className="font-display text-2xl mb-3">Enrolled students</h2>
        <ul className="space-y-2" data-testid="admin-students">
          {students.map((s) => (
            <li key={s.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <div className="text-white/90">{s.first_name} {s.last_name}</div>
                <div className="text-white/45 text-xs">{s.discipline} · <span className="font-mono">{s.ancrid}</span></div>
              </div>
              <div className="text-white/45 text-xs">{s.email}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-2xl mb-3">Consent-shared reflections</h2>
        {ref.length === 0 ? (
          <div className="text-white/50 text-sm py-4">No students have opted in to share reflections yet.</div>
        ) : (
          <ul className="space-y-2">
            {ref.map((r, i) => (
              <li key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal">{r.kind.replace(/_/g, " ")}</div>
                <div className="text-sm text-white/85 mt-1 whitespace-pre-line">{r.text}</div>
                <div className="text-[11px] text-white/45 mt-2">{r.student?.first_name} · {r.student?.discipline} · {r.date}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
