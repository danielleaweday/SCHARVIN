export default function Logo({ size = 40, showWordmark = false, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/ancrlaunch-logo.png"
        alt="ANCRLaunch"
        width={size}
        height={size}
        className="object-contain shrink-0"
        style={{ width: size, height: size }}
        data-testid="ancrlaunch-logo"
      />
      {showWordmark && (
        <div className="flex items-baseline gap-1">
          <span className="font-display text-xl tracking-tight">ANCR</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 pb-0.5">Launch™</span>
        </div>
      )}
    </div>
  );
}
