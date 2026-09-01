import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";
import { Users } from "lucide-react";

export default function Teams() {
  const { data } = useSWR("/student/teams", get);
  const teams = data?.teams || [];

  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section
        eyebrow="Creative Teams · ANCRSync™"
        title={<span><em className="italic text-ancr-dim">Your</em> creative collaborators</span>}
      />
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {teams.map((t) => (
          <div key={t.id} className="ancr-card overflow-hidden">
            <div className="flex gap-5 p-6">
              <img src={t.avatar} alt="" className="h-24 w-24 rounded-2xl object-cover" />
              <div className="flex-1">
                <div className="ancr-label">{t.kind}</div>
                <div className="mt-1 font-serif text-2xl leading-tight">{t.name}</div>
                <div className="mt-2 flex items-center gap-2 text-[13px]">
                  <Users size={13} className="text-ancr-dim" />
                  <span className="text-ancr-dim">{t.members.join(" · ")}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Chip tone="accent">{t.active_project}</Chip>
                  <Chip>{t.module_link}™</Chip>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
