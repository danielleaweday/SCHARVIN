# CCDP Platform — Admin Guide (CRM)

The admin dashboard is the Institutional Relationship Management (CRM) console for
reviewing and working every inquiry captured by the website.

---

## 1. Access

- **Login:** `https://<your-domain>/admin/login`
- **Dashboard:** `https://<your-domain>/admin/inquiries`
- Credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`
  (seeded automatically on startup). Sessions last 12 hours.
- **Never share the URL of any auto-generated dev password.** Set a strong, unique
  `ADMIN_PASSWORD` in production and restart the backend to apply it.

## 2. Lead workflow (Partnership Deck / Resources are review-gated)

Materials are **not** delivered automatically. When someone requests the deck or a resource:
1. They complete the inquiry form.
2. The lead is stored in the CRM.
3. You receive it (internal email once Resend is configured — until then, check the dashboard).
4. You review who they are, then **personally send the deck**, introduce yourself, and invite them to meet.

## 3. Dashboard features

- **Stats bar:** total leads + counts per pipeline status.
- **Filters:** free-text search (organization / name / email), status, institution type,
  and date range. Filters apply live.
- **Table:** date, organization, contact, type, interest, status, assignee, next follow-up,
  plus quick email + scheduling links.
- **Detail editor** (click any row):
  - Change **Status**: New → Contacted → Meeting Scheduled → Proposal Sent → Closed.
  - Set **Assigned team member**, **Internal notes**, **Last contacted**, **Next follow-up**
    (fields save on change/blur).
  - **Mark follow-up complete** sets last-contacted to today and clears the next follow-up.
- **Export:** "Export filtered" (current filters) or "Export all" → CSV.
- **Email / Scheduler:** click the mail icon to email a lead; the calendar icon opens your
  scheduling page (when `SCHEDULING_URL` is set).
- **Sheets badge:** shows whether the Google Sheets live backup is active.

## 4. Managing admin accounts

Add another admin (example with `mongosh` + a bcrypt hash generated in Python):
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'THEIR_PASSWORD', bcrypt.gensalt()).decode())"
```
```js
// mongosh
use ccdp_production
db.admins.insertOne({
  email: "teammate@your-domain.com",
  name: "Team Member",
  password_hash: "<paste hash>",
  role: "admin",
  created_at: new Date().toISOString()
})
```
To rotate the primary admin password: update `ADMIN_PASSWORD` in `backend/.env` and restart
the backend (the hash is updated on startup).

## 5. Notifications

- With **Resend** configured: each new inquiry emails you a formatted notification and sends
  the submitter a branded confirmation (review-then-share language for deck/resource requests).
- Without Resend: inquiries are still captured — **monitor the dashboard** until email is enabled.

## 6. Security notes for admins

- Always access over HTTPS.
- Use a strong, unique admin password; do not reuse development credentials.
- Log out on shared devices (top-right sign-out). Tokens expire after 12 hours.
