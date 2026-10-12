---
name: stardust
description: Use for any Saltmarsh / Tarnexa content task — brand audit of the HCP homepage, turning static HTML into DA.live documents for the tarnexa-demo EDS site, generating or revising product-claim fragments, or publishing to DA. Triggers on mentions of Stardust, Saltmarsh, Tarnexa, quilvecitinib, brand-profile.json, DA docs, the evidence ladder, or the review plugin.
---

# Project Stardust — Saltmarsh / Tarnexa (governed content for a life sciences HCP site)

Stardust interprets the static brand source and produces **content** for DA.live.
It never writes block code. Blocks live in `blocks/` in Git and are reviewed as
code by @saltmarsh/platform; Stardust may only *reference* them.

## Invariants (same as Birch Creek, tightened for pharma)

1. `brand-profile.json` is the LOCKED layer once generated from the brand
   source (`inputs/saltmarsh-hcp-homepage.html`). Read it; never edit it in a
   run. Conflicts between a brief and the profile are escalated, not resolved.
2. Product claims come ONLY from approved fragments in the `saltmarsh-fragments`
   repo (published sheet `/fragments/product-claim.json`). Stardust never
   writes a figure, endpoint, or comparative statement that is not in a
   fragment's `claimText`/`dataPoints`. Page copy may frame; it may not claim.
3. Every DA document that mentions the product carries the boxed warning
   fragment, the ISI fragment and the references fragment (`/shared/*`).
4. Every generated file opens with a `stardust:provenance` comment and the
   line `data: FICTIONAL DEMO DATA`.
5. HARD STOP before any DA write. Print the file list and wait for explicit
   approval. Publish to `aem.page` (preview) only; `aem.live` is a human action.
6. Block authoring contract is `blocks/README.md`. Use only the blocks it
   lists, with the table shapes it documents. Unknown block → escalate.

## Stages

### Stage 1 — Brand audit → brand-profile.json
Input: `inputs/saltmarsh-hcp-homepage.html`. Output: `brand/brand-profile.json`
(company, product, generic, class, indication verbatim, voice rules, tokens
from `:root`, avoid-list). Also emit `brand/voice-samples.md`: five sentences
from the source that exemplify the register, with what makes each one work.

### Stage 2 — Static HTML → DA documents
Input: a static page (the brand source, or a new page an author drafted in
the same style) + `blocks/README.md`. Output: DA-format HTML under `da/`:
- `<body><header></header><main>…</main><footer></footer></body>`
- one `<div>` per section; `section-metadata` table for styles
  (`demo-note`, `tight`, `two-col`, `quiet`, `references`)
- a block is `<div class="block-name">` with `<div>` rows and `<div>` cells
- product claims become `claim-card` / `paired-bars` / `evidence-ladder`
  tables referencing a fragment **id**, never pasted copy; if the source
  HTML contains a claim with no matching fragment, STOP and list it as
  "needs a fragment" rather than inventing one
- the three `/shared/*` fragments are included, not duplicated
- `metadata` table with title, description, `robots: noindex, nofollow`
Write locally, print a section-by-section mapping (source heading → DA
section → blocks used), then stop.

### Stage 3 — Fragment proposals (optional)
When a brief asks for new claim content, write a *proposed* fragment JSON
under `proposals/` in the fragments repo's schema, with `provenance.generator:
stardust@…`. Stardust does not open the PR; the ingest workflow does, from
the Express add-on or a manual dispatch, so the governance path is identical
for human- and model-authored content.

### Stage P — Publish (only on explicit approval)
Via the da-live MCP, org `aemskunkworks`, repo `tarnexa-demo`, in this order:
1. `/shared/boxed-warning`, `/shared/isi`, `/shared/references`
2. `/nav`, `/footer`
3. `/index`, `/tarnexa/efficacy`, `/tarnexa/access-navigator`,
   `/tarnexa/prescribing-information`
4. Preview each (`aem.page`). Do not publish to `aem.live`.
The fragment sheet `/fragments/product-claim.json` is written by the
fragments repo's `publish.yml`, not by Stardust. If it is missing, say so;
`claim-card` and `paired-bars` render nothing until it exists.

## Known constraints
- DA MCP uses an IMS token that expires roughly daily; check `/mcp` first.
- Content write on the `aemskunkworks` org belongs to aemskunkworks@gmail.com.
- Self-contained HTML does not render through EDS; only DA docs + blocks do.
