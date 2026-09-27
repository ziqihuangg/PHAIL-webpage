# PHAIL-webpage

A static research dashboard mapping physical AI tasks, evaluation metrics, models, and benchmarks.

## 1. Links

| | |
| --- | --- |
| Public | https://ziqihuangg.github.io/PHAIL-webpage/ |
| Local dev | `bash preview.sh` (or `python3 -m http.server 4173 --bind 127.0.0.1`), then open http://127.0.0.1:4173/ |

No build step, no dependencies - `index.html` can also be opened directly from disk.

## 2. What the webpage does

It maps what physical AI is and which benchmarks measure it, tracks results across benchmarks and models, ranks models across boards with a draft index, and records **who produced every number**, not just what the number is.

Tabs, left to right:

| Page | File | What it does |
| --- | --- | --- |
| Scope | `index.html` | Left-to-right taxonomy tree of physical AI (execution layer / planning layer / boundary) with every known benchmark, plus the intro post, how the ranking works, what is missing, and public TODOs (what used to be About) |
| Ranking | `ranking.html` | Draft cross-board index for robotics: switches, index chart, board weights, capability heatmap, board agreement, size scatter, method, ranking factors |
| Ledger | `tasks.html` | The filterable evaluation ledger - every cited record, with a chart of whichever board is in view |
| Charts | `charts.html` | One chart per published table, plus the cross-board comparison that explains why the index never adds numbers across boards |
| GPT-6 Astra | `gpt-6-astra.html` | Model spotlight: one model read across six published sources |
| Benchmarks | `benchmarks.html` | Protocol table for the transcribed boards and the metric glossary |
| (no tab) | `models.html` | Model spec sheet, kept so old links resolve |
| (redirects) | `about.html`, `metrics.html` | Forward to `index.html#about` and `benchmarks.html#metrics` |

Every tab ends with a "Things to discuss" table (question / proposed solution / to decide), drawn from `discussion-data.js`.

## 3. Code logic

**Data and rendering are always separate files.** Rendering code never contains data, and data files never contain markup:

- [`tasks-data-new.js`](tasks-data-new.js) / [`astra-data.js`](astra-data.js) - the data: every record, citation, and source
- [`scope-data.js`](scope-data.js) - the taxonomy: layer > domain > task > benchmarks, with mode, board type, what can be entered, and whether the ledger transcribes it
- [`ranking-data.js`](ranking-data.js) - every knob of the index: trial counts, board families, evidence weights, capability axes, ranking factors
- [`discussion-data.js`](discussion-data.js) - the open questions at the foot of each tab
- [`ranking-engine.js`](ranking-engine.js) - the index itself, no data and no markup; also runs in Node for checking numbers (`node -e` with a `window` shim)
- [`tasks-app.js`](tasks-app.js) - Ledger page: sim/real switch, faceted filters, ranking, table, in-view chart
- [`ranking-app.js`](ranking-app.js) / [`scope-app.js`](scope-app.js) / [`discussion.js`](discussion.js) - draw the Ranking tab, the Scope tree, and the discussion tables
- [`charts-page.js`](charts-page.js) + [`charts.js`](charts.js) - Charts page and its dependency-free SVG chart primitives (bars with error or range whiskers, paired bars, scatter, error bars, dimension grid, slope)
- [`astra-app.js`](astra-app.js) - draws the Astra page from `astra-data.js`, through the same `window.phailCharts` primitives
- [`icons.js`](icons.js) - the Lucide line icons used by the tree and the capability table (ISC licence)
- [`script.js`](script.js) - site name, nav, header

Key conventions the data follows:

- **Provenance over authorship.** Every record's `provenance` field (`benchmark` / `model` / `thirdParty` / `pending`) records who ran the evaluation, not who built the model - and drives the colour of every bar on the site.
- **One `resultGroups` entry is one table in one document.** Nothing is averaged across benchmarks; each chart plots exactly one published table.
- **The index compares, it never adds.** `ranking-engine.js` turns each board into within-board pairwise outcomes (discounted by the board's sampling noise) and pools them with Bradley-Terry. Raw numbers from two boards are never summed; the "Raw mean" switch exists only to show why.
- **Sim and real are two views, not one list.** No score is assumed to predict the other, so the Ledger switches between them rather than blending.
- **No number without a `sourceUrl` you can open.** Anything computed rather than cited (e.g. cross-board percentiles) is marked as derived and coloured differently (`--violet`) so it never looks like a cited value.
- **Filters are faceted.** Every dropdown on the Ledger rebuilds from whatever the other filters still allow, so no combination can return an empty table.

See inline comments in `tasks-data-new.js` for the full record schema if you're adding a new benchmark result.
