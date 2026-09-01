# INHEIRA v1.0 — MongoDB Schema Snapshot
**Database:** `os.environ["DB_NAME"]`
**Collections:** 9 (as of freeze)

## `users`
The permanent creator identity record.
```
user_id: str                # ancr_XXXX
email: str
name: str
password_hash: str          # bcrypt
picture: str | null
auth_provider: str          # 'email' | 'google'
verification_status: str    # 'verified' | 'pending'
professional_name: str | null
legal_name: str | null
phone: str | null
country: str | null
pro: str | null             # ASCAP / BMI / SESAC / …
ipi_number: str | null
publisher: str | null
publishing_split: float | null
label: str | null
manager: str | null
attorney: str | null
website: str | null
biography: str | null
disciplines: list[str]
instruments: list[str]
genres: list[str]
social_links: dict          # { twitter, instagram, … }
created_at: str (ISO)
```

## `sessions`
Every song / session ever started.
```
session_id: str             # sess_XXXX
invite_code: str            # short shareable
owner_id: str
title: str
working_title: str | null
project: str | null
album: str | null
location: str | null
session_type: str           # 'private' | 'public'
context: str                # 'industry' | 'university' | 'writing_camp' | 'studio'
date: str (YYYY-MM-DD)
status: str                 # 'active' | 'archived'
collaborators: list[dict]   # [{ user_id, name, color, role, … }]
splits: list[dict]          # [{ user_id, name, percentage, role }]
splits_status: str          # 'draft' | 'proposed' | 'finalized'
signatures: dict            # { user_id → true/false }
song_meta: dict             # { genre, key, tempo, time_signature, language }
completion: dict            # { lyrics: 'complete', melody: 'in_progress', … }
identifiers: dict           # { isrc, upc, iswc, ean, song_id }
created_at: str (ISO)
```

## `contributions`
Verified creator contributions per session.
```
contribution_id: str
session_id: str
user_id: str
user_name: str
role: str                   # 'Songwriter' | 'Producer' | …
description: str
weight: float               # relative contribution weight
audio_url: str | null
lyrics_content: str | null
created_at: str (ISO)
```

## `session_events`
Immutable per-session event ledger (Creative Evidence™).
```
event_id: str
session_id: str
user_id: str
user_name: str
color: str                  # collaborator identity hex
kind: str                   # 'session_created' | 'lyric_line' | 'melody' | 'contribution'
                            # | 'split_modified' | 'identifier_generated' | …
label: str                  # human-readable event text
meta: dict | null
created_at: str (ISO)
```

## `lyric_lines`
Per-section lyric authorship with per-line color coding.
```
line_id: str
session_id: str
section: str                # 'Verse 1' | 'Chorus' | 'Bridge' | …
text: str
user_id: str
user_name: str
color: str
created_at: str (ISO)
```

## `session_messages`
In-session chat.
```
message_id: str
session_id: str
user_id: str
user_name: str
color: str
kind: str                   # 'chat' | 'system'
text: str
created_at: str (ISO)
```

## `royalties`
Post-release royalty rows (Vaulta™ rail).
```
royalty_id: str
session_id: str
title: str
splits: list[dict]
streams: int
performance_income: float
mechanical_income: float
sync_income: float
neighboring_rights_income: float
created_at: str (ISO)
```

## `share_links`
Password-gated Song Intelligence report shares.
```
token: str                  # signed public share id
session_id: str
audience: str               # 'label' | 'publisher' | 'manager' | 'attorney' | 'investor' | 'sync'
password: str | null
created_by: str
created_at: str (ISO)
expires_at: str (ISO)       # 30-day default
```

## `user_sessions`
Auth session records.
```
user_id: str
session_token: str          # bearer token
expires_at: str (ISO)
created_at: str (ISO)
```

## Freeze notes
- All IDs are string UUIDs / short codes — **no raw `ObjectId` is returned by any API endpoint**.
- All `datetime` values are stored as ISO strings (never `datetime.utcnow()` calls).
- Empty / nullable fields are represented as `null`, not missing.
- Collaborator `color` is server-assigned on join to guarantee identity-color persistence.
