# Block authoring contract — tarnexa-demo

Stardust and human authors may use only these blocks, with these table shapes.
Block code is reviewed as code (@saltmarsh/platform). Content never carries copy
of a product claim; it references a fragment id.

| Block | Rows | Notes |
|---|---|---|
| `hcp-gate` | 1 row: rich text shown above the sign-in form | Mock auth. Sets `tarnexa_hcp` cookie + `window.tarnexaHcp`, pushes `hcp.authenticated`. Put it in the first content section of every gated page. `/sign-out` links clear it. |
| `boxed-warning` | row 1: one-line summary · row 2: rich text paragraphs | Authored once in `/shared/boxed-warning` and included via `fragment`. Opens when URL hash is `#boxed-warning`. |
| `claim-card` | `id` · fragment id — `show` · comma list of headline, lede, claim, cta | Renders from `/fragments/product-claim.json`. Missing fragment → renders nothing. Pushes `fragment.viewed` and `fragment.cta`. |
| `paired-bars` | `claim` · fragment id (uses `dataPoints[0..1]`) — or label/value rows — `note` — `caption` | Second row drawn muted (placebo). |
| `evidence-ladder` | optional `claim` · fragment id, then one row per rung: title · rung label · rich text | The Audience of One item. Pushes `fragment.engaged` with `evidence.depth` on each open; first rung open by default. |
| `isi` | 1 row: rich text with h3 subheads | Authored once in `/shared/isi`. Splits h3 groups into two columns. |
| `fragment` | 1 row: link to the DA fragment path | Boilerplate block. Used for `/shared/*`. |
| `header` / `footer` | n/a | Load `/nav` (3 sections: lockup, links, signed-in state) and `/footer`. |

Section styles (via `section-metadata` → `style`): `demo-note`, `tight`, `two-col`, `quiet`, `references`.

Data layer events (all on `window.adobeDataLayer`): `hcp.authenticated`, `fragment.viewed`, `fragment.engaged` (with `evidence.depth`), `fragment.cta`. Each carries the fragment's `attributes` when the sheet is available, so the Web SDK can forward the Q-matrix row with the observation.
