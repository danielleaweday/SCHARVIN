import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { RoleChip } from "@/components/coheir/MentorCard";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";

export default function Cohorts() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/cohorts").then(({ data }) => setItems(data)); }, []);
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Cohorts</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Groups working together.</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={`/cohorts/${c.id}`} className="glass-interactive block overflow-hidden p-0"
              data-testid={`cohort-card-${c.id}`}>
              <div className="h-32 relative overflow-hidden">
                {c.cover_image && <img src={c.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="wordmark text-white text-lg leading-tight">{c.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 mt-1">{c.program}</div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-zinc-400 text-xs line-clamp-2">{c.description}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RoleChip tone="violet">{c.discipline}</RoleChip>
                    <span className="flex items-center gap-1 text-zinc-500 text-xs"><Users className="w-3 h-3" /> {c.student_ids?.length || 0}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
