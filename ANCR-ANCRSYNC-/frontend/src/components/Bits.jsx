export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <header className="px-8 md:px-16 pt-16 lg:pt-24 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-3xl">
          {eyebrow && <div className="label-eyebrow mb-6">{eyebrow}</div>}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-white/60 font-body text-base md:text-lg max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      <div className="mt-12 h-px hair border-t" />
    </header>
  );
}

export function Section({ label, children, className = "" }) {
  return (
    <section className={`px-8 md:px-16 py-10 ${className}`}>
      {label && <div className="label-eyebrow mb-6">{label}</div>}
      {children}
    </section>
  );
}

export function Card({ children, className = "", testid }) {
  return (
    <div
      data-testid={testid}
      className={`bg-[#050505] border hair p-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function Metric({ label, value, sub, testid }) {
  return (
    <div data-testid={testid} className="border hair p-6 md:p-8 bg-[#050505] hover:border-white/20 transition-colors">
      <div className="label-eyebrow">{label}</div>
      <div className="font-mono text-4xl md:text-5xl tracking-tighter mt-4">
        {value}
      </div>
      {sub && <div className="text-white/50 text-[13px] mt-2">{sub}</div>}
    </div>
  );
}

export function TagPill({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 border hair font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
      {children}
    </span>
  );
}
