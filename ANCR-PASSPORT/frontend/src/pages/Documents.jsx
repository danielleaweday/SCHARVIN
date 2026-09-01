import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, EyeOff, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Disclaimer, fadeUp, staggerContainer } from "@/components/common";

export default function Documents() {
  const [d, setD] = useState(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => { api.get("/passport").then((r) => setD(r.data)); }, []);
  if (!d) return <Loader label="Loading documents" />;

  return (
    <div data-testid="documents-page">
      <PageHeader eyebrow="Documents" title="Secure travel documents"
        subtitle="Your travel documents with sensitive values masked by default. Architecture is prepared for encryption and secure storage."
        testid="documents-header"
        action={<button onClick={() => setReveal(!reveal)} data-testid="documents-reveal" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/70">{reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {reveal ? "Mask all" : "Reveal (demo)"}</button>}
      />

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300"><ShieldCheck className="h-4 w-4" /> Sensitive values are masked by default. This build uses fictional documents — never enter real passport numbers.</div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {d.documents.map((doc) => (
          <motion.div key={doc.label} variants={fadeUp}>
            <GlassCard className="flex items-center gap-4 p-6" data-testid={`document-${doc.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/20 p-4"><FileText className="h-7 w-7 text-cyan" /></div>
              <div className="flex-1">
                <div className="font-600 text-white">{doc.label}</div>
                <div className="font-mono-p text-sm text-white/50">{reveal ? doc.masked.replace(/•/g, "4") : doc.masked}</div>
                <div className="font-mono-p text-[11px] text-white/35">Expires {doc.expires}</div>
              </div>
              <Pill tone={doc.status === "Valid" ? "green" : "amber"}>{doc.status}</Pill>
            </GlassCard>
          </motion.div>
        ))}
        <motion.div variants={fadeUp}>
          <button onClick={() => toast.success("Document uploaded (demo) — stored securely")} data-testid="upload-document" className="flex h-full min-h-[104px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/3 p-6 text-white/50 transition hover:border-cyan/40 hover:text-white"><Upload className="h-6 w-6" /> Upload a document</button>
        </motion.div>
      </motion.div>

      <Disclaimer className="mt-8" text={d.disclaimer} />
    </div>
  );
}
