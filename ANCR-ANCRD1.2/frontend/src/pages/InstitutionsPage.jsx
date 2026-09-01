import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "@/components/ancrd/AppShell";
import PageHeader from "@/components/ancrd/PageHeader";
import { api } from "@/lib/api";
import { Building2, GraduationCap, Users2, BookOpen, ArrowRight } from "lucide-react";

export default function InstitutionsPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/institutions").then(({ data }) => setItems(data));
  }, []);

  return (
    <AppShell>
      <PageHeader
        section="Institutions"
        kicker="CCDP Partner Institutions"
        description="Every academic partner powering the Contemporary Creative Development Program worldwide. Each institution operates its own digital campus."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {items.map((i) => (
          <Link
            key={i.id}
            to={`/institutions/${i.id}`}
            data-testid={`institution-${i.id}`}
            className="glass rounded-sm p-5 flex flex-col btn-cine hover:border-white/20 group"
          >
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-sm flex items-center justify-center shrink-0 border"
                style={{
                  borderColor: "rgba(249,115,22,0.35)",
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(249,115,22,0.12))",
                }}
              >
                <Building2 className="h-4 w-4" style={{ color: "#F97316" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-lg tracking-tighter leading-tight">
                  {i.name}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-1">
                  {i.city}, {i.country}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <Stat icon={GraduationCap} label="Students" value={i.students} />
              <Stat icon={Users2} label="Faculty" value={i.faculty} />
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Programs
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(i.programs || []).slice(0, 5).map((p) => (
                  <span
                    key={p}
                    className="px-1.5 py-0.5 border border-white/10 rounded-sm font-mono text-[9px] uppercase tracking-wider text-white/70"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end font-mono text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white">
              Open Campus <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="p-3 border border-white/5 rounded-sm">
      <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-display font-black text-2xl tracking-tighter mt-0.5">{value}</div>
    </div>
  );
}
