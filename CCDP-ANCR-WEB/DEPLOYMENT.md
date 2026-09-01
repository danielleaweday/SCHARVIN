# CCDP Institutional Platform — Deployment Guide

A production deployment guide for the Chicago/Contemporary Creative Development
Program (CCDP) institutional website + Institutional Relationship Management (CRM).

Stack: **React** (static SPA) · **FastAPI** (Python) · **MongoDB**.
Optional integrations (activate automatically when configured, **no rebuild required
for the backend**): **Resend** email, **Google Sheets** live backup, external **scheduling** URL.

---

## 1. Architecture at a glance

```
                    ┌─────────────────────────────┐
   Browser  ──────► │  Reverse proxy / TLS (Nginx, │
                    │  Caddy, Traefik, or ALB)     │
                    └───────┬──────────────┬───────┘
                            │ /            │ /api/*
                            ▼              ▼
                    ┌──────────────┐  ┌──────────────┐
                    │  Frontend    │  │  Backend     │
                    │  Nginx :80   │  │  FastAPI     │
                    │  (static)    │  │  uvicorn:8001│
                    └──────────────┘  └──────┬───────┘
                                             │
                                      ┌──────▼───────┐
                                      │  MongoDB     │
                                      │  :27017      │
                                      └──────────────┘
   External (optional): Resend API · Google Sheets API · Scheduling page
```

Full details in **ARCHITECTURE.md**.

**Routing rule (critical):** all requests to `/api/*` must reach the backend
(port `8001`); everything else serves the frontend SPA (`index.html` fallback).

---

## 2. Prerequisites

- A Linux server with a domain name and TLS certificate (Let's Encrypt recommended).
- One of:
  - **Docker + Docker Compose** (recommended — see §4), or
  - Manual runtime: Python 3.11+, Node 20+, MongoDB 6/7, a process manager
    (systemd/supervisor) and a reverse proxy (§5).

---

## 3. Configuration

Copy the example env files and fill in real values:

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

Generate strong secrets:

```bash
# JWT signing secret
python3 -c "import secrets; print(secrets.token_hex(32))"
# Admin password (or use your password manager)
python3 -c "import secrets,string; a=string.ascii_letters+string.digits; print(''.join(secrets.choice(a) for _ in range(24)))"
```

See **§7 Environment variables** for every key. The admin account is created (or its
password updated) automatically on backend startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
— **no credentials are hardcoded in the codebase.**

---

## 4. Deploy with Docker Compose (recommended)

From the project root:

```bash
# 1. Fill backend/.env (see §7) and set the public API URL for the frontend build:
export REACT_APP_BACKEND_URL="https://your-domain.com"

# 2. Build and start
docker compose up -d --build

# 3. Check
docker compose ps
curl -s http://localhost:8001/api/health      # -> {"status":"ok"}
```

Services:
- `frontend` → static site on host port **8080** (proxy your domain root here).
- `backend`  → API on host port **8001** (proxy `/api` here).
- `mongo`    → internal only; data persisted in the `mongo_data` volume.

Then point your TLS reverse proxy (§5) at `frontend:8080` (`/`) and `backend:8001` (`/api`).

> To change frontend config later, rebuild the frontend image (React envs are baked at
> build time). Backend integrations (Resend/Sheets/scheduling) do **not** require a rebuild
> — just update `backend/.env` and restart the backend container.

---

## 5. Manual deploy (no Docker)

**Backend**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Run under a process manager; example (systemd unit ExecStart):
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

**Frontend**
```bash
cd frontend
yarn install --frozen-lockfile
REACT_APP_BACKEND_URL="https://your-domain.com" yarn build
# Serve the ./build directory with Nginx/Caddy (see frontend/nginx.conf).
```

**Reverse proxy (Nginx example)**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # API -> backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Everything else -> static frontend (SPA fallback)
    location / {
        root /var/www/ccdp/build;
        try_files $uri $uri/ /index.html;
    }
}
# Redirect HTTP -> HTTPS
server { listen 80; server_name your-domain.com; return 301 https://$host$request_uri; }
```

---

## 6. Database setup (MongoDB)

- The app connects via `MONGO_URL` and uses database `DB_NAME`.
- Collections are created automatically; startup ensures indexes on
  `inquiries.id`, `inquiries.email`, and a unique index on `admins.email`.
- **Enable authentication** in production:
  ```bash
  # Create an app user (mongosh)
  use ccdp_production
  db.createUser({ user: "ccdp_app", pwd: "STRONG_PASSWORD",
                  roles: [{ role: "readWrite", db: "ccdp_production" }] })
  ```
  Then set:
  ```
  MONGO_URL="mongodb://ccdp_app:STRONG_PASSWORD@mongo:27017/ccdp_production?authSource=ccdp_production"
  ```
- **Never expose port 27017 publicly.** Bind to localhost / internal Docker network only.
- For high availability use a replica set or MongoDB Atlas (use the SRV URI in `MONGO_URL`).

---

## 7. Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URL` | ✅ | MongoDB connection string. |
| `DB_NAME` | ✅ | Database name (e.g. `ccdp_production`). |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins. Set to your exact domain(s) in prod. |
| `LOG_LEVEL` | – | `INFO` (default) / `WARNING` recommended for prod. |
| `JWT_SECRET` | ✅ | 64-char hex secret for signing admin JWTs. |
| `ADMIN_EMAIL` | ✅ | First admin login email (seeded on startup). |
| `ADMIN_PASSWORD` | ✅ | First admin password (hashed with bcrypt; updated on startup if changed). |
| `ADMIN_NAME` | – | Display name for the admin. |
| `RESEND_API_KEY` | – | Resend key. **Empty = emails skipped, inquiries still stored.** |
| `SENDER_EMAIL` | – | From address on a Resend-verified domain. |
| `INQUIRY_RECIPIENT` | – | Internal recipient for new-inquiry notifications. |
| `SCHEDULING_URL` | – | Public booking URL for "Schedule an Executive Briefing". |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | – | Full service-account JSON (single line). Empty = Sheets sync off. |
| `GOOGLE_SHEET_ID` | – | Target Google Sheet ID. |
| `GOOGLE_SHEET_TAB` | – | Worksheet/tab name (default `Inquiries`). |

### Frontend (`frontend/.env`, build-time)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | Public base URL the SPA calls (`${URL}/api/...`). No trailing slash. |

---

## 8. Activating the optional integrations (no backend rebuild)

All three are **gated** — the app runs fully without them and turns them on the moment
the env values are present. After editing `backend/.env`, restart the backend
(`docker compose restart backend` or your process manager).

**Resend (email)**
1. Verify your sending domain (e.g. `aweday.org`) in Resend.
2. Create an API key → set `RESEND_API_KEY`. Confirm `SENDER_EMAIL` is on the verified domain.
3. Test: submit any inquiry → internal notification + confirmation email are sent.

**Google Sheets (live backup)**
1. In Google Cloud, create a **service account**; enable the **Google Sheets API**;
   create a JSON key.
2. Create/choose a Sheet; **share it with the service account's `client_email` as Editor**.
3. Set `GOOGLE_SERVICE_ACCOUNT_JSON` (the full JSON on one line) and `GOOGLE_SHEET_ID`.
4. On the next inquiry/update, a header row + rows are written automatically (upsert by Inquiry ID).

**Scheduling**
- Set `SCHEDULING_URL` to your Google Calendar appointment page (or similar).
  The "Schedule an Executive Briefing" button opens it in a new tab; if empty it falls back
  to the inquiry form. `GET /api/config` exposes this value to the frontend at runtime.

---

## 9. SSL / HTTPS requirements

- Terminate TLS at your reverse proxy (Let's Encrypt via Certbot/Caddy/Traefik).
- Force HTTP→HTTPS redirects.
- Admin auth uses a **Bearer JWT stored in the browser** and is sent over HTTPS —
  HTTPS is mandatory in production to protect the token and all inquiry data.
- Set `CORS_ORIGINS` to your exact HTTPS origin(s) (avoid `*` in production).

---

## 10. Backups & operations

- **MongoDB**: schedule `mongodump` daily and store off-site:
  ```bash
  mongodump --uri "$MONGO_URL" --gzip --archive=/backups/ccdp-$(date +\%F).gz
  # retain 30 days; test restores periodically:
  # mongorestore --uri "$MONGO_URL" --gzip --archive=/backups/ccdp-YYYY-MM-DD.gz
  ```
- **Google Sheets** provides a live, human-readable secondary copy of every lead.
- **Env files**: back up `backend/.env` securely (it holds secrets) — outside git.
- **Health check**: `GET /api/health` → `{"status":"ok"}` for uptime monitoring.
- **Logs**: set `LOG_LEVEL=WARNING` in prod; ship container/uvicorn logs to your aggregator.

---

## 11. Post-deploy smoke test

```bash
BASE="https://your-domain.com"
curl -s $BASE/api/health
# Submit a test inquiry, then log in at $BASE/admin/login and confirm it appears.
# Change ADMIN_PASSWORD in backend/.env before go-live and restart the backend.
```

See **PRODUCTION_READINESS.md** for the pre-launch checklist.
