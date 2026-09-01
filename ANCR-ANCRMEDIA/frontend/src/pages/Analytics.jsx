import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Play, Video as VideoIcon, DollarSign, Globe2 } from "lucide-react";
import { fmtNum } from "@/lib/format";

const AXIS_COLOR = "rgba(255,255,255,0.4)";
const GRID = "rgba(255,255,255,0.06)";

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => { api.get("/analytics/me").then((r) => setData(r.data)).catch(() => setErr(true)); }, []);
  if (!user) {
    return (
      <div className="p-16 text-center" data-testid="analytics-page">
        <div className="text-white/60">Sign in to see your creator analytics.</div>
        <Link to="/login" className="mt-6 inline-block px-5 py-2 rounded-full bg-white text-black text-sm font-medium">Sign in</Link>
      </div>
    );
  }
  if (err) return <div className="p-16 text-white/40">No analytics available yet.</div>;
  if (!data) return <div className="p-16 text-white/40">Loading…</div>;

  const { creator, kpis, growth_series, country_series, schools_reached } = data;
  const pieData = country_series.slice(0, 6).map((c) => ({ name: c.country, value: c.streams }));
  const colors = ["#0052FF", "#7000FF", "#FF6B00", "#00C2FF", "#FF3B77", "#3EE3B2"];

  return (
    <div className="px-8 py-10 pb-24" data-testid="analytics-page">
      <div className="mb-8 flex items-center gap-4">
        <img src={creator.avatar} className="w-14 h-14 rounded-full object-cover border border-white/10" alt="" />
        <div>
          <div className="text-[10px] tracking-[0.28em] uppercase text-white/50">Creator analytics</div>
          <h1 className="font-display text-4xl font-medium tracking-tight leading-tight mt-1">{creator.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Kpi icon={<Play size={14} />} label="Streams" value={fmtNum(kpis.streams)} />
        <Kpi icon={<Users size={14} />} label="Listeners" value={fmtNum(kpis.listeners)} />
        <Kpi icon={<VideoIcon size={14} />} label="Video views" value={fmtNum(kpis.views)} />
        <Kpi icon={<TrendingUp size={14} />} label="Watch hours" value={fmtNum(kpis.watch_hours)} />
        <Kpi icon={<Globe2 size={14} />} label="Followers" value={fmtNum(kpis.followers)} />
        <Kpi icon={<DollarSign size={14} />} label="Est. revenue" value={`$${fmtNum(kpis.revenue_estimate_usd)}`} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6" data-testid="analytics-growth">
          <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4">Growth · Last 12 weeks</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growth_series}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="week" stroke={AXIS_COLOR} fontSize={11} />
              <YAxis stroke={AXIS_COLOR} fontSize={11} tickFormatter={(v) => fmtNum(v)} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} formatter={(v) => fmtNum(v)} />
              <Line type="monotone" dataKey="streams" stroke="#0052FF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="views" stroke="#FF6B00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6" data-testid="analytics-country-pie">
          <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4">Top countries</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} formatter={(v) => fmtNum(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {pieData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: colors[i] }} />{p.name}</span>
                <span className="text-white/60">{fmtNum(p.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-2xl p-6" data-testid="analytics-schools">
        <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4">Schools reached</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={schools_reached}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="name" stroke={AXIS_COLOR} fontSize={10} interval={0} angle={-12} textAnchor="end" height={60} />
            <YAxis stroke={AXIS_COLOR} fontSize={11} tickFormatter={(v) => fmtNum(v)} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} formatter={(v) => fmtNum(v)} />
            <Bar dataKey="streams" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7000FF" />
                <stop offset="100%" stopColor="#0052FF" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1">{icon} {label}</div>
      <div className="font-display text-2xl mt-2 tabular-nums">{value}</div>
    </div>
  );
}
