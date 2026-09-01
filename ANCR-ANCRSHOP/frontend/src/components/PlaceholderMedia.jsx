import * as Icons from "lucide-react";

const ACCENTS = {
  a: "from-[#0a44ff]/30 via-[#050505] to-[#8a2be2]/15",
  b: "from-[#8a2be2]/25 via-[#050505] to-[#ff00ff]/12",
  c: "from-[#ff00ff]/15 via-[#050505] to-[#ffa500]/22",
};

export default function PlaceholderMedia({
  icon = "Package",
  accent = "a",
  className = "",
  iconClassName = "",
  label,
  image,
  imageClassName = "",
  position = "center",
}) {
  const Icon = Icons[icon] || Icons.Package;
  if (image) {
    return (
      <div className={`relative overflow-hidden bg-[#0a0a0a] ${className}`}>
        <img
          src={image}
          alt={label || ""}
          loading="lazy"
          className={`media-inner h-full w-full object-cover ${imageClassName}`}
          style={{ objectPosition: position }}
        />
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${ACCENTS[accent] || ACCENTS.a} ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      <div className="media-inner absolute inset-0 flex items-center justify-center">
        <Icon
          className={`text-white/20 ${iconClassName}`}
          strokeWidth={1}
          size={72}
        />
      </div>
      <div className="absolute left-4 top-4 h-6 w-6 rounded-full border border-white/10" />
      {label && (
        <span className="absolute bottom-4 right-4 font-head text-[10px] uppercase tracking-[0.25em] text-white/25">
          {label}
        </span>
      )}
    </div>
  );
}
