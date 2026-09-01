# CCDP Institutional Platform

Production package for the Contemporary Creative Development Program (CCDP)
institutional website + Institutional Relationship Management (CRM).

**Stack:** React (SPA) · FastAPI (Python) · MongoDB
**Optional integrations (auto-activate via env, no rebuild):** Resend email · Google Sheets backup · external scheduling URL

---

## Documentation

| Document | Purpose |
|---|---|
| **DEPLOYMENT.md** | Full deployment guide: Docker & manual, env vars, MongoDB, SSL, backups, startup, integration activation, smoke test. |
| **ARCHITECTURE.md** | Frontend, backend, DB, authentication, email flow, CRM flow, and lead-capture process. |
| **API_REFERENCE.md** | Every API endpoint: request/response, auth, errors, cURL examples. |
| **DATABASE.md** | MongoDB collections, field-by-field schema, CRM mapping, backup commands. |
| **ADMIN_GUIDE.md** | Using the CRM dashboard, managing admin accounts, notifications. |
| **PRODUCTION_READINESS.md** | The completed pre-launch review + checklist. |
| `backend/.env.example` | Documented backend environment template. |
| `frontend/.env.example` | Documented frontend environment template. |

## Quick start (Docker)

```bash
cp backend/.env.example  backend/.env      # fill in real values (see DEPLOYMENT.md §7)
cp frontend/.env.example frontend/.env
export REACT_APP_BACKEND_URL="https://your-domain.com"
docker compose up -d --build
curl -s http://localhost:8001/api/health   # -> {"status":"ok"}
```

Then front the services with your TLS reverse proxy: route `/api/*` → backend (`8001`),
everything else → frontend (`8080`). Full instructions in **DEPLOYMENT.md**.

## Post-deploy smoke test

```bash
BASE="https://your-domain.com" bash scripts/smoke_test.sh
```

## Security notes

- **No secrets are committed.** `.env` files are git-ignored; create them from the
  `.env.example` templates on your server.
- Admin account is seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD` at startup — set strong,
  unique values in production (see DEPLOYMENT.md §3). Nothing is hardcoded in the codebase.
- HTTPS is required in production; set `CORS_ORIGINS` to your exact domain(s).

## Project layout

```
backend/     FastAPI app (server.py, auth.py, inquiries.py, google_sheets.py)
frontend/    React SPA (src/pages, src/components, src/context, src/lib)
scripts/     Operational scripts (smoke_test.sh)
docker-compose.yml
DEPLOYMENT.md · ARCHITECTURE.md · PRODUCTION_READINESS.md
```
