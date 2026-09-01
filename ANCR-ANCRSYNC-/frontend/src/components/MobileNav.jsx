import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  ["Dashboard", "/dashboard"],
  ["Readiness", "/readiness"],
  ["Portfolio", "/portfolio"],
  ["Resume", "/resume"],
  ["Jobs", "/jobs"],
  ["Internships", "/internships"],
  ["Auditions", "/auditions"],
  ["Projects", "/projects"],
  ["Employer Network", "/employer-network"],
  ["Applications", "/applications"],
  ["Interviews", "/interviews"],
  ["Graduate Outcomes", "/graduate-outcomes"],
  ["Career Coach (AIAH)", "/coach"],
  ["Settings", "/settings"],
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  return (
    <>
      <div
        data-testid="mobile-topbar"
        className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 border-b hair px-5 flex items-center justify-between"
        style={{ background: "#050505" }}
      >
        <Link to="/dashboard" className="flex items-center gap-2" data-testid="mobile-logo">
          <Logo size={32} />
          <div className="font-display text-lg leading-none">ANCR<span className="font-mono text-[9px] uppercase tracking-[0.2em] ml-1">Launch™</span></div>
        </Link>
        <button data-testid="mobile-menu-btn" onClick={() => setOpen(true)}>
          <Menu strokeWidth={1.25} />
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black">
          <div className="h-16 px-5 flex items-center justify-between border-b hair">
            <div className="flex items-center gap-2">
              <Logo size={28} />
              <div className="font-display text-lg leading-none">ANCRLaunch™</div>
            </div>
            <button data-testid="mobile-menu-close" onClick={() => setOpen(false)}>
              <X strokeWidth={1.25} />
            </button>
          </div>
          <nav className="p-6">
            {NAV.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-3 border-b hair text-[15px] ${isActive ? "text-white" : "text-white/60"}`
                }
              >
                {label}
              </NavLink>
            ))}
            <button
              data-testid="mobile-logout"
              onClick={logout}
              className="mt-8 w-full py-3 border hair-strong text-[11px] tracking-[0.2em] uppercase font-mono"
            >
              Sign out {user ? `— ${user.role.replace("_", " ")}` : ""}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
