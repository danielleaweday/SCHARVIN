import { Mail, Linkedin } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./Reveal";
import { LEADERSHIP } from "../lib/content";

const FounderFeature = ({ m }) => (
  <div data-testid="founder-feature" className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-ccdp-charcoal/40">
    <div className="grid lg:grid-cols-[minmax(0,300px)_1fr]">
      <div className="mx-auto w-full max-w-[240px] p-6 lg:mx-0 lg:max-w-[300px] lg:p-8">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
          <img src={m.photo} alt={`${m.name}, ${m.role}`} draggable="false" className="h-full w-full object-cover object-top" />
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ccdp-white md:text-3xl">{m.name}</h3>
        <p className="mt-2 text-sm font-medium text-gradient">{m.role}</p>
        {m.role2 && <p className="mt-0.5 text-sm text-ccdp-cream/60">{m.role2}</p>}

        <p className="overline mt-8 text-ccdp-cream/40">Founder Statement</p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ccdp-cream/75">{m.statement}</p>

        <p className="overline mt-8 text-ccdp-cream/40">Connect</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a href={`mailto:${m.email}`} data-testid="founder-email"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm text-ccdp-cream transition-colors hover:border-white/30 hover:bg-white/[0.06]">
            <Mail className="h-4 w-4 text-ccdp-cream/60" />
            {m.email}
          </a>
          <span data-testid="founder-linkedin"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2.5 text-sm text-ccdp-cream/55">
            <Linkedin className="h-4 w-4 text-ccdp-cream/40" />
            {m.linkedinName}
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ccdp-cream/40">Soon</span>
          </span>
        </div>
      </div>
    </div>
  </div>
);

const TextCard = ({ m, testid }) => (
  <div data-testid={testid}
    className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ccdp-charcoal/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
    <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-ccdp-black">
      <span className="font-display text-sm font-extrabold tracking-tight text-gradient">{m.initials}</span>
    </span>
    <h3 className="mt-4 font-display text-lg font-semibold leading-tight tracking-tight text-ccdp-white">{m.name}</h3>
    <p className="mt-1 text-[13px] font-medium leading-snug text-gradient">{m.role}</p>
    {m.purpose && <p className="mt-2 text-[13px] leading-relaxed text-ccdp-cream/65">{m.purpose}</p>}
  </div>
);

const slug = (name) => name.replace(/[^a-zA-Z ]/g, "").split(" ").slice(-1)[0].toLowerCase();

export const Leadership = () => {
  const { founder, executive, academicCouncil, councilIntro, administration } = LEADERSHIP;
  return (
    <section id="leadership" data-testid="leadership-section" className="relative bg-ccdp-black py-24 text-ccdp-cream md:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <p className="overline flex items-center gap-3 text-ccdp-cream/50">
            <span className="inline-block h-2 w-2 rounded-full bg-ccdp-gradient" />
            Leadership
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Our Leadership &amp; <span className="text-gradient">Academic Team.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12">
            <FounderFeature m={founder} />
          </div>
        </Reveal>

        {/* Executive Leadership */}
        <Reveal delay={0.12}>
          <p className="overline mt-16 text-ccdp-cream/40">Executive Leadership</p>
        </Reveal>
        <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {executive.map((m) => (
            <StaggerItem key={m.name}>
              <TextCard m={m} testid={`exec-${slug(m.name)}`} />
            </StaggerItem>
          ))}
        </Stagger>

        {/* Academic Leadership Council */}
        <Reveal delay={0.12}>
          <div className="mt-16 max-w-3xl">
            <p className="overline text-ccdp-cream/40">CCDP Academic Leadership Council</p>
            <p className="mt-4 text-base leading-relaxed text-ccdp-cream/65">{councilIntro}</p>
          </div>
        </Reveal>
        <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {academicCouncil.map((m) => (
            <StaggerItem key={m.name}>
              <TextCard m={m} testid={`council-${slug(m.name)}`} />
            </StaggerItem>
          ))}
        </Stagger>

        {/* Administration & Program Operations */}
        <Reveal delay={0.12}>
          <p className="overline mt-16 text-ccdp-cream/40">Administration &amp; Program Operations</p>
        </Reveal>
        <Stagger className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-2xl lg:grid-cols-2">
          {administration.map((m) => (
            <StaggerItem key={m.name}>
              <TextCard m={m} testid={`admin-${slug(m.name)}`} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
};
