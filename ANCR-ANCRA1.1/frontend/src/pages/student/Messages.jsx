import React from "react";
import useSWR from "swr";
import { get } from "@/lib/api";
import { Section, Chip } from "@/components/common/Primitives";
import { Sparkles } from "lucide-react";

export default function Messages() {
  const { data } = useSWR("/student/messages", get);
  const list = data?.messages || [];
  const [active, setActive] = React.useState(0);

  return (
    <div className="ancr-reveal grid grid-cols-1 gap-0 md:grid-cols-12 h-[calc(100vh-72px)]">
      {/* list */}
      <aside className="md:col-span-4 border-r border-white/[0.06] overflow-y-auto">
        <div className="border-b border-white/[0.06] p-6">
          <div className="ancr-label">Inbox</div>
          <h2 className="mt-1 font-serif text-3xl">Messages</h2>
        </div>
        <div>
          {list.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              data-testid={`msg-${i}`}
              className={`flex w-full gap-3 border-b border-white/[0.04] px-5 py-4 text-left transition ${i === active ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
            >
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/10">
                {m.avatar ? <img src={m.avatar} alt="" className="h-full w-full object-cover" /> : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--ancra-accent)]/20"><Sparkles size={12} className="text-[var(--ancra-accent)]" /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-serif text-[14px]">{m.from}</div>
                  <div className="font-mono text-[9px] text-ancr-mute">{m.when}</div>
                </div>
                <div className="mt-0.5 line-clamp-2 text-[12px] text-ancr-dim">{m.preview}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Chip>{m.kind}</Chip>
                  {m.unread && <span className="h-1.5 w-1.5 rounded-full bg-[var(--ancra-accent)]" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* thread */}
      <main className="md:col-span-8 p-8 md:p-12">
        {list[active] && (
          <div className="max-w-2xl">
            <div className="ancr-label">{list[active].kind}</div>
            <h2 className="mt-2 font-serif text-4xl leading-tight tracking-tight">{list[active].from}</h2>
            <div className="mt-6 font-serif text-2xl leading-snug tracking-tight text-ancr-dim">
              {list[active].preview}
            </div>
            <div className="mt-10">
              <textarea
                rows={4}
                placeholder="Reply…"
                data-testid="msg-compose"
                className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 font-sans text-[14px] outline-none placeholder:text-ancr-mute focus:border-white/25"
              />
              <div className="mt-3 flex justify-end">
                <button className="ancr-btn ancr-btn-primary">Send</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
