# INHEIRA v1.0 — Route Inventory

## Frontend routes (React Router)
All defined in `/app/frontend/src/App.js`.

| # | Path | Component | Auth |
|---|---|---|---|
| 1 | `/` | Landing | Public |
| 2 | `/auth` | AuthPage | Public |
| 3 | `/report/:token` | PublicReport | Public (password-gated) |
| 4 | `/dashboard` | Dashboard | Protected |
| 5 | `/profile` | Profile (RightPrint™) | Protected |
| 6 | `/sessions` | Sessions (list) | Protected |
| 7 | `/sessions/new` | NewSession | Protected |
| 8 | `/sessions/:id` | SessionDetail → `<Navigate>` to `/sessions/:id/studio` | Protected |
| 9 | `/sessions/:id/studio` | StudioSession | Protected |
| 10 | `/sessions/:id/dna` | SongDNA | Protected |
| 11 | `/sessions/:id/release` | ReleaseDashboard (11-stage Release Path) | Protected |
| 12 | `/sessions/:id/intelligence` | SongIntelligence (AI report) | Protected |
| 13 | `/sessions/:id/split-sheet` | SplitSheet | Protected |
| 14 | `/creator/:id` | CreatorPassport (Creator DNA™) | Protected |
| 15 | `/writing-rooms` | WritingRooms | Protected |
| 16 | `/vaulta` | Vaulta (royalty rail) | Protected |
| 17 | `/settings/integrations` | ConnectedServices (90 services) | Protected |
| 18 | `*` | NotFound | Fallback |

## Backend routes (FastAPI, all prefixed `/api`)

### Authentication
| Method | Path |
|---|---|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/session` (Emergent Google OAuth session) |
| GET | `/api/auth/me` |
| POST | `/api/auth/logout` |

### Profile / Creator DNA foundation
| Method | Path |
|---|---|
| PUT | `/api/profile/me` |
| GET | `/api/profile/{user_id}` |
| GET | `/api/creators/{user_id}/discography` |
| GET | `/api/creators/{user_id}/timeline` |
| GET | `/api/discover/creators` |

### Sessions
| Method | Path |
|---|---|
| POST | `/api/sessions` |
| GET | `/api/sessions` |
| GET | `/api/sessions/{session_id}` |
| PATCH | `/api/sessions/{session_id}` |
| POST | `/api/sessions/{session_id}/join` |
| POST | `/api/sessions/join-by-code/{invite_code}` |

### Lyrics
| Method | Path |
|---|---|
| GET | `/api/sessions/{session_id}/lyrics` |
| POST | `/api/sessions/{session_id}/lyrics` |
| PUT | `/api/sessions/{session_id}/lyrics/{line_id}` |
| DELETE | `/api/sessions/{session_id}/lyrics/{line_id}` |

### Events / Chat
| Method | Path |
|---|---|
| GET | `/api/sessions/{session_id}/events` |
| POST | `/api/sessions/{session_id}/events` |
| GET | `/api/sessions/{session_id}/messages` |
| POST | `/api/sessions/{session_id}/messages` |

### Contributions / Splits
| Method | Path |
|---|---|
| GET | `/api/sessions/{session_id}/contributions` |
| POST | `/api/sessions/{session_id}/contributions` |
| POST | `/api/sessions/{session_id}/splits/suggest` (Claude Sonnet 4.5) |
| PUT | `/api/sessions/{session_id}/splits` |
| POST | `/api/sessions/{session_id}/splits/approve` |

### Rights / Publishing
| Method | Path |
|---|---|
| POST | `/api/sessions/{session_id}/rights/generate/{kind}` (ISRC/UPC/EAN/ISWC/Song ID) |
| POST | `/api/sessions/{session_id}/insights` |
| POST | `/api/sessions/{session_id}/intelligence` (Claude Sonnet 4.5 full report) |
| POST | `/api/sessions/{session_id}/share` (password-gated external link) |
| GET | `/api/report/{token}` |

### Royalties (Vaulta)
| Method | Path |
|---|---|
| GET | `/api/royalties` |

### Files
| Method | Path |
|---|---|
| POST | `/api/upload` |
| GET | `/api/files/{path:path}` |

### Integrations (Connected Services)
| Method | Path |
|---|---|
| GET | `/api/integrations` |
| GET | `/api/integrations/{integration_id}` |
| PATCH | `/api/integrations/{integration_id}` |

### Meta
| Method | Path |
|---|---|
| GET | `/api/` (health) |
