import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Heart, Users, X, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  {
    key: "affirmation", title: "Your daily affirmation",
    icon: Sparkles, color: "#9333EA",
    body: "Every morning, VIEARTA opens with a supportive affirmation drawn from a curated library. Save the ones that steady you — and add a private reflection when you'd like to remember why.",
    cta: "Return to Home",
  },
  {
    key: "lifestyle", title: "The Lifestyle hub",
    icon: Heart, color: "#14B8A6",
    body: "Nutrition, Mindfulness, and Movement live inside Lifestyle. Log a meal, run a two-minute reset, or start a warm-up with a real timer — VIEARTA connects each practice to the day you're actually having.",
    cta: "Explore Lifestyle",
    to: "/lifestyle",
  },
  {
    key: "circle", title: "Wellness Circles",
    icon: Users, color: "#D97706",
    body: "Small groups meet around vocal health, performance preparation, and creative recovery. RSVP to a circle and stay in the pre- and post-gathering conversation with other creators.",
    cta: "Open Wellness Circle",
    to: "/circle",
  },
];

const KEY = "viearta_tour_seen";

export function WelcomeTour() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem(`${KEY}_${user.id}`);
    if (!seen) setOpen(true);
  }, [user]);

  const close = () => {
    if (user) localStorage.setItem(`${KEY}_${user.id}`, "1");
    setOpen(false);
    setStep(0);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft" && step > 0) setStep((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    // Prevent background scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  const next = () => {
    if (step < STEPS.length - 1) setStep((i) => i + 1);
    else {
      const s = STEPS[step];
      close();
      if (s.to) navigate(s.to);
    }
  };

  const back = () => { if (step > 0) setStep((i) => i - 1); };

  const goTo = () => {
    const s = STEPS[step];
    close();
    if (s.to) navigate(s.to);
  };

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      data-testid="welcome-tour"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8 border border-white/10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-40" style={{ background: s.color }} />
        <div className="relative">
          <button onClick={close} data-testid="tour-close" className="absolute top-0 right-0 text-white/60 hover:text-white" aria-label="Skip tour"><X className="w-5 h-5" /></button>

          <div className="w-11 h-11 rounded-2xl border border-white/10 flex items-center justify-center mb-4"
            style={{ background: `${s.color}20`, color: s.color }}>
            <Icon className="w-5 h-5" strokeWidth={1.7} />
          </div>

          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45 mb-1" data-testid="tour-step-indicator">Step {step + 1} of {STEPS.length}</div>
          <h2 id="tour-title" className="font-display text-3xl leading-tight tracking-tight" data-testid={`tour-title-${s.key}`}>{s.title}</h2>
          <p className="text-white/70 mt-3 leading-relaxed" data-testid="tour-body">{s.body}</p>

          <div className="mt-5 flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-white" : "w-4 bg-white/20"}`} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2 flex-wrap">
            <button onClick={close} data-testid="tour-skip" className="text-white/60 hover:text-white text-sm">Skip tour</button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={back} data-testid="tour-back"
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {s.to && step > 0 && !isLast && (
                <button onClick={goTo} data-testid="tour-go"
                  className="rounded-full px-4 py-2 text-sm border border-white/15 hover:border-white/30">{s.cta}</button>
              )}
              <button onClick={next} data-testid="tour-next"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm bg-white text-black hover:bg-white/90">
                {!isLast ? <>Next <ArrowRight className="w-4 h-4" /></> : "Finish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
