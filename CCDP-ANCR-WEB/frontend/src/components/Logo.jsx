import { Link } from "react-router-dom";

// Complete official CCDP logo used as one intact image (wordmark + emblem + program name + Create • Collaborate • Develop • Propel).
export const Logo = ({ className = "" }) => {
  return (
    <Link
      to="/"
      data-testid="brand-logo"
      className={`header-logo-wrapper flex shrink-0 items-center ${className}`}
      aria-label="CCDP — Contemporary Creative Development Program, home"
    >
      <img
        src="/brand/ccdp-header-full.png"
        alt="CCDP — Contemporary Creative Development Program. Create, Collaborate, Develop, Propel."
        className="header-logo block h-[72px] w-auto max-w-full object-contain sm:h-[84px] md:h-[98px]"
        draggable="false"
      />
    </Link>
  );
};
