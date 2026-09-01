export default function Footer() {
  return (
    <footer
      data-testid="ancr-footer"
      className="mt-32 border-t hair"
      style={{ background: "#050505" }}
    >
      <div className="px-8 md:px-16 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6">
          <img
            src="/ancrlaunch-logo.png"
            alt="ANCRLaunch"
            className="w-40 md:w-48 h-auto mb-8 opacity-95"
            data-testid="footer-logo"
          />
          <div className="font-display text-6xl md:text-7xl lg:text-8xl leading-none">
            ANCR<span className="align-super text-lg">™</span>
          </div>
          <p className="mt-6 max-w-md text-white/60 font-body text-sm leading-relaxed">
            The professional ecosystem for verified creators. ANCRLaunch™ is the final stage of the CCDP experience — the bridge between graduation and a professional career.
          </p>
          <div className="mt-8 label-eyebrow">Learn. Graduate. Launch.</div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8 text-[13px]">
          <FooterColumn
            title="Ecosystem"
            items={["ANCRID™", "ANCRA™", "ANCRLAB™", "ANCRSync™", "COHEIR™", "INHEIRA™", "Vaulta™", "ANCRMEDIA™", "ANCRD™"]}
          />
          <FooterColumn
            title="ANCRLaunch"
            items={["Dashboard", "Readiness", "Portfolio", "Jobs", "Employer Network", "Career Coach"]}
          />
          <FooterColumn
            title="Institution"
            items={["About CCDP", "Faculty", "Career Services", "Partners", "Press"]}
          />
        </div>
      </div>
      <div className="px-8 md:px-16 py-6 border-t hair flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white/40 font-mono text-[10px] uppercase tracking-[0.24em]">
        <span>© 2026 ANCR™ Ecosystem. All rights reserved.</span>
        <span>Made for verified creators worldwide.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <div className="label-eyebrow mb-4">{title}</div>
      <ul className="space-y-2 text-white/70">
        {items.map((i) => (
          <li key={i} className="hover:text-white transition-colors cursor-default">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
