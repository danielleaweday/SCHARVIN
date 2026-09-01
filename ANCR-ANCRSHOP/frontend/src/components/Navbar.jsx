import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ onOpenAIAH }) {
  const [departments, setDepartments] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { count, setDrawerOpen } = useCart();
  const { slugs } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <>
      <div className="bg-ccdp-gradient">
        <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-2 px-5 py-2 text-center">
          <Sparkles size={13} className="text-white" />
          <p className="font-body text-[11px] font-medium tracking-wide text-white md:text-xs">
            Free shipping over $150 · Student & member pricing across the ecosystem
          </p>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "glass border-white/10" : "border-transparent bg-[#050505]"
        }`}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              data-testid="mobile-menu-open"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="flex items-center" data-testid="nav-logo" aria-label="ANCRSHOP home">
              <img src="/brand/ancrshop-nav.png" alt="ANCRSHOP" className="h-14 w-auto md:h-20" />
            </Link>
            <div className="hidden items-center gap-6 lg:flex">
              <NavDropdown departments={departments} />
              <Link to="/shop/official-ancr-collections" className="font-body text-sm text-white/70 transition-colors hover:text-white">
                Collections
              </Link>
              <Link to="/collections/limited-drops" className="font-body text-sm text-white/70 transition-colors hover:text-white">
                Drops
              </Link>
              <Link to="/collections/gift-guide" className="font-body text-sm text-white/70 transition-colors hover:text-white">
                Gift Guides
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-5">
            <button onClick={() => setSearchOpen((s) => !s)} aria-label="Search" data-testid="nav-search-toggle">
              <Search size={19} className="text-white/80 transition-colors hover:text-white" />
            </button>
            <button
              onClick={onOpenAIAH}
              aria-label="Open AIAH concierge"
              data-testid="nav-aiah-open"
              className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 transition-all hover:border-white/40 sm:flex"
            >
              <Sparkles size={14} className="text-[#ff2bd0]" />
              <span className="font-head text-xs font-medium text-white">AIAH</span>
            </button>
            <Link to="/wishlist" className="relative" aria-label="Wishlist" data-testid="nav-wishlist">
              <Heart size={19} className="text-white/80 transition-colors hover:text-white" />
              {slugs.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff2bd0] px-1 text-[9px] font-bold text-white">
                  {slugs.length}
                </span>
              )}
            </Link>
            <Link to={user ? "/account" : "/login"} aria-label="Account" data-testid="nav-account">
              <User size={19} className="text-white/80 transition-colors hover:text-white" />
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative"
              aria-label="Open bag"
              data-testid="nav-cart"
            >
              <ShoppingBag size={19} className="text-white/80 transition-colors hover:text-white" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0a44ff] px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={submitSearch}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-5 py-4 md:px-10">
                <Search size={20} className="text-white/40" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search everything creators need…"
                  data-testid="nav-search-input"
                  className="w-full bg-transparent font-body text-lg text-white placeholder:text-white/30 focus:outline-none"
                />
                <button type="submit" className="font-head text-sm text-white/60 hover:text-white">
                  Search
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#050505] lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <img src="/brand/ancrshop-nav.png" alt="ANCRSHOP" className="h-12 w-auto" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="mobile-menu-close">
                <X size={24} />
              </button>
            </div>
            <div className="h-[calc(100vh-64px)] overflow-y-auto px-5 py-6">
              <form onSubmit={submitSearch} className="mb-6 flex items-center gap-2 rounded-full border border-white/15 px-4 py-3">
                <Search size={18} className="text-white/40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-transparent font-body text-sm focus:outline-none"
                />
              </form>
              <p className="mb-3 font-body text-xs uppercase tracking-[0.2em] text-white/40">Marketplaces</p>
              <div className="space-y-1">
                {departments.map((d) => (
                  <Link
                    key={d.slug}
                    to={`/shop/${d.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-white/5 py-3 font-head text-base"
                  >
                    {d.name}
                    <ChevronRight size={16} className="text-white/30" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavDropdown({ departments }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to="/departments"
        className="font-body text-sm text-white/70 transition-colors hover:text-white"
        data-testid="nav-marketplaces"
      >
        Marketplaces
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="glass absolute left-1/2 top-full z-50 mt-4 w-[720px] -translate-x-1/2 rounded-2xl border border-white/10 p-6"
          >
            <div className="grid grid-cols-3 gap-x-6 gap-y-1">
              {departments.map((d) => (
                <Link
                  key={d.slug}
                  to={`/shop/${d.slug}`}
                  className="rounded-lg px-3 py-2 font-body text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
