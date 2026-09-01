import React from "react";
import { Section } from "@/components/common/Primitives";
import { useRole } from "@/context/RoleContext";

export default function Settings() {
  const { role, setRole } = useRole();
  return (
    <div className="px-6 md:px-10 py-10 ancr-reveal">
      <Section eyebrow="Settings" title="Your operating system" />
      <div className="mt-10 max-w-2xl space-y-6">
        <div className="ancr-card p-6">
          <div className="ancr-label">Active role</div>
          <div className="mt-2 font-serif text-2xl capitalize">{role}</div>
          <div className="mt-4 flex gap-2">
            <button data-testid="settings-student" onClick={() => setRole("student")} className={`ancr-btn ${role === "student" ? "ancr-btn-primary" : "ancr-btn-ghost"}`}>Student</button>
            <button data-testid="settings-faculty" onClick={() => setRole("faculty")} className={`ancr-btn ${role === "faculty" ? "ancr-btn-primary" : "ancr-btn-ghost"}`}>Faculty</button>
          </div>
        </div>
        <div className="ancr-card p-6">
          <div className="ancr-label">Theme</div>
          <div className="mt-2 font-serif text-2xl">ANCR Dark · Cinematic</div>
          <div className="mt-2 font-mono text-[11px] text-ancr-dim">Locked to the ecosystem design language.</div>
        </div>
        <div className="ancr-card p-6">
          <div className="ancr-label">AIAH™</div>
          <div className="mt-2 font-serif text-2xl">Contextual · Claude Sonnet 4.5</div>
          <div className="mt-2 font-mono text-[11px] text-ancr-dim">Streaming responses via Emergent Universal LLM Key.</div>
        </div>
      </div>
    </div>
  );
}
