import { BRAND } from "@/lib/brand";

// Section wordmark with subtle tagline. Used above ANCRWAV / ANCRVIEW sections.
export default function ExperienceMark({ variant = "wav", tagline, testid }) {
  const src = variant === "wav" ? BRAND.ANCRWAV : BRAND.ANCRVIEW;
  const name = variant === "wav" ? "ANCRWAV" : "ANCRVIEW";
  const defaultTag = variant === "wav"
    ? "Where music lives · Release · Stream · Own · Legacy"
    : "See beyond. Share impact · Video · Podcasts · Live · Stories";
  return (
    <div className="flex items-center gap-4 mb-6" data-testid={testid || `experience-mark-${variant}`}>
      <img
        src={src}
        alt={name}
        className="h-14 md:h-16 w-auto object-contain"
        loading="lazy"
      />
      <div className="pl-4 border-l border-white/[0.08]">
        <div className="text-[10px] tracking-[0.22em] uppercase text-white/40">Experience</div>
        <div className="text-[13px] font-sans-alt text-white/70 mt-1">{tagline || defaultTag}</div>
      </div>
    </div>
  );
}
