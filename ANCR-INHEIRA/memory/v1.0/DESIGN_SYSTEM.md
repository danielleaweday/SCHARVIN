# INHEIRA v1.0 — Design System Snapshot

## Foundation
**Vibe:** cinematic documentary + premium recording studio. Not SaaS. Not a dashboard. A creative environment where every interaction inspires.

## Color palette — FROZEN
| Role | Tailwind | Hex | Usage |
|---|---|---|---|
| **Canvas** | `bg-black` | `#000000` | Every page background |
| **Surface** | `bg-zinc-950` | `#09090b` | Cards, panels |
| **Surface muted** | `bg-zinc-950/40` | `rgba(9,9,11,0.4)` | Section wrappers with photography behind |
| **Border** | `border-zinc-900` | `#18181b` | Card / section dividers |
| **Border strong** | `border-zinc-800` | `#27272a` | Inputs |
| **Text primary** | `text-white` | `#ffffff` | Titles |
| **Text body** | `text-zinc-300 / 400` | `#d4d4d8 / #a1a1aa` | Body |
| **Text muted** | `text-zinc-500 / 600 / 700` | `#71717a / #52525b / #3f3f46` | Metadata, monospace |
| **Primary accent** | `indigo-400` | `#818cf8` | Buttons, chips, active states |
| **Cool accent 2** | `sky-300` | `#7dd3fc` | Progress bar left half |
| **Success** | `emerald-300 / 400` | `#6ee7b7 / #34d399` | Live indicators, "Signed" states |
| **Pearl-lavender gradient stop** | `violet-100 / 200` | `#ede9fe / #ddd6fe` | Intentional soft gradient endpoint on cinematic headline text — the ONLY violet shades allowed |

### Palette rule (the freeze)
> **No `violet-300`, `violet-400`, `violet-500`, `violet-600` anywhere in the codebase.**
> Grep guard: `grep -rE 'violet-(300|400|500|600)' frontend/src/` must return zero results.
> Only `violet-100` and `violet-200` are permitted as the pearl-lavender endpoint of cinematic gradient headlines.

## Typography
| Role | Font | Class |
|---|---|---|
| **Display / titles** | Cabinet Grotesk | `font-display font-black tracking-tighter` |
| **Body** | Manrope (default) | (default sans-serif) |
| **Monospace metadata** | JetBrains Mono | `font-mono-metadata` |

### Text size hierarchy
- **Hero (H1):** `text-5xl md:text-7xl` (or `text-6xl md:text-8xl` for signature moments) with `leading-[0.9]` + `tracking-tighter`
- **Chapter title (H2):** `text-3xl md:text-5xl` with `leading-[0.95]` + `tracking-tighter`
- **Section title (H3):** `text-xl md:text-2xl` with `font-bold` or `font-black`
- **Body:** `text-sm` — `text-base` for prose
- **Mono metadata (eyebrows, timestamps, chip labels):** `font-mono-metadata text-[9px]` or `text-[10px]` with `uppercase tracking-[0.3em]` — `tracking-[0.4em]` for prominent eyebrows

## Signature gradient (cinematic headline)
```
bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent
```
Variants:
- `from-sky-200 via-indigo-100 to-violet-200` — for closer / final-chapter moments
- `from-white via-indigo-50 to-violet-100` — for sub-titles inside chapters

## Chapter eyebrow pattern
```
/ CHAPTER {ROMAN} · {NAME IN CAPS}
```
Rendered in:
```
font-mono-metadata text-[10px] uppercase tracking-[0.4em] text-slate-500
```

## Shared cinematic components
Every surface built after Phase 1 uses:
- `<CinematicHero />` — black-first hero with dual radial glow + gradient headline
- `<LifeSpine currentStage={n} />` — persistent 10-node Life of a Song™ spine
- `<ChapterBand />` — numbered chapter section with optional photography backdrop
- `<IdentityStrip />` — collaborator identity-color avatar strip
- `<EmptyBlock />` — unified empty-state voice
- `<ANCRFooter />` — signature closer

## Photography approach
Documentary-style bg images at **12–14% opacity** with a `linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.92))` overlay. Subjects: mixing consoles, dark control rooms, publishing meetings, live ensembles, vinyl / instruments, live moments, stage crowds, vaults, distribution warehouses, release-day gatherings.
Currently sourced from Unsplash — noted as **TODO: swap with commissioned shots** at scale.

## Identity color system (`lib/collaboratorColors.js`)
Deterministic per-ancr_id color palette used across:
- Avatars (nav, dashboard, sessions, studio, DNA, release, vaulta)
- Cursors / activity dots
- Contribution attributions
- Lyric line color coding
- Timeline event dots
- Radar chart fill
- Passport hero glow ring

## Sticky Chapter Index (right rail)
Used on: **Creator DNA (15 chapters), Release Path (11 stages).**
Pattern: `hidden xl:block fixed right-6 top-1/2 -translate-y-1/2` — numbered anchor links to each chapter's `<StageAnchor id={key} />`.

## Life of a Song™ 10-stage arc
1. Idea · 2. Lyrics · 3. Session · 4. Mix · 5. Understood · 6. Published · 7. Playlisted · 8. Streams · 9. Recognized · 10. Legacy
Defined in `/app/frontend/src/lib/lifeOfSong.js` (`LIFE_STAGES`).

## Studio chapter map (12 tabs → 5 chapters)
| Chapter | Tabs |
|---|---|
| I Idea | Overview |
| II Write | Lyrics · Melody · Chords · Arrangement |
| III Record | Voice Memos · Files |
| IV Collaborate | Collaborators · Chat |
| V Release | Rights · Publishing · Analytics |

## Mobile responsiveness
- All hero grids collapse to single column below `md` (768px)
- 10-node Life spine strip is wrapped in `overflow-x-auto` with `minWidth: 640` so it scrolls inside its container without forcing the page to overflow
- CSS Grid children carry `min-w-0` where nested cinematic cards could exceed the track width
- Verified: `document.scrollWidth === 375` at 375×812 viewport on Dashboard, Studio, Release
