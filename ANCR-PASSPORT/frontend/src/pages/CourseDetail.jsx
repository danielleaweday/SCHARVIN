import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Award, Clock, Play, Lock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { GlassCard, Loader, Pill, Ring, Disclaimer } from "@/components/common";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [active, setActive] = useState(null); // lesson object
  const [scenarioPick, setScenarioPick] = useState(null);
  const [checkAnswers, setCheckAnswers] = useState({});

  const load = () => api.get(`/courses/${id}`).then((r) => setCourse(r.data));
  useEffect(() => { load(); }, [id]);
  if (!course) return <Loader label="Loading course" />;

  const done = new Set(course.progress.completed_lessons);
  const percent = Math.round((done.size / course.lessons.length) * 100);

  const completeLesson = async (lessonId) => {
    const { data } = await api.post(`/courses/${id}/complete-lesson`, { lesson_id: lessonId });
    await load();
    setActive(null);
    if (data.badge_earned) toast.success(`Certificate earned + '${course.badge}' badge!`);
    else toast.success("Lesson complete");
  };

  return (
    <div data-testid="course-detail-page">
      <button onClick={() => navigate("/culture-school")} className="mb-5 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" /> Culture School</button>

      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10">
        <img src={course.cover} alt="" className="h-64 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A] via-[#05050A]/60 to-transparent" />
        <div className="absolute bottom-0 flex w-full flex-col gap-4 p-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Pill tone="violet" className="mb-3">{course.category} · {course.level}</Pill>
            <h1 className="font-display text-4xl font-700 text-white">{course.title}</h1>
            <p className="mt-2 max-w-xl text-white/70">{course.overview}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.estimated_minutes} min</span>
              <span className="flex items-center gap-1.5"><Award className="h-4 w-4" /> {course.badge} badge</span>
            </div>
          </div>
          <Ring value={percent} size={84} sub="complete" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lessons */}
        <div className="space-y-3 lg:col-span-2">
          <h2 className="font-display text-2xl font-600 text-white">Lessons</h2>
          {course.lessons.map((l, i) => {
            const isDone = done.has(l.id);
            return (
              <GlassCard key={l.id} className="p-5" data-testid={`lesson-${l.id}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDone ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/50"}`}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-mono-p">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="font-600 text-white">{l.title}</div>
                    <div className="font-mono-p text-[11px] text-white/40">{l.minutes} min</div>
                  </div>
                  <button onClick={() => setActive(active?.id === l.id ? null : l)} data-testid={`resume-lesson-${l.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-600 text-white transition hover:border-cyan/50">
                    <Play className="h-3.5 w-3.5" /> {isDone ? "Review" : "Start"}
                  </button>
                </div>
                {active?.id === l.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 overflow-hidden border-t border-white/10 pt-4">
                    <p className="text-sm leading-relaxed text-white/70">{l.content}</p>
                    <button onClick={() => completeLesson(l.id)} data-testid={`complete-lesson-${l.id}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-violet px-5 py-2 text-sm font-600 text-white">
                      <CheckCircle2 className="h-4 w-4" /> Mark lesson complete
                    </button>
                  </motion.div>
                )}
              </GlassCard>
            );
          })}

          {/* Scenario */}
          <h2 className="pt-4 font-display text-2xl font-600 text-white">Scenario</h2>
          <GlassCard className="p-6" data-testid="scenario-block">
            <p className="mb-4 text-white/85">{course.scenario.prompt}</p>
            <div className="space-y-2.5">
              {course.scenario.options.map((o) => {
                const picked = scenarioPick === o.id;
                return (
                  <button key={o.id} onClick={() => setScenarioPick(o.id)} data-testid={`scenario-option-${o.id}`}
                    className={`w-full rounded-xl border p-4 text-left text-sm transition ${picked ? (o.correct ? "border-emerald-500/50 bg-emerald-500/10" : "border-magenta/50 bg-magenta/10") : "border-white/10 bg-white/4 hover:border-white/25"}`}>
                    <div className="text-white/85">{o.text}</div>
                    {picked && <div className={`mt-2 text-xs ${o.correct ? "text-emerald-400" : "text-magenta"}`}>{o.feedback}</div>}
                  </button>
                );
              })}
            </div>
            {scenarioPick && <div className="mt-4 rounded-xl border border-cyan/20 bg-cyan/5 p-4 text-xs text-white/70"><span className="font-600 text-cyan">Cultural explanation:</span> {course.scenario.explanation}</div>}
          </GlassCard>

          {/* Knowledge check */}
          <h2 className="pt-4 font-display text-2xl font-600 text-white">Knowledge Check</h2>
          {course.knowledge_check.map((qz) => (
            <GlassCard key={qz.id} className="p-6" data-testid={`quiz-${qz.id}`}>
              <p className="mb-3 font-600 text-white">{qz.question}</p>
              <div className="space-y-2">
                {qz.options.map((o) => {
                  const picked = checkAnswers[qz.id] === o.id;
                  return (
                    <button key={o.id} onClick={() => setCheckAnswers((p) => ({ ...p, [qz.id]: o.id }))} data-testid={`quiz-${qz.id}-${o.id}`}
                      className={`flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm transition ${picked ? (o.correct ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300" : "border-magenta/50 bg-magenta/10 text-magenta") : "border-white/10 bg-white/4 text-white/80 hover:border-white/25"}`}>
                      {picked ? (o.correct ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />) : <Circle className="h-4 w-4 opacity-30" />} {o.text}
                    </button>
                  );
                })}
              </div>
              {checkAnswers[qz.id] && <p className="mt-3 text-xs text-white/60">{qz.feedback}</p>}
            </GlassCard>
          ))}
        </div>

        {/* Sidebar: certificate/badge */}
        <div className="space-y-6">
          <GlassCard className="p-6 text-center" data-testid="certificate-card">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${course.progress.certificate ? "bg-gradient-to-br from-amber to-magenta" : "bg-white/5"}`}>
              {course.progress.certificate ? <Award className="h-9 w-9 text-white" /> : <Lock className="h-8 w-8 text-white/40" />}
            </div>
            <h3 className="mt-4 font-display text-xl font-600 text-white">Completion Certificate</h3>
            <p className="mt-1 text-sm text-white/55">{course.progress.certificate ? "Congratulations — you've completed this course." : "Complete all lessons to unlock your certificate and country-readiness badge."}</p>
            {course.progress.badge_earned && <Pill tone="amber" className="mt-4">{course.badge} badge earned</Pill>}
          </GlassCard>
          <Disclaimer text="Educational content only. This is not legal, immigration, medical, or government advice." />
        </div>
      </div>
    </div>
  );
}
