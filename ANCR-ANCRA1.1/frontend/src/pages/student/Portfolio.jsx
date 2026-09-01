import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";

export default function Portfolio() {
  const { data } = useSWR("/student/portfolio", get);
  const items = data?.items || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Portfolio Progress"
        title={<span><em className="italic text-ancr-dim">Reviewed</em> work across the ecosystem</span>}
        sub="Every reviewed piece is signed by faculty or industry and auto-synced to your ANCRID™ Creator Passport."
      />

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.id} data-testid={`portfolio-${it.id}`} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] aspect-square">
            <img src={it.cover} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:opacity-80 group-hover:scale-[1.04]" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <Chip>{it.kind}</Chip>
                <div className="font-mono text-2xl tracking-tight text-white">{it.score}</div>
              </div>
              <div>
                <div className="font-serif text-lg leading-tight">{it.title}</div>
                <div className="mt-1 font-mono text-[10px] text-ancr-dim">Reviewed by {it.reviewer}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
