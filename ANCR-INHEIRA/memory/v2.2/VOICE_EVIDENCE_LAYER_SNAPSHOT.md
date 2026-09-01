# INHEIRA v2.2 — Voice Evidence Layer · SNAPSHOT

**Frozen**: 2026-02-08
**Status**: STABLE MILESTONE — do not modify without a new user directive.

Every voice recording captured in INHEIRA is now a first-class Creative Evidence™ object. The transcript is analysed by Claude Sonnet 5, which surfaces up to nine categories of Meaningful Creative Moments™. Those moments are treated as **system-detected observations, never truth** — every one carries confidence, rationale, and a review lifecycle. Only when a human confirms or corrects a moment does it propagate into the platform-wide evidence stream. Sensitive moments (rights, splits, disagreements, final approvals) never expose their raw excerpt downstream; only metadata + secure reference + SHA-256 integrity hash.

---

## The pipeline

```
POST /api/sessions/{sid}/voice
  │
  ├─▶ store audio (put_object)
  ├─▶ compute SHA-256                                   [content_hash]
  ├─▶ record voice_memo_recorded event (creative)       [first-class from moment 0]
  ├─▶ insert voice_evidence document
  │       transcription_status: pending
  │       moments_status:       pending
  ├─▶ return response to caller (non-blocking)
  │
  └─▶ asyncio.create_task( media_evidence.process_recording )
          │
          ├─ ffmpeg chunk if > 24 MB (15-min segments)
          ├─ Whisper (OpenAI · Emergent LLM key) → transcript + segments
          │       transcription_status: done
          │       moments_status:       classifying
          ├─ Claude Sonnet 5 → detected_moments[]
          │       every moment: kind, excerpt, start_sec, end_sec, confidence,
          │       rationale, human_status='unconfirmed'
          │       moments_status: done
          └─ cleanup /tmp/inheira_voice_* and any chunk dir
```

Human review (`POST /api/voice/{rid}/moments/{mid}/review`):
- **confirmed** → emits the mapped platform-wide event
- **corrected** → emits the mapped event for the corrected kind + persists correction
- **disputed**  → persists dispute + note; NO downstream event
- **annotated** → persists note; NO downstream event

---

## Sensitivity mapping (platform-wide standard, enforced by evidence.py)

| Moment kind             | Emitted evidence kind          | Sensitivity | Excerpt visible downstream? |
| ----------------------- | ------------------------------ | ----------- | --------------------------- |
| lyric_idea              | lyric_section_completed        | creative    | yes                         |
| melody_idea             | melody_changed                 | creative    | yes                         |
| harmony_idea            | chord_progression_changed      | creative    | yes                         |
| arrangement_discussion  | arrangement_changed            | creative    | yes                         |
| production_decision     | contribution_logged            | creative    | yes                         |
| final_approval          | approval_signed                | **sensitive** | no (secure_reference only)|
| split_conversation      | rights_discussion              | **sensitive** | no                        |
| rights_discussion       | rights_discussion              | **sensitive** | no                        |
| creative_disagreement   | negotiation                    | **sensitive** | no                        |

---

## Non-negotiable invariants (regression-tested)

1. **Unconfirmed moments never emit downstream** — verified by pre-review evidence-stream snapshot.
2. **Sensitive moments never expose their raw excerpt** — verified by `json.dumps` search of the emitted event.
3. **`voice_memo_recorded` is emitted synchronously at upload** — verified by GET evidence immediately after POST.
4. **Reclassify preserves reviewed moments** — verified by fixture reusing an already-confirmed recording.
5. **Access control** — a freshly-registered stranger gets 403 on both `/voice/{id}` and `/voice/{id}/audio`.
6. **Recording cap 60 min** — server rejects `duration_sec > 3600` with 400.
7. **Whisper limit 24 MB** — ffmpeg chunker produces ≤15-min segments; segment offsets are merged into the original timeline.
8. **confidence_status / mci_status remain frozen** — CEI Phase 1 invariants unchanged.

---

## Files under this layer

**Backend**
- `/app/backend/media_evidence.py` — the media-agnostic evidence service (voice today, video/screen/DAW/MIDI/camera later via `MEDIA_KINDS`)
- `/app/backend/server.py` — endpoints (`POST /api/sessions/{sid}/voice`, `GET /api/sessions/{sid}/voice`, `GET /api/voice/{rid}`, `GET /api/voice/{rid}/audio`, `POST /api/voice/{rid}/speakers`, `POST /api/voice/{rid}/moments/{mid}/review`, `POST /api/voice/{rid}/reclassify`)
- `/app/backend/tests/test_voice_evidence_v2_2.py` — 21 pytest cases, 19 executed + 2 environment-skipped

**Frontend**
- `/app/frontend/src/components/studio/evolution/VoiceBooth.jsx` — in-browser MediaRecorder capture with waveform + speaker tagging
- `/app/frontend/src/components/studio/evolution/VoiceEvidencePanel.jsx` — records list with authed audio player + moment review UI + reclassify
- `/app/frontend/src/components/studio/EvolutionTab.jsx` — mounts the booth + panel inside the Live view; `evolution-voice-btn` on the primary CTA row

**Dependencies added**
- `pydub==0.25.1`
- `ffmpeg` (apt) — for chunking >24MB uploads
- `espeak-ng` (apt) — used by test suite to generate real spoken audio

---

## Verified end-to-end (2026-02-08)

```
espeak-ng: "I think the bridge should modulate up a whole step. Let's give writer 50% 
           and producer 30%. I approve this version."
Whisper:   transcribed accurately in ~3s
Claude:    detected 3 moments in ~7s:
             harmony_idea      · 0.85  · "modulate up a whole step"
             split_conversation· 0.90  · "give writer 50% and producer 30%"
             final_approval    · 0.90  · "I approve this version"
Review:    harmony_idea confirmed → chord_progression_changed emitted (creative)
Sensitive: final_approval kept in voice_evidence; downstream approval_signed
           carried only secure_reference — no excerpt.
```

Full test suite: **61 passed, 2 skipped** (test_voice_evidence_v2_2 + test_cei_v2 + test_auto_doc_v2_1).

---

## STOP · This is a stable milestone

Do not begin Comparison Engine, Musical Contribution Intelligence™, Whiteboards, or any new feature
without an explicit user directive on top of this snapshot.

Next-in-queue (per user's Feb-8 message):
1. Musical Contribution Intelligence™
2. Comparison Engine
