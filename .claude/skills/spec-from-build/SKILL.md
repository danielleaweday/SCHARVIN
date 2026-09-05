---
name: spec-from-build
description: Write a behavioural specification for software that already exists — click-flows, user journeys, interaction specs, acceptance criteria, or Given/When/Then requirements — grounded in the actual code rather than assumptions. Use when documenting a prototype or inherited build for developers, when a spec and a build disagree, when producing a page-build contract or navigation map, or when asked to turn an existing application into something a developer can rebuild from. Also use when auditing whether an app matches its own product specification.
---

# Specifying software that already exists

Most specification writing describes something not yet built. This is the harder, less-taught case: an application exists, someone must rebuild or extend it, and the spec must describe **what should be true** without silently blessing **what happens to be true today**.

The discipline is separating those two things on every single behaviour.

## The failure this prevents

A developer reads a spec written from a prototype. It says "clicking Save shows a confirmation." They implement exactly that. What the spec did not say: the prototype's Save also fails silently on network error, the confirmation appears before the write is durable, and a button next to it does nothing at all because nobody wired it.

The prototype's accidents became requirements. **Every accident you fail to mark becomes a requirement someone will faithfully reproduce.**

## Phase 1 — Extract evidence before writing a word

Never describe an interface you have not inventoried. Assumptions about "there's probably a loading state" produce specs that are wrong in the specific places that matter.

Inventory, with actual commands, not recall:

- **Scale.** Count the real surfaces. `find src/pages -name "*.jsx" | wc -l`, route tables, endpoint counts. This tells you whether you are writing a document or committing to a programme — see Phase 6.
- **Every interactive control**, with its **literal label text**, the handler it calls, the request it makes, and what happens on success *and* failure. Dispatch a subagent for this on anything above ~10 pages; it is mechanical and parallelises well.
- **States**: loading, empty, error, success, disabled. Which exist, which don't.
- **Visual grammar**, if matching an existing document. Extract it, do not eyeball it. For PDFs, PyMuPDF gives exact page dimensions, colour values, and fonts:
  ```python
  import pymupdf
  d = pymupdf.open("source.pdf")
  print(d[0].rect.width, d[0].rect.height)
  for dr in d[0].get_drawings():
      print(dr.get("fill"), dr.get("color"))   # exact RGB
  ```
- **The existing contract**, if one exists — a prior audit, an API doc, a route map. Reuse it rather than re-deriving it.

The extraction is the work. Writing is transcription afterwards.

## Phase 2 — Find the repeating pattern before structuring

Look at the inventory and ask: **how many of these surfaces are actually the same surface?**

In practice a large fraction of any application is one pattern repeated. Nine list pages that each fetch a collection and render cards are *one* flow with nine parameters, not nine flows.

Document the pattern once. Add a small table of what varies — endpoint, empty-state copy, whether an action exists. Then give dedicated treatment only to genuine outliers.

This single decision is usually the difference between a specification someone reads and ninety pages of near-identical diagrams nobody opens. Identify outliers by size and by *interaction count*, not size alone: a 600-line page with one button may need less space than a 90-line page with eight.

## Phase 3 — Classify every behaviour

This is the core of the method. Each documented behaviour carries exactly one label:

| Label | Meaning | Developer instruction |
|---|---|---|
| **Intended** | Supported by the product specification or agreed design | Build this |
| **Observed** | What the current build actually does | Reference only. Record **only where it diverges** from Intended. Never a target |
| **Decision required** | Build and spec disagree, or behaviour is undefined | Do not guess. Escalate |
| **Proposed** | Needed to complete the experience, not yet approved | Awaiting sign-off. Mark visually distinct (dashed) |
| **Dead** | Control renders but has no handler | Wire it or remove it — state which |

Rules that make the classification hold up:

- **Observed is not the default.** If you find yourself labelling most things Observed, you are writing a description, not a specification.
- **Decision required is a feature, not a failure.** A spec that resolves ambiguity by guessing is worse than one that names the open question. Escalating twenty decisions is a good outcome.
- **Never promote Observed to Intended silently.** That is the exact failure in the section above.

## Phase 4 — Name what does not work, specifically

Two categories developers meet directly and specs routinely omit:

**Dead controls.** A rendered button with no handler is a defect the user experiences firsthand. List each one *by page and by label* — "Portfolio's `Open` button", not "some controls are unwired". For each, state the decision: wire it to a named destination, or remove it. If wiring it requires a surface that does not exist, say so — that is a scope discovery, not a detail.

**Absent states.** Empty, error and loading states are what developers invent inconsistently when unspecified. Where a build has none, that is a finding. Be precise about consequence: a list page with no error state means *an outage is presented to the user as an empty record* — that framing is what gets it prioritised, not "missing error handling".

## Phase 5 — Translate vendor coupling, and distinguish rename from replace

When specifying a self-hosted or migrated target from a prototype built on a hosted platform, translate the vocabulary:

| As implemented | As documented |
|---|---|
| Platform session cookie | Authenticated *(product)* session |
| Platform object storage | Approved media storage service |
| Platform AI key | Configured AI service |

**The trap:** a neutral phrase reads like an available service. Some of these are live external dependencies with no replacement provisioned. Renaming them changes nothing.

So maintain two lists, not one:
1. **Vocabulary map** — pure naming, carries over directly.
2. **Replacement required** — actual dependencies with no home yet, each marked *Decision required*.

If image upload is specified against "approved media storage service" and no such service exists, the flow is unbuildable and the spec must say so at the point of use, not bury it in an appendix.

Also exclude prototype scaffolding from the intended flows entirely — seeded demo records, pre-filled credentials, hard-coded sample data. Note them once, as Observed, with a removal instruction. Do not draw them into a flow diagram.

## Phase 6 — Scope honestly, then pilot

Do the arithmetic before agreeing to anything. A full page-build contract runs roughly **one document page per screen**. Multiply by the real surface count from Phase 1 and say the number out loud.

If it is 250+ pages, that is a programme of work, not a deliverable. Saying so early is more useful than discovering it at application four.

Then: **pilot one, get the structure and visual system approved, and only then propagate.** Pick the pilot for leverage — the module others depend on, or the one with the most existing source material. Once the pattern is signed off, the rest is mechanical rather than exploratory.

## Verification

Before delivering, check the things that were defects last time:

- **Cross-check against the prior audit.** If a functional-requirements document or issue list already exists, walk its open questions and confirm each is either represented or deliberately out of scope. This routinely surfaces user-facing items missed on a first pass.
- **No orphan pages** — any page under ~600 characters of content is a layout failure.
- **Nothing clipped at page edges** — verify programmatically against page bounds, not by eye.
- **Page count within the agreed range**, confirmed before finalising rather than after.
- **Every dead control named**, none left as a vague category.
- **Every Decision-required item actionable** — it states the options, not just the problem.

## Anti-patterns

- Describing the build faithfully and calling it a specification.
- One diagram per page when nine pages share one flow.
- "Some controls may not be wired" instead of four named buttons.
- Neutral vendor language that implies a service exists when it does not.
- Resolving an ambiguity by picking whichever behaviour the prototype happened to have.
- Committing to full coverage across a portfolio before piloting one.
