import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, CalendarClock, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS, MORE_LINKS } from "../lib/content";
import { useInquiry } from "../context/InquiryProvider";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const linkTarget = (item) => (item.path ? item.path : { pathname: "/", hash: item.hash });
const linkTestId = (item) => (item.path ? item.path.replace(/\//g, "") : item.hash.replace("#", ""));

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { openBriefing } = useInquiry();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="main-navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-white/5" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex min-h-[112px] max-w-[1440px] items-center gap-6 overflow-visible px-5 py-2 md:min-h-[128px] md:px-10">
        <Logo />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                to={linkTarget(l)}
                data-testid={`nav-link-${linkTestId(l)}`}
                className={`rounded-full px-3.5 py-2 text-sm font-medium leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ccdp-purple ${
                  l.path ? "text-ccdp-white" : "text-ccdp-cream/75 hover:text-ccdp-white"
                }`}
              >
                {l.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-testid="nav-more-trigger"
                  className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium leading-none text-ccdp-cream/75 transition-colors hover:text-ccdp-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ccdp-purple"
                >
                  More <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-ccdp-charcoal text-ccdp-cream"
              >
                {MORE_LINKS.map((l) => (
                  <DropdownMenuItem key={l.label} asChild>
                    <Link
                      to={linkTarget(l)}
                      data-testid={`nav-more-${linkTestId(l)}`}
                      className="cursor-pointer text-sm text-ccdp-cream/80 focus:bg-white/10 focus:text-ccdp-white"
                    >
                      {l.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <span className="hidden h-7 w-px bg-white/12 xl:block" aria-hidden="true" />

          <button
            type="button"
            onClick={openBriefing}
            data-testid="nav-briefing-btn"
            className="hidden items-center gap-2 rounded-full bg-ccdp-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-ccdp-purple/20 transition-transform duration-300 hover:-translate-y-0.5 xl:inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ccdp-black focus-visible:ring-ccdp-purple"
          >
            <CalendarClock className="h-4 w-4" />
            Schedule a Briefing
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <button data-testid="mobile-menu-trigger" aria-label="Open menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-ccdp-cream xl:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto border-l border-white/10 bg-ccdp-charcoal p-0 text-ccdp-cream">
              <div className="flex min-h-full flex-col p-6">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <Logo />
                <div className="mt-8 flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <SheetClose asChild key={l.label}>
                      <Link to={linkTarget(l)} data-testid={`mobile-nav-link-${linkTestId(l)}`}
                        className="rounded-xl px-3 py-2.5 font-display text-2xl font-medium tracking-tight text-ccdp-cream/80 transition-colors hover:text-gradient">
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-3 h-px bg-white/10" />
                  {MORE_LINKS.map((l) => (
                    <SheetClose asChild key={l.label}>
                      <Link to={linkTarget(l)} data-testid={`mobile-more-link-${linkTestId(l)}`}
                        className="rounded-xl px-3 py-2 text-base font-medium text-ccdp-cream/65 transition-colors hover:text-ccdp-white">
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
                <SheetClose asChild>
                  <button type="button" onClick={openBriefing} data-testid="mobile-briefing-btn"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-ccdp-gradient px-6 py-4 text-sm font-semibold text-white">
                    <CalendarClock className="h-4 w-4" />
                    Schedule a Briefing
                  </button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};
