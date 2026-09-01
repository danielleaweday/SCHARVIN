# ANCRSHOP™ — Product Requirements Document

## Original Problem Statement
Build ANCRSHOP™, the official Creator Commerce Platform inside the ANCR ecosystem — a cinematic, premium, editorial marketplace (feel: Apple Store / Nike flagship / B&H / Sweetwater / MasterClass) where creators, students, educators and businesses buy everything to learn, create, launch and grow a creative career. Not a merch store; a destination.

## Architecture
- **Backend**: FastAPI (modular routers), MongoDB (motor). Modules: `auth.py`, `catalog.py`, `commerce.py`, `payments.py`, `aiah.py`, `admin.py`, `seed.py`, `db.py`, `server.py`.
- **Frontend**: React 19 + React Router 7, TailwindCSS, framer-motion, shadcn/ui, lucide-react. Contexts: Auth, Cart, Wishlist.
- **Auth**: JWT (httpOnly cookies) email/password, role-based (guest/customer/student/creator/artist/faculty/staff/vendor/seller/admin/superadmin). Architected for future SSO/OAuth. Products carry `vendor_id`/`vendor_name` → multi-vendor marketplace ready.
- **Payments**: Stripe (claimable sandbox, Flow A) with server-validated cart totals. Payment layer isolated for future providers (Apple/Google/PayPal/Shop Pay shown in UI).
- **AI**: AIAH concierge via Emergent Universal LLM key (openai gpt-5.4), returns conversational reply + real catalog product recommendations.
- **Media**: Branded gradient placeholder system (CCDP gradient + lucide icons) — no stock/AI product imagery, easily replaceable (per user constraint).

## Core Requirements (static)
- 19 department storefronts, ecosystem brand collections, editorial campaigns, featured collections, limited drops, gift guides.
- Buyer experience: browse, filter/sort, search, PDP w/ variants + reviews, wishlist, cart drawer, checkout, order tracking, loyalty points/tiers.
- AI concierge for natural-language shopping & bundle building.
- Admin: dashboard stats, product CRUD + inventory, orders + fulfillment, coupons, customers.

## Implemented (2026-06-07)
- Cinematic homepage (hero campaign, 19-marketplace grid, product rails, AIAH banner).
- Departments index; department/shop listing with filters, sort, search; collection pages.
- PDP: variants, quantity, add-to-bag, wishlist, reviews (auth-gated), related products, recently-viewed.
- Cart drawer + full cart page; server-validated `/cart/quote` (shipping free >$150 or digital-only, 8% tax, coupons).
- Checkout → real Stripe hosted checkout; `/payment/success` polls status, marks order paid, grants loyalty points.
- JWT auth (register/login/logout/me/refresh, brute-force lockout), seeded admin + demo creator.
- AIAH concierge (LLM) with contextual product recommendations.
- Admin console: stats/inventory alerts/revenue-by-department, product CRUD + inline stock, orders + fulfillment status, coupons CRUD, customers list.
- Seeded catalog: 141 products across 19 departments, 11 ecosystem + 6 partner brands, 7 collections, 3 campaigns, 3 promo codes.

## Backlog / Remaining
- **P1**: Real Apple/Google/PayPal/Shop Pay methods; Stripe Tax (currently flat 8% estimate in-app); vendor onboarding + seller dashboards + payouts; digital product delivery/downloads; back-in-stock & subscriptions.
- **P2**: Bundle builder UI, product comparison, gift registry, gift cards, rewards redemption, streaming AIAH responses, campaign/collection management in admin, review moderation.

## Test Credentials
- Admin: admin@ancrshop.com / ANCRadmin2026!
- Demo: creator@ancrshop.com / creator123
- Stripe test card: 4242 4242 4242 4242
- Promo: CREATOR10, STUDENT15, ANCR25
