import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, ExternalLink, Award, Loader2, Sparkles } from "lucide-react";
import { MediaPlayer, MediaPlaceholder } from "@/components/media/MediaPlayer";

function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-display text-lg mt-4 text-white/90">{line.slice(2, -2)}</p>;
    }
    if (line.match(/^\d+\./)) {
      return <p key={i} className="text-white/80 mt-1 pl-4">{line}</p>;
    }
    if (line.startsWith("- ")) {
      return <p key={i} className="text-white/80 mt-1 pl-4">• {line.slice(2)}</p>;
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <p key={i} className="text-white/75 mt-2 leading-relaxed">{line}</p>;
  });
}

function toolLabel(kind) {
  return {
    nutrition: "Open the nutrition tool",
    mindfulness: "Open the mindfulness practice",
    movement: "Open the movement activity",
    checkin: "Open today's check-in",
    performance: "Open a performance ritual",
    recovery: "Open a recovery session",
  }[kind] || "Open the linked tool";
}

function toolRoute(t) {
  if (!t) return "/lifestyle";
  if (t.kind === "nutrition") return "/lifestyle/nutrition";
  if (t.kind === "mindfulness") return "/lifestyle/mindfulness";
  if (t.kind === "movement") return "/lifestyle/movement";
  if (t.kind === "checkin") return "/check-in";
  if (t.kind === "performance") return "/performance";
  if (t.kind === "recovery") return "/recovery";
  return "/lifestyle";
}

export default function LearningLesson() {
  const { pathwayId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [media, setMedia] = useState([]);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get(`/learning/lessons/${lessonId}`).then(({ data }) => {
      setLesson(data);
      setReflection(data.reflection || "");
      // Mark as read on first load (backend is idempotent)
      api.post("/learning/lessons/read", { lesson_id: lessonId }).catch(() => {});
    });
    api.get(`/media/for-lesson/${lessonId}`).then(({ data }) => setMedia(data.items)).catch(() => {});
  };
  useEffect(() => { load(); }, [lessonId]);

  const launchTool = async () => {
    try { await api.post("/learning/lessons/launch", { lesson_id: lessonId }); } catch {}
    const path = toolRoute(lesson?.linked_tool);
    navigate(path);
  };

  const saveReflection = async () => {
    if (!reflection.trim()) { toast.message("Add a short reflection to earn credit"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/learning/lessons/reflect", { lesson_id: lessonId, reflection });
      if (data.credit_earned) toast.success("Credit earned — participation + reflection ✓");
      else toast.success("Reflection saved — launch the tool to complete credit");
      load();
    } catch { toast.error("Couldn't save reflection"); } finally { setSaving(false); }
  };

  if (!lesson) return <div className="text-white/50 text-sm">Loading…</div>;

  return (
    <div className="fade-up" data-testid="lesson-page">
      <button onClick={() => navigate(`/learning/${pathwayId}`)} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> {lesson.pathway?.title || "Pathway"}
      </button>

      <section className="glass rounded-3xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: "#9333EA" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Lesson · {lesson.estimated_minutes} min
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight">{lesson.title}</h1>
          {lesson.credit_earned && (
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-viearta-teal border border-viearta-teal/30 bg-viearta-teal/10 px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" /> Credit earned
            </div>
          )}

          <div className="mt-6 max-w-3xl">
            {renderMarkdown(lesson.content)}
          </div>

          <div className="mt-6" data-testid="lesson-media">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Video & audio</div>
            {media.length === 0 ? (
              <MediaPlaceholder />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {media.map((m) => <MediaPlayer key={m.id} item={m} />)}
              </div>
            )}
          </div>

          {lesson.linked_tool && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-viearta-teal mb-2 inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Practice</div>
              <p className="text-white/70 text-sm">Open the tool from this lesson to record participation.</p>
              <button onClick={launchTool} data-testid="lesson-launch-tool"
                className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">
                <ExternalLink className="w-4 h-4" /> {toolLabel(lesson.linked_tool.kind)}
              </button>
              {lesson.tool_launched_at && <div className="mt-2 text-xs text-white/45">Tool launched ✓</div>}
            </div>
          )}

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-2">Reflection</div>
            <p className="text-white/70 text-sm mb-2">{lesson.reflection_prompt}</p>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)}
              data-testid="lesson-reflection"
              placeholder="Write a short reflection to earn lesson credit"
              rows={4}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm outline-none resize-none placeholder:text-white/30" />
            <div className="mt-3 flex items-center justify-end">
              <button onClick={saveReflection} disabled={saving} data-testid="lesson-reflect-save"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white/10 border border-white/15 hover:bg-white/15 disabled:opacity-60">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save reflection
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
