import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Sparkles, ArrowRight } from "lucide-react";

export function DailyAffirmation() {
  const navigate = useNavigate();
  const [aff, setAff] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/lifestyle/affirmations/today").then(({ data }) => setAff(data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const toggle = async () => {
    if (!aff) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/lifestyle/affirmations/${aff.id}/favorite`);
      setAff((a) => ({ ...a, favorited: data.favorited }));
      toast.success(data.favorited ? "Saved to favorites" : "Removed from favorites");
    } catch {
      toast.error("Couldn't update favorites");
    } finally { setSaving(false); }
  };

  if (!aff) return null;

  return (
    <section data-testid="daily-affirmation" className="glass rounded-3xl p-6 sm:p-8 fade-up glass-hover relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40" style={{ background: "#9333EA" }} />
      <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full blur-3xl opacity-25" style={{ background: "#D97706" }} />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/45 mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Daily affirmation · {aff.theme.replace(/_/g, " ")}
        </div>
        <p className="font-display text-2xl sm:text-3xl leading-snug tracking-tight text-white/95 max-w-3xl">
          "{aff.text}"
        </p>
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={toggle}
            disabled={saving}
            data-testid="affirmation-fav-btn"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30 hover:bg-white/5 transition-colors"
          >
            {aff.favorited ? <BookmarkCheck className="w-4 h-4 text-viearta-teal" /> : <Bookmark className="w-4 h-4" />}
            {aff.favorited ? "Saved" : "Save to favorites"}
          </button>
          <button
            onClick={() => navigate("/lifestyle/mindfulness")}
            data-testid="affirmation-more-btn"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            Open Mindfulness <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
