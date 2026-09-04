# ANCRSHOP — Functional Requirements

**App folder:** `ANCR-ANCRSHOP`
**APPNAME:** `ANCRSHOP`
**Derived from:** `backend/{server,auth,catalog,commerce,payments,admin,aiah,db,seed}.py`, `frontend/src/**`
**Stack observed:** FastAPI (modular routers) + Motor/MongoDB; bcrypt + JWT (HS256) in httpOnly cookies; Stripe Checkout; React + React Router + axios + Sonner
**Date of extraction:** 2026-09-03

---

## 1. FUNCTIONAL REQUIREMENTS

### 1.1 Startup & platform

**REQ-ANCRSHOP-001**
**Given** the application starts
**When** the `startup` handler runs
**Then** unique indexes are created on `users.email`, `products.slug` and `orders.order_number`, a non-unique index on `products.department`, then `seed_admin()`, `seed_catalog()` and `refresh_campaigns()` run in sequence.

**REQ-ANCRSHOP-002**
**Given** `seed_admin()` runs
**When** the configured admin (`ADMIN_EMAIL`, default `admin@ancrshop.com`) does not exist
**Then** it is created with role `superadmin` and tier `Founder`. If it exists but the configured password (`ADMIN_PASSWORD`, default `admin123`) no longer verifies, **the stored hash is silently overwritten on every startup**.

**REQ-ANCRSHOP-003**
**Given** `seed_admin()` runs
**When** `creator@ancrshop.com` is absent
**Then** a demo customer is created with password `creator123`, role `creator`, 1,240 loyalty points and tier `Creator`.

**REQ-ANCRSHOP-004**
**Given** `GET /api/`
**When** called
**Then** it returns `{"message": "ANCRSHOP API online", "status": "ok"}` without authentication.

**REQ-ANCRSHOP-005**
**Given** the CORS middleware
**When** configured
**Then** origins are restricted to `[FRONTEND_URL, "http://localhost:3000"]` with credentials allowed — a genuine allow-list, required because auth uses cookies.

**REQ-ANCRSHOP-006**
**Given** any serialised document
**When** `serialize()` runs
**Then** `_id` is renamed to `id` as a string and `password_hash` is removed.

### 1.2 Registration & authentication

**REQ-ANCRSHOP-007**
**Given** `POST /api/auth/register`
**When** the email already exists
**Then** it raises **400 `"An account with this email already exists"`**. The email is lower-cased and trimmed first.

**REQ-ANCRSHOP-008**
**Given** a registration payload containing a `role`
**When** the handler evaluates it
**Then** the role is accepted only if it is in `VALID_ROLES` (`guest, customer, student, creator, artist, faculty, staff, vendor, seller, admin, superadmin`) **and is not `admin` or `superadmin`**; anything else — including an attempted self-elevation — silently becomes `customer`.

**REQ-ANCRSHOP-009**
**Given** a successful registration
**When** the document is created
**Then** `loyalty_points` starts at 0 and `loyalty_tier` at `"Explorer"`, both auth cookies are set, and the user is returned without `_id` or `password_hash`.

**REQ-ANCRSHOP-010**
**Given** the `RegisterReq` model
**When** validated
**Then** `email` must be a valid address and `name` and `password` must be present — **but `password` carries no minimum length**, so a one-character password is accepted.

**REQ-ANCRSHOP-011**
**Given** `POST /api/auth/login`
**When** it runs
**Then** a lockout identifier of `{client_ip}:{email}` is built and `login_attempts` is consulted. If the stored `count >= 5` and `locked_until` is still in the future, it raises **429 `"Too many failed attempts. Try again in a few minutes."`** before any password check.

**REQ-ANCRSHOP-012**
**Given** a failed login
**When** the handler records it
**Then** `count` is incremented and, once it reaches 5, `locked_until` is set to **15 minutes** ahead; the response is **401 `"Invalid email or password"`** for both an unknown email and a wrong password.

**REQ-ANCRSHOP-013**
**Given** a successful login
**When** it completes
**Then** the `login_attempts` record for that identifier is **deleted**, resetting the counter, and both cookies are set.

**REQ-ANCRSHOP-014**
**Given** the lockout is keyed on `{client_ip}:{email}`
**When** an attacker varies either component
**Then** the counter resets — the lockout does not protect a single account across IPs, nor a single IP across accounts.

**REQ-ANCRSHOP-015**
**Given** auth cookies are set
**When** `set_auth_cookies` runs
**Then** `access_token` is `httponly, secure, samesite=none` with a **12-hour** max-age and `refresh_token` with a **7-day** max-age.

**REQ-ANCRSHOP-016**
**Given** a protected endpoint
**When** `get_current_user` runs
**Then** it reads the `access_token` cookie, falling back to an `Authorization: Bearer` header; absence raises **401 `"Not authenticated"`**, a non-access `type` raises **401 `"Invalid token type"`**, an unknown `sub` raises **401 `"User not found"`**, expiry raises **401 `"Token expired"`** and any other JWT error **401 `"Invalid token"`**.

**REQ-ANCRSHOP-017**
**Given** `get_optional_user`
**When** authentication fails for any reason
**Then** it returns `None` rather than raising, allowing guest access to checkout, product detail, recommendations and AIAH.

**REQ-ANCRSHOP-018**
**Given** `require_admin`
**When** the authenticated user's role is not `admin` or `superadmin`
**Then** it raises **403 `"Admin access required"`**. Every route in `admin.py` depends on it.

**REQ-ANCRSHOP-019**
**Given** `POST /api/auth/logout`
**When** called
**Then** both cookies are deleted and `{"ok": true}` returned. **The endpoint has no auth dependency** and the tokens are never invalidated server-side.

**REQ-ANCRSHOP-020**
**Given** `POST /api/auth/refresh`
**When** called
**Then** a missing cookie raises **401 `"No refresh token"`**, a non-refresh `type` raises **401 `"Invalid token type"`**, an unknown `sub` raises **401 `"User not found"`** and a malformed token **401 `"Invalid refresh token"`**; success issues a fresh 12-hour access cookie.

**REQ-ANCRSHOP-021**
**Given** the refresh endpoint exists
**When** the frontend receives a 401
**Then** **it never calls `/auth/refresh`** — there is no axios interceptor, so a session ends after 12 hours despite the 7-day refresh cookie.

### 1.3 Catalog browsing

**REQ-ANCRSHOP-022**
**Given** `GET /api/departments`, `/brands`, `/campaigns` or `/collections`
**When** called
**Then** each returns its collection unauthenticated; departments are sorted by name, campaigns by `order`, and collections accept an optional `featured` boolean filter.

**REQ-ANCRSHOP-023**
**Given** `GET /api/collections/{slug}`
**When** the slug is unknown
**Then** it raises **404 `"Collection not found"`**; otherwise the collection is returned with its active products hydrated from `product_slugs`.

**REQ-ANCRSHOP-024**
**Given** `GET /api/products`
**When** called
**Then** it always constrains to `active: true` and accepts `department`, `brand` (matched against `brand_key`), `category`, `badge`, `is_digital`, `in_stock` (as `stock > 0`), `min_price`/`max_price` (as a `$gte`/`$lte` range), and `q`.

**REQ-ANCRSHOP-025**
**Given** a `q` search term
**When** the query is built
**Then** it becomes a case-insensitive `$regex` across `name`, `brand`, `category`, `tags` and `department_name`. **The term is not escaped**, so regex metacharacters in user input are interpreted as pattern syntax rather than literals.

**REQ-ANCRSHOP-026**
**Given** a `sort` parameter
**When** it is mapped
**Then** `featured` and `trending` both sort by `sold_count` descending, `newest` by `created_at`, `price-asc`/`price-desc` by price, `rating` by rating. **An unrecognised value silently falls back to `featured`.**

**REQ-ANCRSHOP-027**
**Given** a product listing request
**When** it responds
**Then** it returns `{items, total, page, limit, pages}` with `pages = ceil(total / limit)`, `page` defaulting to 1 and `limit` to 24. **Neither `page` nor `limit` is bounds-checked** — `page=0` produces a negative skip and `limit` is unbounded.

**REQ-ANCRSHOP-028**
**Given** `GET /api/products/facets`
**When** called with an optional `department`
**Then** it returns sorted distinct `category` and `brand` values across active products in that scope.

**REQ-ANCRSHOP-029**
**Given** `GET /api/products/{slug}`
**When** the slug is unknown
**Then** it raises **404 `"Product not found"`**; otherwise the product is returned with up to 50 reviews (newest first) and 4 related products from the same department.

**REQ-ANCRSHOP-030**
**Given** `GET /api/products/{slug}`
**When** the product exists but is inactive
**Then** **it is still returned** — the detail endpoint does not filter on `active`, unlike the listing and related-products queries.

**REQ-ANCRSHOP-031**
**Given** `GET /api/recommendations`
**When** called
**Then** it returns `limit` (default 8) active products chosen by a Mongo `$sample` aggregation — **uniformly random, with no personalisation**, despite accepting an optional user.

### 1.4 Reviews

**REQ-ANCRSHOP-032**
**Given** `POST /api/products/{slug}/reviews`
**When** the caller is unauthenticated
**Then** it raises **401**; the UI catches this and toasts `"Please sign in to leave a review"`.

**REQ-ANCRSHOP-033**
**Given** an authenticated review submission
**When** the handler runs
**Then** an unknown slug raises **404 `"Product not found"`**; otherwise `rating` is clamped to 1–5 via `max(1, min(5, rating))`, the review is stored with the reviewer's id and name, the product's `rating` is recomputed as the mean of all its reviews rounded to 1 decimal, and `review_count` is incremented.

**REQ-ANCRSHOP-034**
**Given** the review form
**When** it renders
**Then** the title and body inputs are `required`; on success a `"Review submitted"` toast is shown and the product is re-fetched.

**REQ-ANCRSHOP-035**
**Given** a user who has already reviewed a product
**When** they submit again
**Then** **a second review is created** — there is no one-review-per-user constraint, no purchase verification and no edit or delete endpoint.

**REQ-ANCRSHOP-036**
**Given** `review_count` is updated
**When** the handler runs
**Then** it is set to `p.get("review_count", 0) + 1` from the product document read **before** the insert, while `rating` is recomputed from a fresh query — so the two fields are maintained by different mechanisms and can diverge under concurrency.

### 1.5 Cart & pricing

**REQ-ANCRSHOP-037**
**Given** the cart
**When** items are added
**Then** they are held in React state and mirrored to `localStorage["ancrshop_cart"]` on every change; the cart survives reload and is never sent to the server for storage.

**REQ-ANCRSHOP-038**
**Given** a product is added
**When** `addItem` runs
**Then** identity is keyed on `slug + JSON.stringify(variant)`, so the same product with different variants occupies separate lines and a repeat add increments quantity; the cart drawer then opens.

**REQ-ANCRSHOP-039**
**Given** the cart changes
**When** `refreshQuote` runs
**Then** it is **debounced by 250 ms**; an empty cart sets the quote to `null` without a request, and any request failure also sets the quote to `null` with no user-visible error.

**REQ-ANCRSHOP-040**
**Given** `POST /api/cart/quote`
**When** it prices the cart
**Then** each line is re-looked-up by `slug` with `active: true` and priced from **the database, not the client** — a line whose slug is missing or inactive is **silently dropped from the quote** rather than reported.

**REQ-ANCRSHOP-041**
**Given** a cart line
**When** quantity is evaluated
**Then** it is coerced by `max(1, int(quantity))`, so zero or negative quantities become 1. **Stock is not checked at quote time**, so a quantity exceeding available stock prices normally.

**REQ-ANCRSHOP-042**
**Given** a coupon code is supplied
**When** it is applied
**Then** the code is upper-cased and must match an `active` coupon whose `min_order` is met by the subtotal; a `percent` coupon discounts `subtotal × value / 100` and any other type discounts `min(value, subtotal)`. **A code that fails either check is silently ignored** and the quote returns with `coupon: null`.

**REQ-ANCRSHOP-043**
**Given** totals are computed
**When** the quote is built
**Then** shipping is **$0.00** if the post-discount subtotal is ≥ $150 or the cart is entirely digital, otherwise **$9.99**; tax is a flat **8%** of the discounted subtotal; and `total = taxable + shipping + tax`. **Tax is not calculated by jurisdiction and no address is collected before pricing.**

**REQ-ANCRSHOP-044**
**Given** `POST /api/coupons/validate`
**When** called
**Then** an unknown or inactive code raises **404 `"Invalid or expired code"`**, an unmet minimum raises **400 `"Requires a minimum order of $N"`**, and success returns the coupon document. **This endpoint requires no authentication**, so codes can be enumerated.

**REQ-ANCRSHOP-045**
**Given** a coupon document
**When** it is validated
**Then** **no expiry date, usage limit or per-customer limit is checked** — `active` and `min_order` are the only constraints in the model.

**REQ-ANCRSHOP-046**
**Given** the cart page or drawer
**When** the user changes a quantity
**Then** `updateQty` clamps to a minimum of 1; `removeItem` removes by index; `clear()` empties items, quote and coupon.

### 1.6 Wishlist

**REQ-ANCRSHOP-047**
**Given** a wishlist toggle
**When** the user is anonymous
**Then** the slug is toggled in local state and `localStorage["ancrshop_wishlist"]` only — **no request is made**.

**REQ-ANCRSHOP-048**
**Given** a wishlist toggle
**When** the user is signed in
**Then** the local list is toggled **and** `POST /api/wishlist/{slug}` is fired; its result is discarded via `.catch(() => {})` and the local list is never reconciled with the server's response.

**REQ-ANCRSHOP-049**
**Given** a user signs in
**When** the wishlist effect runs
**Then** `GET /api/wishlist` is fetched and the server slugs are **unioned** into the local list. **This is a merge-only reconciliation** — an item removed on another device reappears after the union, and there is no delete-side sync.

**REQ-ANCRSHOP-050**
**Given** `POST /api/wishlist/{slug}`
**When** it runs
**Then** the slug is removed if present or appended if absent, the document is upserted, and `{added, slugs}` is returned. **The slug is never validated against an existing product.**

**REQ-ANCRSHOP-051**
**Given** `GET /api/wishlist`
**When** called
**Then** it returns the hydrated active products for the stored slugs — so a slug for an inactive or deleted product is silently omitted from the response while remaining in the stored list.

### 1.7 Checkout & payment

**REQ-ANCRSHOP-052**
**Given** the checkout page
**When** the cart is empty
**Then** an empty-cart state renders instead of the form.

**REQ-ANCRSHOP-053**
**Given** the checkout form
**When** the user submits without an email
**Then** a `"Please enter your email"` toast is shown and no request is made. **`name` and `address` are collected but neither is required nor sent to the API** — `CheckoutReq` accepts only `items`, `coupon_code`, `origin_url`, `email` and `shipping_name`, and the frontend never sends `address`.

**REQ-ANCRSHOP-054**
**Given** `POST /api/payments/checkout`
**When** it runs
**Then** the cart is re-priced server-side via `price_cart`; an empty resulting line set raises **400 `"Your cart is empty"`**.

**REQ-ANCRSHOP-055**
**Given** a valid checkout
**When** Stripe line items are built
**Then** they are constructed **from the server-validated quote**, not from client-supplied prices, with product names truncated to 127 characters, plus separate line items for shipping and estimated tax so the Stripe total matches the quote.

**REQ-ANCRSHOP-056**
**Given** the quote carries a discount
**When** the session is created
**Then** a one-off Stripe coupon is created for the discount amount. **If that call raises, the exception is swallowed by a bare `except: pass` and the session is created at full price** — the customer is charged more than the quote showed, with no error surfaced.

**REQ-ANCRSHOP-057**
**Given** the Stripe session is created
**When** it succeeds
**Then** an `orders` document is inserted with a generated `ANCR-XXXXXXXX` order number, the caller's id (or `None` for a guest), the priced lines and totals, `status: "pending"`, `payment_status: "pending"`, `fulfillment_status: "unfulfilled"` and the session id; a parallel `payment_transactions` record is written with `status: "initiated"`.

**REQ-ANCRSHOP-058**
**Given** Stripe raises a `StripeError`
**When** session creation fails
**Then** it raises **500 `"Payment error: {message}"`** — **the raw Stripe error text is echoed to the client** and no order record is created.

**REQ-ANCRSHOP-059**
**Given** a checkout is created
**When** the caller is unauthenticated
**Then** it succeeds as a guest order — `user_id` is `None`, metadata records `"guest"`, and the order is **unreachable afterwards** because both `/orders` and `/orders/{n}` filter on `user_id`.

**REQ-ANCRSHOP-060**
**Given** the user is redirected to Stripe and returns
**When** `/payment/success` mounts
**Then** it polls `GET /api/payments/status/{session_id}` up to **8 times**; on `paid` it marks the order complete and calls `clear()` exactly once (guarded by a ref); on `failed` or `expired` it shows the failure state.

**REQ-ANCRSHOP-061**
**Given** `GET /api/payments/status/{session_id}`
**When** the local record is not yet `paid`
**Then** it retrieves the live Stripe session and, if `payment_status == "paid"` or `status == "complete"`, calls `_mark_paid`. An unknown session id raises **404 `"Transaction not found"`**; a `StripeError` is swallowed and the stale local status is returned.

**REQ-ANCRSHOP-062**
**Given** `_mark_paid` runs
**When** it updates
**Then** both the order and the transaction are updated **only where `payment_status != "paid"`**, making the operation idempotent; loyalty points equal to `int(order.total)` are then `$inc`ed onto the user **only if `res.modified_count` was non-zero and the order has a `user_id`** — so a guest order grants no points.

**REQ-ANCRSHOP-063**
**Given** `POST /api/stripe/webhook`
**When** it is called
**Then** the signature is verified against `STRIPE_WEBHOOK_SECRET` and any failure raises **400 `"Invalid signature"`**; `checkout.session.completed` calls the same idempotent `_mark_paid`, and `checkout.session.expired` marks the order `expired`.

**REQ-ANCRSHOP-064**
**Given** `STRIPE_WEBHOOK_SECRET` is unset
**When** the webhook is called
**Then** signature construction fails against an empty secret and every webhook is rejected with 400 — the polling path (REQ-ANCRSHOP-061) becomes the only way an order is marked paid.

**REQ-ANCRSHOP-065**
**Given** `stripe.api_key` is configured
**When** `STRIPE_SECRET_KEY` is absent
**Then** it falls back to the literal `"sk_test_emergent"`.

**REQ-ANCRSHOP-066**
**Given** a paid order
**When** stock is considered
**Then** **no inventory is decremented at any point** — `stock` is only ever set manually through the admin console. `sold_count`, which drives the `featured` and `trending` sorts, is likewise never incremented by a purchase.

### 1.8 Orders

**REQ-ANCRSHOP-067**
**Given** `GET /api/orders`
**When** an authenticated user calls it
**Then** their orders are returned newest-first, capped at 100; an anonymous caller receives **401**.

**REQ-ANCRSHOP-068**
**Given** `GET /api/orders/{order_number}`
**When** called
**Then** the lookup is scoped to `{order_number, user_id: caller}`, so another customer's order returns **404 `"Order not found"`** rather than leaking existence.

**REQ-ANCRSHOP-069**
**Given** the account page
**When** it mounts and a user is present
**Then** `GET /api/orders` is fetched with failures swallowed by `.catch(() => {})`.

### 1.9 Admin console

**REQ-ANCRSHOP-070**
**Given** a user navigates to `/admin`
**When** the page mounts
**Then** an unauthenticated user is redirected to `/login` and an authenticated non-admin to `/`. This is a client-side guard; the API independently enforces `require_admin` (REQ-ANCRSHOP-018).

**REQ-ANCRSHOP-071**
**Given** `GET /api/admin/stats`
**When** called by an admin
**Then** it loads up to 5,000 paid orders and returns `revenue`, `total_orders`, `paid_orders`, `customers`, `products`, `low_stock` (`0 < stock <= 8`), `out_of_stock` (`stock == 0`), `aov` (revenue ÷ paid orders, or 0), the top 6 departments by revenue, and the 8 most recent orders.

**REQ-ANCRSHOP-072**
**Given** `GET /api/admin/products`
**When** called
**Then** it supports an optional case-insensitive `name` search and paginates with `page`/`limit` (default 30), returning `{items, total, pages, page}`.

**REQ-ANCRSHOP-073**
**Given** `POST /api/admin/products`
**When** a product is created
**Then** the slug is `slugify(name) + "-" + 6 hex chars` and the server fills in `currency: "usd"`, `rating: 5.0`, `review_count: 0`, empty `variants`, `vendor_id: "ancr-official"`, a features array, a SKU spec, tags derived from category and brand, `low_stock_threshold: 8` and `sold_count: 0`.

**REQ-ANCRSHOP-074**
**Given** a newly created product
**When** it is first listed
**Then** it carries **`rating: 5.0` with zero reviews** — a five-star rating shown before anyone has rated it.

**REQ-ANCRSHOP-075**
**Given** `PUT /api/admin/products/{id}`
**When** called
**Then** the body is an **untyped `dict`**: `id` and `_id` are stripped and **every remaining key is `$set` verbatim**. Any field can be written, including `slug` (breaking the unique index contract), `price`, `sold_count` or arbitrary new keys. There is no schema validation on update.

**REQ-ANCRSHOP-076**
**Given** `PUT /api/admin/products/{id}` with an unknown id
**When** it runs
**Then** the update no-ops, the subsequent lookup returns nothing and it raises **404 `"Product not found"`** — after the write attempt, not before.

**REQ-ANCRSHOP-077**
**Given** `DELETE /api/admin/products/{id}`
**When** called
**Then** the document is **hard-deleted** and `{"ok": true}` is returned regardless of whether anything matched. Orders referencing the product retain their snapshot lines, but wishlists and collections referencing the slug silently lose it.

**REQ-ANCRSHOP-078**
**Given** `GET /api/admin/orders`
**When** called with an optional `status`
**Then** orders are filtered by `fulfillment_status` and returned newest-first, capped at 200.

**REQ-ANCRSHOP-079**
**Given** `PUT /api/admin/orders/{order_number}/fulfill`
**When** called
**Then** `fulfillment_status` is set from the body (defaulting to `"fulfilled"`) with an updated timestamp; an unknown order number raises **404 `"Order not found"`** after the write attempt. **The value is unvalidated** — any string is accepted as a fulfilment state.

**REQ-ANCRSHOP-080**
**Given** `POST /api/admin/coupons`
**When** a coupon is created
**Then** the code is upper-cased and a duplicate raises **400 `"Coupon code already exists"`**. `type` defaults to `"percent"` and is **not validated against an enum**, so an unrecognised type falls through to the fixed-amount branch at pricing time (REQ-ANCRSHOP-042).

**REQ-ANCRSHOP-081**
**Given** `DELETE /api/admin/coupons/{id}`
**When** called
**Then** the coupon is hard-deleted and `{"ok": true}` returned regardless of match.

**REQ-ANCRSHOP-082**
**Given** `GET /api/admin/customers`
**When** called
**Then** up to 200 users are returned newest-first, each with a live `order_count` of their paid orders — one count query per user per request.

**REQ-ANCRSHOP-083**
**Given** the admin console
**When** an admin edits stock inline
**Then** `PUT /api/admin/products/{id}` is called with `{stock: parseInt(value) || 0}` — **a non-numeric entry silently becomes 0**, marking the product out of stock.

### 1.10 AIAH shopping concierge

**REQ-ANCRSHOP-084**
**Given** `POST /api/aiah/chat`
**When** called
**Then** it accepts `{message, session_id?, history?}`, generates a session id when absent, and **requires no authentication** (`get_optional_user`).

**REQ-ANCRSHOP-085**
**Given** the system prompt is assembled
**When** the catalogue context is built
**Then** up to **140 active products** are injected as `slug | name | brand | price | department | category` lines, together with the last **6** history turns.

**REQ-ANCRSHOP-086**
**Given** the model is invoked
**When** the client is constructed
**Then** it uses `.with_model("openai", "gpt-5.4")` — **OpenAI, not Anthropic**, unlike every other AIAH surface in the workspace, which use `anthropic/claude-sonnet-4-5`.

**REQ-ANCRSHOP-087**
**Given** a model response
**When** it is parsed
**Then** a leading ``` fence and a `json` label are stripped, then `json.loads` extracts `reply`, `recommendations` (slugs) and `bundle_note`.

**REQ-ANCRSHOP-088**
**Given** the model call or JSON parse raises
**When** the `except` runs
**Then** the reply becomes the fixed string `"I had trouble reaching my recommendation engine just now. Tell me your goal and budget and I'll try again."`, recommendations are emptied, **and the response is still 200** — the caller cannot distinguish a real answer from a failure.

**REQ-ANCRSHOP-089**
**Given** recommended slugs are returned
**When** products are hydrated
**Then** only slugs matching **active** products resolve, and the result is re-ordered to match the model's slug order; hallucinated slugs are silently dropped.

**REQ-ANCRSHOP-090**
**Given** any chat turn
**When** it completes
**Then** the message, reply and slugs are written to `aiah_messages` with the session id and the user id (or `None`). **No endpoint ever reads this collection** — there is no conversation history retrieval.

---

## 2. TEST COVERAGE

**Test assets found**
- `backend/tests/backend_test.py` (315 lines) — 26 tests across `TestHealth`, `TestAuth`, `TestCatalog`, `TestCommerce`, `TestPayments`, `TestAIAH`, `TestAdmin`.
- `test_reports/pytest/pytest_results.xml` — **an actual recorded run: 26 tests, 1 failure, 0 errors, 8.703 s, timestamped 2026-08-07T18:44:53Z.**
- `test_result.md` — protocol boilerplate only, data section empty.
- **No frontend tests.**

> ### Recorded failure — carried forward
> **`TestAuth::test_register_and_logout` FAILED: `POST /api/auth/register` returned 500 Internal Server Error** for a fresh, valid payload (`{"email": "TEST_user_<uuid8>@example.com", "password": "Passw0rd!", "name": "Test User"}`).
> The assertion is `assert r.status_code == 200` at `tests/backend_test.py:100`. The XML captures the status but not a server traceback, and static reading of `auth.py::register` does not make the cause self-evident — the returned document contains only JSON-serialisable values after `_id` and `password_hash` are popped. **Registration is therefore the single confirmed broken user-facing flow in this application.** Note the run is dated 2026-08-07, roughly four weeks before this extraction, so it may predate later edits; it has not been re-run here. See Q1.

| Requirement | Covered | Evidence / gap |
|---|---|---|
| REQ-ANCRSHOP-001 | **Partial** | Catalogue tests passing implies seeding ran; index creation is not asserted |
| REQ-ANCRSHOP-002 | **Partial** | `test_login_admin` passes, implying the admin seed worked; the password-overwrite-on-startup path is untested |
| REQ-ANCRSHOP-003 | **Yes** | `test_login_demo` |
| REQ-ANCRSHOP-004 | **Yes** | `test_root` |
| REQ-ANCRSHOP-005, 006 | **No** | CORS and serialisation untested |
| REQ-ANCRSHOP-007 | **Blocked** | The duplicate-email assertion is at line 105 of `test_register_and_logout`, which **never reaches it** — the test fails at line 100 |
| REQ-ANCRSHOP-008 | **Blocked** | The self-elevation assertion (`role: "admin"` → `"customer"`) is at line 112 of the same failing test and is never reached. **This security control is written but unverified** |
| REQ-ANCRSHOP-009 | **Failing** | Covered by `test_register_and_logout`, which fails at this exact step |
| REQ-ANCRSHOP-010 | **No** | The absent password-length minimum is untested |
| REQ-ANCRSHOP-011, 012 | **Partial** | `test_login_bad_password` asserts `status_code in (401, 429)` — it deliberately accepts either, so it **cannot distinguish a working lockout from a plain rejection**. The 5-attempt threshold and 15-minute window are never asserted |
| REQ-ANCRSHOP-013, 014 | **No** | Counter reset on success and the IP+email keying are untested |
| REQ-ANCRSHOP-015 | **No** | Cookie flags and TTLs untested |
| REQ-ANCRSHOP-016 | **Partial** | `test_me_requires_auth` (401) and `test_me_with_session` (200); the four distinct failure details are not individually verified |
| REQ-ANCRSHOP-017 | **Partial** | Guest checkout in `test_create_checkout_session` exercises it implicitly |
| REQ-ANCRSHOP-018 | **Yes** | `test_admin_rbac` asserts a non-admin gets **403** on `/admin/stats` |
| REQ-ANCRSHOP-019 | **Blocked** | The logout assertion is the last line of the failing test |
| REQ-ANCRSHOP-020, 021 | **No** | **`/auth/refresh` is entirely untested** |
| REQ-ANCRSHOP-022 | **Yes** | `test_departments_19` and `test_collections_campaigns_recs` |
| REQ-ANCRSHOP-023 | **Partial** | Collections are fetched; the 404 branch is not tested |
| REQ-ANCRSHOP-024, 026, 027 | **Yes** | `test_products_list_and_filter` covers filters, sort and the pagination envelope |
| REQ-ANCRSHOP-025 | **No** | **The unescaped regex in `q` is untested** |
| REQ-ANCRSHOP-028 | **No** | Facets untested |
| REQ-ANCRSHOP-029 | **Yes** | `test_product_detail`. The 404 branch is not covered |
| REQ-ANCRSHOP-030 | **No** | That an inactive product is still served by slug is untested |
| REQ-ANCRSHOP-031 | **Partial** | `test_collections_campaigns_recs` asserts 200; randomness is not characterised |
| REQ-ANCRSHOP-032 | **Yes** | `test_add_review_requires_auth` asserts 401 |
| REQ-ANCRSHOP-033 – 036 | **No** | **No test ever posts a review successfully** — rating clamping, average recomputation, duplicate reviews and the `review_count` divergence are all unverified |
| REQ-ANCRSHOP-037 – 039 | **No** | Frontend cart state and debouncing untested |
| REQ-ANCRSHOP-040 | **Yes** | `test_cart_quote_no_coupon` asserts server-side pricing |
| REQ-ANCRSHOP-041 | **No** | Quantity coercion and the absent stock check are untested |
| REQ-ANCRSHOP-042 | **Yes** | `test_cart_quote_coupon_creator10` |
| REQ-ANCRSHOP-043 | **Partial** | Totals are asserted in the quote tests; the $150 shipping threshold, the digital-only exemption and the 8% rate are not individually pinned |
| REQ-ANCRSHOP-044 | **Yes** | `test_validate_coupon` |
| REQ-ANCRSHOP-045 | **No** | Absent expiry/usage limits untested |
| REQ-ANCRSHOP-046 | **No** | Frontend only |
| REQ-ANCRSHOP-047 – 049 | **No** | **The localStorage/server merge-only reconciliation is untested** — the server round-trip is covered but not the client merge |
| REQ-ANCRSHOP-050 | **Yes** | `test_wishlist_toggle` covers add and remove |
| REQ-ANCRSHOP-051 | **No** | Inactive-product omission untested |
| REQ-ANCRSHOP-052, 053 | **No** | Frontend only |
| REQ-ANCRSHOP-054 | **Yes** | `test_checkout_empty_cart` asserts 400 |
| REQ-ANCRSHOP-055, 057 | **Yes** | `test_create_checkout_session` asserts a session and order are created |
| REQ-ANCRSHOP-056 | **No** | **The swallowed Stripe-coupon failure — which would overcharge the customer — is untested** |
| REQ-ANCRSHOP-058, 059 | **No** | Stripe error propagation and the unreachable guest order are untested |
| REQ-ANCRSHOP-060 – 065 | **No** | **The entire post-payment path is untested** — status polling, `_mark_paid` idempotency, loyalty-point grant, webhook signature verification and expiry handling. No test simulates a completed payment |
| REQ-ANCRSHOP-066 | **No** | The absence of inventory decrement is untested |
| REQ-ANCRSHOP-067 | **Yes** | `test_orders_require_auth` (401) and `test_my_orders_authenticated` (200) |
| REQ-ANCRSHOP-068 | **No** | Cross-customer order isolation is untested |
| REQ-ANCRSHOP-069 – 070 | **No** | Frontend only |
| REQ-ANCRSHOP-071 | **Yes** | `test_stats` |
| REQ-ANCRSHOP-072 – 077 | **Partial** | `test_product_crud` covers create, update and delete happy paths; **the untyped `PUT` body (075), the 404-after-write ordering (076) and hard-delete side effects (077) are not exercised** |
| REQ-ANCRSHOP-078, 079 | **Partial** | `test_orders_and_customers` asserts the list; fulfilment transition and its unvalidated status are untested |
| REQ-ANCRSHOP-080, 081 | **Yes** | `test_coupon_crud` covers create, duplicate and delete |
| REQ-ANCRSHOP-082 | **Yes** | `test_orders_and_customers` |
| REQ-ANCRSHOP-083 | **No** | Frontend only |
| REQ-ANCRSHOP-084 – 090 | **Partial** | `test_chat_returns_reply` asserts 200 and a reply field — **which the error fallback also satisfies (088), so this test passes whether or not the model was reached** |

**Summary:** 90 requirements. **19 Yes**, **17 Partial**, **50 No**, **1 Failing**, **3 Blocked** (assertions that exist but are never reached because the test fails earlier). This is the only application in the workspace with a recorded test run, and it recorded a failure that has not been resolved. The largest untested area is everything after the Stripe redirect — payment confirmation, loyalty points and webhook handling.

---

## 3. SPEC GAP ANALYSIS

**Specs compared:** `memory/PRD.md`, `README.md`. **This application has no PDF specification** — unlike the ten ANCR modules with canonical Product Specification PDFs, ANCRSHOP has only its own PRD. That absence is itself the primary finding.

### (a) Specified but NOT implemented in code

| # | Spec source | Requirement | Code state |
|---|---|---|---|
| G1 | PRD "Core Requirements" | "PDP w/ **variants**" | `variants` is written as an **empty array** by admin product creation (REQ-ANCRSHOP-073) and the seed's variant data is only echoed back; the cart keys on variant (REQ-ANCRSHOP-038) but no variant carries its own price, SKU or stock. There is no variant-level inventory. |
| G2 | PRD "Core Requirements" | "**order tracking**" | Orders carry a `fulfillment_status` an admin can set to any string (REQ-ANCRSHOP-079). There is no carrier, tracking number, shipment record or customer-facing tracking view. |
| G3 | PRD "Core Requirements" | "**loyalty points/tiers**" | Points are granted on payment (REQ-ANCRSHOP-062) and a tier string is seeded, but **no tier is ever recalculated from points** and there is no redemption, expiry or benefit anywhere. |
| G4 | PRD Architecture | "Products carry `vendor_id`/`vendor_name` → **multi-vendor marketplace ready**" | Every admin-created product is hard-coded to `vendor_id: "ancr-official"` (REQ-ANCRSHOP-073). There is no vendor account, no seller role enforcement (the `vendor`/`seller` roles exist in `VALID_ROLES` but gate nothing) and no payout model. |
| G5 | PRD Architecture | "Payment layer isolated for future providers (**Apple/Google/PayPal/Shop Pay shown in UI**)" | Only Stripe Checkout exists. Any alternate method rendered in the UI is non-functional. |
| G6 | PRD Architecture | "Auth … **architected for future SSO/OAuth**" | ANCRSHOP implements a complete independent identity store. There is no ANCRID client, no OIDC and no token verification against an external issuer — the same duplication the ecosystem specifications forbid for every other module. |
| G7 | PRD P1 backlog | "**Stripe Tax** (currently flat 8% estimate in-app)" | Confirmed still a flat 8% with no jurisdiction logic and no address collected before pricing (REQ-ANCRSHOP-043, 053). |
| G8 | PRD P1 backlog | "**digital product delivery/downloads**" | `is_digital` affects only the shipping calculation. There is no fulfilment, entitlement, licence or download path for a digital purchase — a paid digital order delivers nothing. |
| G9 | PRD P1 backlog | "back-in-stock & subscriptions" | Neither exists; there is also no stock decrement to trigger a back-in-stock event (REQ-ANCRSHOP-066). |
| G10 | PRD P2 backlog | "**review moderation**" | Reviews are published immediately with no moderation queue, no purchase verification and no duplicate constraint (REQ-ANCRSHOP-035). |
| G11 | PRD P2 backlog | "campaign/collection management in admin" | Campaigns and collections are seed-only; the admin console manages products, orders, coupons and customers only. |
| G12 | PRD "Test Credentials" | Admin password `ANCRadmin2026!` | `auth.py` defaults `ADMIN_PASSWORD` to **`admin123`** (REQ-ANCRSHOP-002). The two disagree; which applies depends on the environment, and if the env value differs from the stored hash the hash is overwritten at every boot. |

### (b) Implemented but NOT mentioned in the spec

| # | Code feature | Spec status |
|---|---|---|
| E1 | **Brute-force login lockout** — 5 attempts per `{ip}:{email}`, 15-minute lock, counter cleared on success (REQ-ANCRSHOP-011 – 013). | Mentioned in the PRD's implemented list as "brute-force lockout" but with no policy specified. It is the only such control in the workspace and its keying weakness (REQ-ANCRSHOP-014) is undocumented. |
| E2 | **Untyped admin product update** — `PUT /api/admin/products/{id}` accepts an arbitrary dict and `$set`s every key, including `slug`, `sold_count` and unknown fields (REQ-ANCRSHOP-075). | Unspecified. It is the widest write surface in the application. |
| E3 | **Hard deletes** for products and coupons with no soft-delete or referential cleanup (REQ-ANCRSHOP-077, 081). | Unspecified. Products carry an `active` flag that would support soft deletion but the delete endpoint bypasses it. |
| E4 | **Guest checkout** — an order can be created with no account and is then permanently unreachable (REQ-ANCRSHOP-059). | The PRD describes buyer flows for signed-in users; guest ordering and its consequences are unspecified. |
| E5 | **AIAH runs on OpenAI `gpt-5.4`** (REQ-ANCRSHOP-086). | The PRD names it, but every other AIAH surface in the workspace uses `anthropic/claude-sonnet-4-5`. The ecosystem architecture documents describe AIAH as a single shared intelligence layer; two providers across modules is an undocumented divergence. |
| E6 | **`aiah_messages` write-only collection** (REQ-ANCRSHOP-090). | Every chat turn is persisted with user id and never read. Unspecified retention. |
| E7 | **New products default to `rating: 5.0` with zero reviews** (REQ-ANCRSHOP-074). | Unspecified, and it inflates the `rating` sort. |
| E8 | **Unauthenticated coupon validation** (REQ-ANCRSHOP-044) enabling code enumeration. | Unspecified. |
| E9 | **Wishlist merge-only sync** that resurrects removed items (REQ-ANCRSHOP-049). | The PRD lists "wishlist" with no sync semantics. |
| E10 | **Two overlapping product-search paths** — `/api/products?q=` (unescaped regex) and the same route serving `/search` in the frontend router. | Unspecified. |

---

## 4. UNCLEAR / NEEDS INPUT

**Q1 — Registration returns 500 (confirmed failing).**
The recorded run at `test_reports/pytest/pytest_results.xml` shows `POST /api/auth/register` returning 500 for a valid new account, and the failure blocks three further assertions in the same test, including the self-elevation guard. I have not re-run the suite or changed the code. Is this still reproducible against the current build? If so, the server traceback is needed — static reading of `auth.py::register` does not reveal the cause.

**Q2 — A swallowed Stripe error overcharges the customer.**
If `stripe.Coupon.create` raises, the bare `except: pass` lets the session proceed **without the discount** (REQ-ANCRSHOP-056), so the customer is charged more than the quote displayed and no error is surfaced. Should this fail the checkout, retry, or fall back to a line-item adjustment?

**Q3 — Inventory is never decremented.**
A paid order does not reduce `stock` or increment `sold_count` (REQ-ANCRSHOP-066), so stock is admin-maintained only and the `featured`/`trending` sorts never move. Where should the decrement happen — at `_mark_paid`, at fulfilment, or via a reservation at checkout — and should quote-time stock validation be added (REQ-ANCRSHOP-041)?

**Q4 — Digital orders deliver nothing.**
`is_digital` only waives shipping (G8). What is the intended delivery — a download link on the order, an entitlement record, or a licence key — and does it belong here or in another module?

**Q5 — Guest orders are unreachable.**
A guest can complete a purchase, but `/orders` and `/orders/{n}` both filter on `user_id`, so the buyer can never view it and no email confirmation exists (REQ-ANCRSHOP-059). Should guest checkout be removed, or should orders be retrievable by order number plus email?

**Q6 — Admin product update accepts any field.**
`PUT /api/admin/products/{id}` `$set`s an arbitrary dict including `slug` (REQ-ANCRSHOP-075). Should it be constrained to the `ProductUpsert` schema, and should `slug` be immutable after creation?

**Q7 — Hard deletes.**
Products and coupons are removed outright (REQ-ANCRSHOP-077, 081), orphaning wishlist and collection references. Should deletion set `active: false` instead?

**Q8 — Coupon rules.**
Coupons have no expiry, no usage cap and no per-customer limit, `type` is unvalidated, and validation is public (REQ-ANCRSHOP-042, 044, 045, 080). Which of these constraints are needed, and should validation require a session?

**Q9 — Tax and address.**
Tax is a flat 8% applied before any address is collected, and the checkout form's `address` field is never sent to the API (REQ-ANCRSHOP-043, 053). Is Stripe Tax the intended path, and should the address be captured by Stripe Checkout or by ANCRSHOP?

**Q10 — Fulfilment states.**
`fulfillment_status` accepts any string (REQ-ANCRSHOP-079). What is the state machine, and should transitions notify the customer? There is currently no notification of any kind in the application.

**Q11 — Loyalty tiers.**
Points accrue as `int(order.total)` but tiers never recalculate and points are never redeemable (G3). What are the tier thresholds, benefits and redemption mechanics?

**Q12 — Review integrity.**
Reviews require only a session — no purchase verification, no duplicate constraint, no edit, no delete, no moderation (REQ-ANCRSHOP-035, G10). Which of these should v1 enforce?

**Q13 — Unescaped search regex.**
`q` is interpolated into `$regex` without escaping (REQ-ANCRSHOP-025), unlike ANCRMEDIA which uses `re.escape`. Should this be escaped? Note a pathological pattern is also a query-performance risk.

**Q14 — AIAH provider divergence.**
ANCRSHOP's concierge uses OpenAI `gpt-5.4` while every other AIAH surface uses Claude Sonnet 4.5 (E5). Is that deliberate for this module, or should it align with the ecosystem's shared intelligence layer?

**Q15 — AIAH failures are indistinguishable from answers.**
A model or parse failure returns 200 with a fixed apology string (REQ-ANCRSHOP-088), which is also what the one AIAH test asserts against. Should failures return a distinguishable status or flag so the UI — and the test — can tell them apart?

**Q16 — Admin password of record.**
The PRD documents `ANCRadmin2026!`; the code defaults to `admin123` and overwrites the stored hash whenever the env value stops matching (G12, REQ-ANCRSHOP-002). Which is authoritative, and should the startup overwrite be removed?

**Q17 — Wishlist sync direction.**
Sign-in unions server slugs into the local list, so removals never propagate (REQ-ANCRSHOP-049). Should the server be authoritative on login, or should removals be synced explicitly?

**Q18 — Commerce ownership.**
`docs/ANCR_ECOSYSTEM_OVERVIEW.md` records that CCDP Web also implements customers, catalog, checkout and orders, and recommends naming one commerce system of record. ANCRSHOP has no canonical Product Specification PDF while the ten core modules do. Is ANCRSHOP the intended system of record, and should it receive a canonical spec?

**Q19 — Guest AIAH access.**
`/api/aiah/chat` is unauthenticated and injects 140 catalogue rows per call (REQ-ANCRSHOP-084, 085). Is anonymous access intended, and is any rate limiting needed given each call incurs model cost?
