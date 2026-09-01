import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Award, CheckCircle2, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { PageHeader, GlassCard, Loader, Pill, Ring, fadeUp, staggerContainer } from "@/components/common";

export default function CultureSchool() {
  const [data, setData] = useState(null);
  const [cat, setCat] = useState("All");

  useEffect(() => { api.get("/courses").then((r) => setData(r.data)); }, []);
  if (!data) return <Loader label="Loading Culture School" />;

  const cats = ["All", ...data.categories];
  const filtered = cat === "All" ? data.courses : data.courses.filter((c) => c.category === cat);

  return (
    <div data-testid="culture-school-page">
      <PageHeader eyebrow="Culture School" title="Learn the world, respectfully"
        subtitle="An interactive global-learning center. Build cultural intelligence, ethics and professional conduct for international creative work."
        testid="culture-school-header" />

      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-2" data-testid="category-filter">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} data-testid={`cat-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-600 transition ${cat === c ? "bg-cyan/20 text-cyan border border-cyan/40" : "border border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <motion.div key={c.id} variants={fadeUp}>
            <Link to={`/culture-school/${c.id}`} data-testid={`course-card-${c.id}`}>
              <GlassCard hover className="group h-full overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img src={c.cover} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1021] to-transparent" />
                  {c.percent > 0 && <div className="absolute right-3 top-3"><Ring value={c.percent} size={48} stroke={5} /></div>}
                  <Pill tone="violet" className="absolute bottom-3 left-3">{c.category}</Pill>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-600 leading-tight text-white">{c.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/55">{c.overview}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/45">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {c.estimated_minutes} min</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {c.lessons_total} lessons</span>
                    <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> {c.badge}</span>
                  </div>
                  {c.certificate && <Pill tone="green" className="mt-3"><CheckCircle2 className="h-3 w-3" /> Certified</Pill>}
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
