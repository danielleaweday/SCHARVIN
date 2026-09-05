# Click-Flow Specification v2 — Design-Intent Format

## Context

The v1 click-flow documents (ANCRID, ANCRA) were built with the instincts of a code
audit: they report what the current build does and flag what is broken. That was the
wrong emphasis. These applications are **mockups produced by a UX design process** —
of course the buttons are unwired. Reporting that as a defect is noise.

What is actually needed is a **design-to-implementation map**: for every element the
designer placed on every screen, state what that element is *intended* to do, in enough
detail that a developer can build it on our own server without guessing.

The fact that a control is currently unwired stops being a finding. It becomes simply
the reason the specification exists.

A second constraint, equally important: **the UX design is itself incomplete.** Some
screens are missing elements, some flows have no defined outcome, and some questions
were never answered by the designer. The document must make those gaps **visible and
fillable** rather than silently resolving them. Where I propose an answer, it must be
clearly marked as a proposal awaiting confirmation. Where I cannot reasonably propose
one, the document must leave deliberate blank space for the team to complete.

## What changes from v1

| | v1 (audit framing) | v2 (design-intent framing) |
|---|---|---|
| Central question | Does this control work? | What is this control *for*? |
| "Save & Sign is unwired" | A finding, in a red panel | Not mentioned — it is the premise |
| Payload per control | Handler present, request made, response | What it persists, where it goes, what the user sees, what happens on failure |
| Missing `<audio>` element | Defect | Spec item: *player requires media playback — define source, formats, controls* |
| Dead-control registers | 3 pages | Removed entirely |
| Dominant classification | Observed / Dead | Intended / Proposed |
| Open questions | Listed in an appendix | **Inline, at the point of use, with fillable space** |

## Classification (revised)

| Label | Meaning | Visual |
|---|---|---|
| **Specified** | Behaviour is defined by the product spec, the User Flow doc, or is unambiguous from the design | Solid blue |
| **Proposed** | I have inferred a reasonable behaviour from surrounding context. **Needs confirmation.** | Dashed violet |
| **To define** | Cannot be reasonably inferred. **Deliberate blank space for the team to fill.** | Dashed orange, with visible ruled fill-in area |
| **Decision** | A genuine product choice with more than one defensible answer | Solid orange, options listed |

`Observed` and `Dead` are retired. The only place current-build behaviour is mentioned
is where it would actively mislead a developer about intent (see Identity, below).

## The "To define" mechanism — the key new element

This is what makes the document completable rather than merely readable. Three forms:

1. **Ruled fill-in boxes** inside a flow diagram — a dashed orange box containing faint
   horizontal rules and a prompt (e.g. *"On success, the student sees: ______"*),
   sized to be written into when printed, or typed into in the editable HTML source.
2. **Open-question panels** at the point of use rather than in an appendix — orange
   panel, the question stated, then blank ruled space beneath it.
3. **A completion register** as the final page — every `To define` item in the document
   collected into one checklist with page references, so the team can see at a glance
   how much is outstanding and work through it systematically.

Every `To define` item carries an ID (`TD-01`, `TD-02` …) so it can be referenced in
conversation and ticked off in the register.

## Per-control specification content

For each meaningful control, the document states:

- **Element** — what the designer placed (button, field, tab, card) and its literal label
- **Purpose** — what the user is trying to accomplish by using it
- **On activation** — what the system does; the request, if any, and what it carries
- **Success** — what the user sees, and where they land
- **Failure** — what the user sees, and what is preserved
- **Preconditions** — what must be true for the control to be available
- **Open** — anything the design does not answer, as a `To define` item

Repeated patterns are still consolidated (this worked well in v1): one specification
covering all seven faculty authoring tools, one covering the student record surfaces.

## Document structure (target 14–18 pages)

1. **Cover** — same visual system as v1
2. **How to read** — classification key, and **how to use the fill-in areas**
3. **Identity & role model** — how a user becomes student or faculty, and what each may
   reach. The one place current behaviour is contrasted with intent, because the mockup's
   free persona toggle actively misleads about the intended access model
4. **Navigation map** — all routes, unchanged from v1 (this page worked)
5–12. **Screen specifications**, grouped by workflow rather than by page:
   - Learning flow — journey → experience → lesson (incl. media requirements)
   - Student submission — assignments, portfolio, peer review, graduation
   - Faculty authoring — the consolidated seven-tool pattern
   - Faculty assessment — approvals, grading, command centre
   - Record surfaces — consolidated read-only pattern
   - Ecosystem surfaces — module entry points
   - Shell — top bar, palette, AIAH
13. **Cross-screen requirements** — media playback, file upload, notifications:
   capabilities several screens depend on, specified once
14. **Completion register** — every `To define` item, numbered, with page references

## Method

Unchanged from v1 where it worked:
- Element inventory extracted from source (labels are real, not invented)
- Repeated patterns consolidated
- Hand-authored inline SVG, no ASCII art
- Split cover/body, headless Chrome, merge with pymupdf
- Verify: no orphans, nothing clipped, page count in range

New:
- Fill-in areas rendered as dashed boxes with faint ruled lines, sized for writing
- Every `To define` given a sequential ID and collected into the final register
- Cross-check that no `To define` item was silently resolved by a `Proposed` elsewhere

## Pilot

**ANCRA**, rebuilt on this format. It has the most controls and the most incomplete
design, so it is the real test of whether the fill-in mechanism carries its weight.
If the format is approved, ANCRID is brought in line, then the remaining apps follow.

## Verification

- Every control in the source inventory appears in the document
- Every `To define` appears in the completion register, and vice versa
- No `Proposed` item silently answers a question also raised as `To define`
- Fill-in areas are large enough to be usable when printed at A3
- No orphan pages, no clipped labels, page count 14–18
