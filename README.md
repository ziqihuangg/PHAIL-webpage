# PHAIL-webpage

A static research dashboard mapping physical AI tasks, evaluation metrics, models, and benchmarks.

## 1. Links

| | |
| --- | --- |
| Public | https://ziqihuangg.github.io/PHAIL-webpage/ |
| Local dev | `bash preview.sh` (or `python3 -m http.server 4173 --bind 127.0.0.1`), then open http://127.0.0.1:4173/ |

No build step, no dependencies - `index.html` can also be opened directly from disk.

## 2. What the webpage does

It tracks physical-AI (robot manipulation) results across benchmarks and models, and records **who produced every number**, not just what the number is.

| Page | File | What it does |
| --- | --- | --- |
| Home / dashboard | `index.html` | Task categories, metrics table, model spec sheet, benchmark list |
| Ledger | `tasks.html` | The filterable evaluation ledger - every cited record, with a chart of whichever board is in view |
| Charts | `charts.html` | One chart per published table, plus the cross-board comparison that explains why there is no composite index |
| Benchmarks | `benchmarks.html` | Board list and metric glossary |
| GPT-6 Astra | `gpt-6-astra.html` | Model spotlight: one model read across six published sources |
| About | `about.html` | Project statement |
| Metrics / Models | `metrics.html`, `models.html` | Same rendering mechanism as Benchmarks, kept only so old links resolve - no longer in the nav |

## 3. Code logic

**Data and rendering are always separate files.** Rendering code never contains data, and data files never contain markup:

- [`tasks-data-new.js`](tasks-data-new.js) / [`astra-data.js`](astra-data.js) - the data: every record, citation, and source
- [`tasks-app.js`](tasks-app.js) - Ledger page: sim/real switch, faceted filters, ranking, table, in-view chart
- [`charts-page.js`](charts-page.js) + [`charts.js`](charts.js) - Charts page and its dependency-free SVG chart primitives (bars, paired bars, scatter, error bars, dimension grid, slope)
- [`astra-app.js`](astra-app.js) - draws the Astra page from `astra-data.js`, through the same `window.phailCharts` primitives
- [`script.js`](script.js) - site name, nav, header
- [`section-page.js`](section-page.js) - clones sections out of `index.html` for `benchmarks.html`, `metrics.html`, `models.html`

Key conventions the data follows:

- **Provenance over authorship.** Every record's `provenance` field (`benchmark` / `model` / `thirdParty` / `pending`) records who ran the evaluation, not who built the model - and drives the colour of every bar on the site.
- **One `resultGroups` entry is one table in one document.** Nothing is averaged across benchmarks; each chart plots exactly one published table.
- **Sim and real are two views, not one list.** No score is assumed to predict the other, so the Ledger switches between them rather than blending.
- **No number without a `sourceUrl` you can open.** Anything computed rather than cited (e.g. cross-board percentiles) is marked as derived and coloured differently (`--violet`) so it never looks like a cited value.
- **Filters are faceted.** Every dropdown on the Ledger rebuilds from whatever the other filters still allow, so no combination can return an empty table.

See inline comments in `tasks-data-new.js` for the full record schema if you're adding a new benchmark result.
