import { Link } from "react-router-dom";

const BRANDS = [
  "CCDP™", "ANCR™", "CYNAIAH™", "ANCRLAB™", "ANCRSYNC™", "ANCRVIEW™",
  "ANCRWAV™", "VIEARTA™", "VAULTA™", "COHEIR™", "INHEIRA™",
];

const COLS = [
  {
    title: "Shop",
    links: [
      ["New Arrivals", "/collections/new-arrivals"],
      ["Trending Now", "/collections/trending-now"],
      ["Creator Picks", "/collections/creator-picks"],
      ["Limited Drops", "/collections/limited-drops"],
      ["All Marketplaces", "/departments"],
    ],
  },
  {
    title: "Ecosystem",
    links: [
      ["Official ANCR Collections", "/shop/official-ancr-collections"],
      ["CCDP Student Store", "/shop/ccdp-student-store"],
      ["Studio & Production", "/shop/studio-production"],
      ["Software Marketplace", "/shop/software-marketplace"],
      ["Creator Marketplace", "/shop/marketplace"],
    ],
  },
  {
    title: "Support",
    links: [
      ["My Account", "/account"],
      ["Wishlist", "/wishlist"],
      ["Track Orders", "/account"],
      ["AIAH Concierge", "/"],
      ["Admin", "/admin"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/10 bg-[#050505]">
      <div className="relative overflow-hidden border-b border-white/10 py-6">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-head text-2xl font-bold text-white/10">
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-block" aria-label="ANCRSHOP home">
              <img src="/brand/ancrshop-nav.png" alt="ANCRSHOP" className="h-24 w-auto md:h-28" />
            </Link>
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-white/50">
              The official Creator Commerce Platform. Everything you need to learn, create, build,
              launch, perform and grow a sustainable creative career — in one trusted marketplace.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-white/40">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="font-body text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <p className="font-body text-xs text-white/40">
            © {new Date().getFullYear()} ANCRSHOP™ — part of the ANCR ecosystem. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/40">
            Apple Pay · Google Pay · PayPal · Shop Pay · Cards · Gift Cards
          </p>
        </div>
      </div>
    </footer>
  );
}
