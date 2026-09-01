# INHEIRA v1.0 — API Inventory
**Base URL:** `${REACT_APP_BACKEND_URL}/api`
**Auth:** Bearer token in `Authorization` header (except public endpoints)
**Source:** `/app/backend/server.py`

## Endpoint count: 40 endpoints across 8 groups

## Authentication (5)
| M | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account with email/password (bcrypt) |
| POST | `/auth/login` | Public | Email/password → JWT + session record |
| POST | `/auth/session` | Public | Emergent Google OAuth session exchange |
| GET | `/auth/me` | Required | Current user object |
| POST | `/auth/logout` | Required | Invalidate session |

## Profile / Creator DNA foundation (5)
| M | Path | Auth | Purpose |
|---|---|---|---|
| PUT | `/profile/me` | Required | Update current user's RightPrint fields |
| GET | `/profile/{user_id}` | Public | Public profile (Creator Passport) |
| GET | `/creators/{user_id}/discography` | Public | All finalized + active works |
| GET | `/creators/{user_id}/timeline` | Public | All events across a creator's sessions |
| GET | `/discover/creators` | Required | Directory of all creators |

## Sessions (6)
| M | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/sessions` | Required | Create new session (auto-generates invite code) |
| GET | `/sessions` | Required | All sessions the current user is part of |
| GET | `/sessions/{session_id}` | Required (member) | Session detail |
| PATCH | `/sessions/{session_id}` | Required (member) | Update meta (title, key, tempo, etc.) |
| POST | `/sessions/{session_id}/join` | Required | Join by session_id |
| POST | `/sessions/join-by-code/{invite_code}` | Required | Join by short invite code |

## Lyrics (4)
| M | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/sessions/{session_id}/lyrics` | Member | All lyric lines with per-line author color |
| POST | `/sessions/{session_id}/lyrics` | Member | Add a lyric line |
| PUT | `/sessions/{session_id}/lyrics/{line_id}` | Member | Edit a line |
| DELETE | `/sessions/{session_id}/lyrics/{line_id}` | Member | Remove a line |

## Events / Chat (4)
| M | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/sessions/{session_id}/events` | Member | Immutable Creative Evidence™ ledger |
| POST | `/sessions/{session_id}/events` | Member | Log a new event |
| GET | `/sessions/{session_id}/messages` | Member | In-session chat feed |
| POST | `/sessions/{session_id}/messages` | Member | Post a chat message |

## Contributions / Splits (5)
| M | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/sessions/{session_id}/contributions` | Member | All logged contributions |
| POST | `/sessions/{session_id}/contributions` | Member | Log a contribution (role + weight) |
| POST | `/sessions/{session_id}/splits/suggest` | Member | **Claude Sonnet 4.5** proposes normalized 100% split |
| PUT | `/sessions/{session_id}/splits` | Member | Edit / override proposed split |
| POST | `/sessions/{session_id}/splits/approve` | Member | Sign / approve the split (finalizes when all signed) |

## Rights / Publishing (5)
| M | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/sessions/{session_id}/rights/generate/{kind}` | Member | Server-side ID gen: `isrc` / `upc` / `ean` / `iswc` / `song_id` |
| POST | `/sessions/{session_id}/insights` | Member | Compact "next best action" insights |
| POST | `/sessions/{session_id}/intelligence` | Member | **Claude Sonnet 4.5** full Song Intelligence™ report |
| POST | `/sessions/{session_id}/share` | Member | Create password-gated Song Intelligence share link |
| GET | `/report/{token}` | Public (password-gated) | External stakeholder read-only report |

## Royalties (1)
| M | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/royalties` | Required | All royalty rows for the current user (Vaulta rail) |

## Files (2)
| M | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/upload` | Required | File upload (chunked) — voice memos, artwork, docs |
| GET | `/files/{path:path}` | Public | Static file serve |

## Integrations (3)
| M | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/integrations` | Required | All 90 Connected Services with status |
| GET | `/integrations/{integration_id}` | Required | Single integration detail + permissions |
| PATCH | `/integrations/{integration_id}` | Required | Toggle connection / permissions |

## Meta (1)
| M | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Public | Health check |

## Third-party integration
- **Emergent LLM Key** → Claude Sonnet 4.5 (Song Intelligence™ + Split Suggest)
- **Emergent-managed Google OAuth** → `/auth/session`
- Stripe, Vaulta rail, PROs, publishers etc. are catalogued as Connected Services but not yet wired to live income sources.

## Auth model
- Registered users: bcrypt password → JWT + `user_sessions` record
- Google users: Emergent OAuth → same token flow
- Test account: `test@songright.com` / `Test1234!` (seeded on backend startup)
