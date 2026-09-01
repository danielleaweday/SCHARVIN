import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Linkedin, Youtube, Twitter, Instagram, Mail, MapPin, Globe } from "lucide-react";
import { NAV_LINKS, MORE_LINKS, CONTACT_STRIP, PLATFORMS, ASSETS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";

const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Instagram, label: "Instagram" },
  { icon: Youtube, label: "YouTube" },
  { icon: Twitter, label: "X" },
];

const EXPLORE = [...NAV_LINKS, ...MORE_LINKS];

const target = (l) => (l.path ? l.path : { pathname: "/", hash: l.hash });

export const Footer = () => {
  const [email, setEmail] = useState("");
  const { openInquiry } = useInquiry();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    openInquiry("general", { email });
    setEmail("");
  };

  return (
    <footer id="contact" data-testid="footer" className="relative overflow-hidden border-t border-white/10 bg-ccdp-black pt-24 text-ccdp-cream">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" data-testid="footer-logo" aria-label="CCDP home">
              <img src="/brand/ccdp-colored.png" alt="Contemporary Creative Development Program" className="h-16 w-auto md:h-20" draggable="false" />
            </Link>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-ccdp-cream/60">
              Contemporary Creative Development Program — a next-generation
              education operating system uniting higher education, AI technology,
              industry experience, and career pathways.
            </p>

            <form onSubmit={onSubmit} data-testid="contact-form" className="mt-8 max-w-sm">
              <label className="overline text-ccdp-cream/40">Get partnership updates</label>
              <div className="mt-3 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5 pl-5 transition-colors focus-within:border-white/40">
                <input type="text" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org" data-testid="contact-input"
                  className="w-full bg-transparent text-sm text-ccdp-cream placeholder:text-ccdp-cream/40 focus:outline-none" />
                <button type="submit" data-testid="contact-submit" aria-label="Subscribe"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ccdp-gradient text-white transition-transform hover:scale-105">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="mt-8 flex gap-3">
              {SOCIALS.map((s) => (
                <a key={s.label} href="#top" aria-label={s.label} data-testid={`social-${s.label.toLowerCase()}`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-ccdp-cream/70 transition-colors hover:border-white/50 hover:text-ccdp-white">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="overline text-ccdp-cream/40">Explore</h4>
            <ul className="mt-5 space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.label}>
                  <Link to={target(l)} className="text-sm text-ccdp-cream/70 transition-colors hover:text-ccdp-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="overline text-ccdp-cream/40">Ecosystem</h4>
            <ul className="mt-5 space-y-3">
              {PLATFORMS.map((e) => (
                <li key={e.id}>
                  <Link to="/platform" className="text-sm text-ccdp-cream/70 transition-colors hover:text-ccdp-white">{e.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="overline text-ccdp-cream/40">Contact</h4>
            <ul className="mt-5 space-y-4 text-sm text-ccdp-cream/70">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ccdp-cream/40" />
                <a href="mailto:awe@aweday.org" className="hover:text-ccdp-white">awe@aweday.org</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-ccdp-cream/40" />
                <a href="https://ccdpbyancr.com" target="_blank" rel="noreferrer" className="hover:text-ccdp-white">ccdpbyancr.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-ccdp-cream/40" />
                <a href="https://aweday.org" target="_blank" rel="noreferrer" className="hover:text-ccdp-white">aweday.org</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ccdp-cream/40" />
                Chicago, Illinois
              </li>
            </ul>
          </div>
        </div>

        {/* Persistent contact strip */}
        <div data-testid="footer-contact-strip" className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-6 text-sm md:flex-row md:justify-center md:gap-10">
          {CONTACT_STRIP.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.kind === "web" ? "_blank" : undefined}
              rel={c.kind === "web" ? "noreferrer" : undefined}
              data-testid={`contact-strip-${c.kind}`}
              className="inline-flex items-center gap-2 font-medium text-ccdp-cream/80 transition-colors hover:text-gradient"
            >
              {c.kind === "mail" ? <Mail className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              {c.kind === "web" ? `Visit ${c.label}` : c.label}
            </a>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-xs text-ccdp-cream/40 md:flex-row">
          <p>© {new Date().getFullYear()} Contemporary Creative Development Program. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to={{ pathname: "/", hash: "#contact" }} className="hover:text-ccdp-cream">Privacy Policy</Link>
            <Link to={{ pathname: "/", hash: "#contact" }} className="hover:text-ccdp-cream">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none select-none overflow-hidden">
        <p className="-mb-[2vw] text-center font-display text-[22vw] font-extrabold leading-none tracking-tighter text-white/[0.03]">CCDP</p>
      </div>
    </footer>
  );
};
