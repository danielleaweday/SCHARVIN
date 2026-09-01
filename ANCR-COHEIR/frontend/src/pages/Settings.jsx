import React from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Settings</div>
        <h1 className="wordmark text-4xl md:text-5xl text-white">Preferences & Integrations.</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-6">
          <div className="wordmark text-lg text-white mb-2">Account</div>
          <div className="text-zinc-400 text-sm">{user.name} · {user.email}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1">ANCRID: {user.ancrid}</div>
        </div>
        <div className="glass-panel p-6">
          <div className="wordmark text-lg text-white mb-3">Third-Party Integrations</div>
          <div className="text-zinc-500 text-xs mb-3">Architected as future integration points. Enable when your admin activates them.</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {["Google Calendar", "Outlook", "Zoom", "Google Meet", "Teams", "Slack", "Dropbox", "Google Drive", "OneDrive", "Box", "DocuSign", "Adobe Sign", "LinkedIn", "Calendly", "Spotify", "Apple Music", "YouTube", "Vimeo", "ASCAP", "BMI", "SESAC", "The MLC", "SoundExchange", "Songtrust", "Frame.io"].map((s) => (
              <button key={s} onClick={() => toast.info(`${s} — connection point ready`)}
                className="glass-interactive text-white text-xs p-3 text-center">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
