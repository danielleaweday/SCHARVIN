import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import api from "@/lib/api";
import PlaceholderMedia from "@/components/PlaceholderMedia";

export default function Departments() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 font-body text-xs uppercase tracking-[0.25em] text-white/40">
          The Marketplaces
        </p>
        <h1 className="font-display text-5xl font-medium leading-tight md:text-6xl">
          One ecosystem. <span className="text-ccdp-gradient italic">Every</span> department.
        </h1>
        <p className="mt-5 font-body text-lg font-light text-white/60">
          Each marketplace is its own premium department within one connected shopping experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d, i) => {
          const Icon = Icons[d.icon] || Icons.Store;
          return (
            <Link key={d.slug} to={`/shop/${d.slug}`} data-testid={`department-card-${d.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
                className="hover-media group relative flex aspect-[3/2] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 p-6"
              >
                <PlaceholderMedia icon={d.icon} accent={d.accent} className="absolute inset-0 h-full w-full" iconClassName="!size-32" />
                <div className="relative z-10 flex items-start justify-between">
                  <Icon size={26} className="text-white/80" strokeWidth={1.3} />
                  <ArrowUpRight size={20} className="text-white/30 transition-all group-hover:text-white" />
                </div>
                <div className="media-inner relative z-10">
                  <h2 className="font-head text-xl font-semibold">{d.name}</h2>
                  <p className="mt-1 font-body text-sm text-white/50">{d.tagline}</p>
                  <p className="mt-2 font-body text-xs uppercase tracking-wider text-white/30">
                    {d.product_count} products
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
