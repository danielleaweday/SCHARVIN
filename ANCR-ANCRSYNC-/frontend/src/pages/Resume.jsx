import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader, Section } from "@/components/Bits";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function Resume() {
  const [r, setR] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get("/resume").then((res) => setR(res.data)); }, []);
  if (!r) return <div className="p-16 text-white/40 font-mono">Loading resume…</div>;

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/resume", {
        professional_summary: r.professional_summary,
        career_objective: r.career_objective,
        skills: r.skills,
        employment: r.employment,
        education: r.education,
        awards: r.awards,
      });
      setR(data);
      toast.success("Resume saved");
    } catch {
      toast.error("Failed to save");
    } finally { setSaving(false); }
  };

  const exportPdf = () => toast("PDF export — production placeholder");

  return (
    <div data-testid="resume-page">
      <PageHeader
        eyebrow="Resume · Auto-generated from ecosystem"
        title={<>Editorial Resume<br /><span className="grad-text">{r.completion}% complete</span></>}
        subtitle="Skeleton is assembled from verified ANCRID™, ANCRA™, ANCRLAB™ and ANCRMEDIA™ data. Refine the voice — leave the facts."
        right={
          <button
            data-testid="btn-export-pdf"
            onClick={exportPdf}
            className="inline-flex items-center gap-2 border hair-strong px-6 py-3 hover:bg-white/5 transition-colors font-mono text-[11px] uppercase tracking-[0.24em]"
          >
            <Download strokeWidth={1.25} className="h-4 w-4" /> Export PDF
          </button>
        }
      />
      <Section className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Field label="Professional Summary" value={r.professional_summary} onChange={(v) => setR({ ...r, professional_summary: v })} rows={5} tid="field-summary" />
          <Field label="Career Objective" value={r.career_objective} onChange={(v) => setR({ ...r, career_objective: v })} rows={5} tid="field-objective" />

          <Field
            label="Skills · comma separated"
            value={(r.skills || []).join(", ")}
            onChange={(v) => setR({ ...r, skills: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            rows={3}
            tid="field-skills"
          />

          <div className="border hair p-8 bg-[#050505]">
            <div className="label-eyebrow mb-4">Education</div>
            {(r.education || []).map((e, i) => (
              <div key={i} className="py-2 flex justify-between text-sm">
                <span>{e.credential}</span><span className="text-white/60 font-mono">{e.institution} · {e.year}</span>
              </div>
            ))}
            {(r.education || []).length === 0 && <div className="text-white/40 text-sm">No education records.</div>}
          </div>

          <ListEditor label="Employment" items={r.employment || []} onChange={(items) => setR({ ...r, employment: items })} tid="list-employment" />
          <ListEditor label="Awards" items={r.awards || []} onChange={(items) => setR({ ...r, awards: items })} tid="list-awards" />
        </div>

        <div className="mt-12">
          <button
            data-testid="btn-save-resume"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 font-mono text-[11px] uppercase tracking-[0.28em] hover:bg-white/90 transition-colors"
          >
            {saving ? "Saving…" : "Save resume"}
          </button>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, value, onChange, rows = 3, tid }) {
  return (
    <div className="border hair p-8 bg-[#050505]">
      <div className="label-eyebrow mb-4">{label}</div>
      <textarea
        data-testid={tid}
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b hair-strong pb-2 focus:outline-none focus:border-[#00f0ff] transition-colors resize-y font-body text-sm leading-relaxed"
      />
    </div>
  );
}

function ListEditor({ label, items, onChange, tid }) {
  const add = () => onChange([...(items || []), { title: "", detail: "" }]);
  return (
    <div className="border hair p-8 bg-[#050505]" data-testid={tid}>
      <div className="flex items-center justify-between mb-4">
        <div className="label-eyebrow">{label}</div>
        <button onClick={add} className="text-[11px] font-mono uppercase tracking-[0.24em] border-b hair-strong hover:border-white">+ Add</button>
      </div>
      {(items || []).map((it, i) => (
        <div key={i} className="border-t hair py-3 space-y-2">
          <input
            className="w-full bg-transparent border-b hair-strong pb-1 focus:outline-none focus:border-[#00f0ff] font-body text-sm"
            placeholder="Title"
            value={it.title || ""}
            onChange={(e) => {
              const cp = [...items]; cp[i] = { ...cp[i], title: e.target.value }; onChange(cp);
            }}
          />
          <input
            className="w-full bg-transparent border-b hair-strong pb-1 focus:outline-none focus:border-[#00f0ff] font-body text-sm text-white/70"
            placeholder="Detail"
            value={it.detail || ""}
            onChange={(e) => {
              const cp = [...items]; cp[i] = { ...cp[i], detail: e.target.value }; onChange(cp);
            }}
          />
        </div>
      ))}
      {(items || []).length === 0 && <div className="text-white/40 text-sm">None yet.</div>}
    </div>
  );
}
