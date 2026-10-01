# PHAIL-webpage

A static research dashboard mapping physical AI tasks, evaluation metrics, models, and benchmarks.

## 1. Links

| | |
| --- | --- |
| Public | https://ziqihuangg.github.io/PHAIL-webpage/ |
| Local dev | `bash tools/preview.sh`, then open http://127.0.0.1:4173/ - runs `tools/preview_server.py` (caching off; the meeting-notes box, the baseline and the raw-source refresh can save) |
| Checks | `check.html` (Internal Work in Progress → Checks) - every check on data, formulas, explanations, sources and text, run in the browser |

No build step, nothing to install, no external requests - every page can also be opened directly from disk (notes are then read-only, and the Checks tab skips the two scans that need http). Every number is computed by the page's own JavaScript when it loads. The one third-party library, KaTeX (MIT), is vendored in `assets/vendor/katex/` and typesets the formulas on the Ranking tab.

## 2. What the webpage does

It maps what physical AI is and which benchmarks measure it, tracks results across benchmarks and models, ranks models across boards with a draft index, and records **who produced every number**, not just what the number is.

Tabs, left to right:

| Page | File | What it does |
| --- | --- | --- |
| Scope | `index.html` | Left-to-right taxonomy tree of physical AI (Execution / Design / Supporting capabilities) with every known benchmark; all counts are computed from `data/scope.js` on load. Below the tree: every benchmark in plain words, and the metric glossary |
| Robotics Index | `robotics-index.html` | Draft cross-board index for robot manipulation: switches, index chart, method with formulas, board weights, capability heatmap, model gaps, board agreement and pooled-vs-single check, size scatter, ranking factors |
| CAD Index | `cad-index.html` | The same engine and page code for CAD boards (`data/ranking-cad.js`): index, CAD-specific rules, weights, capabilities (text / edit / drawings / workflow), gaps, agreement, index against cost |
| Ledger | `tasks.html` | The filterable evaluation ledger - every cited record, with a chart of whichever board is in view |
| Charts | `charts.html` | One chart per published table, plus the cross-board comparison that explains why the index never adds numbers across boards |
| GPT-6 Astra | `gpt-6-astra.html` | Model spotlight: one model read across six published sources |
| Mobile Manipulation Platforms | `benchmark-landscape.html` | Internal comparison of Mobile / Loco-Manipulation and Dexterous benchmarks: tasks, tested robots/models, asset provenance and counts, simulator, reuse guide and coverage audit |
| Related work | `related.html` | Internal notes on closely related projects (noindex) |
| TODO | `todo.html` | The one list of open work, plus meeting notes from every tab |
| Checks | `check.html` | Runs every check (section 4) and lists what failed, what to look at, and what moved since the saved baseline |
| (no tab) | `models.html` | Model spec sheet, kept so old links resolve |
| (redirects) | `about.html`, `metrics.html` | Forward to `index.html`; `metrics.html` to the metric glossary at `index.html#metrics` |

Tabs are defined only in `js/common/site.js`: `pageLinks` are the top-level tabs (Scope, Robotics Index, Ledger); `internalLinks` (Mobile Manipulation Platforms, CAD Index, Charts, GPT-6 Astra, Related work, TODO, Checks) sit under one "Internal Work in Progress" tab that opens a menu on hover or tap. Pages ship an empty header. Every tab ends with "Things to discuss" (from `data/discussion.js`) and a meeting-notes box: under `bash tools/preview.sh`, a note typed there is written to `data/notes.js`.

## 3. Code logic

Pages stay at the root (their URLs are public); everything else is in folders. **Data and rendering are always separate files**, and **every calculation is in `js/engine/`** - page scripts only format.

```
*.html            one file per page
assets/           style.css, favicon, mark, logos/, vendor/katex/
data/             the database: every number and citation, no markup
  ledger.js         every table and row, with provenance and source (the Ledger)
  raw/              live boards saved exactly as served; sources.js lists them
  scope.js          the taxonomy: layer > domain > (group) > task > benchmarks
  ranking-robotics.js, ranking-cad.js   every knob of each index
  discussion.js, todo.js, related.js, astra.js, notes.js, expected.js (baseline)
js/common/        on every page: site.js (header, the tabs), selfcheck.js, facts.js,
                  charts.js (SVG primitives), icons.js, discussion.js, notes.js
js/engine/        maths only, no data, no markup
  ranking-engine.js    the index: noise, weights, Bradley-Terry, drop-one, tau
  ranking-analysis.js  every worked example and count the pages explain it with
  raw-sources.js       parses data/raw/ into Ledger rows when a page loads
js/pages/         one renderer per page (ledger.js = tasks.html; ranking.js = both indices)
js/check/         checks.js: everything check.html runs
tools/            preview.sh, preview_server.py, fetch_raw.py (Python 3 standard library)
```

A page loads, in order: `selfcheck.js`, `site.js`, `facts.js`, shared code, `data/`, `data/raw/` + `raw-sources.js` (pages that use the Ledger), `js/engine/`, its page script, then discussion and notes.

Session notes for coding agents go in [`dev_logs_for_coding_agent/`](dev_logs_for_coding_agent/).

Key conventions the data follows:

- **Provenance over authorship.** Every record's `provenance` field (`benchmark` / `model` / `thirdParty` / `pending`) records who ran the evaluation, not who built the model - and drives the colour of every bar on the site.
- **One `resultGroups` entry is one table in one document.** Nothing is averaged across benchmarks; each chart plots exactly one published table.
- **One colour per lab, everywhere.** `organisations[*].color` (chosen to stay distinct, not copied from logos) is read by the Ledger, Charts and Ranking, with no transparency.
- **Scope boards explain themselves.** Each board in `data/scope.js` carries `plain` / `tasks` / `models` / `usage`, each node a `define`; the Scope tab shows them on hover (switchable).
- **The index compares, it never adds.** `js/engine/ranking-engine.js` turns each board into within-board pairwise outcomes (discounted by the board's sampling noise) and pools them with Bradley-Terry. Raw numbers from two boards are never summed; the "Raw mean" switch exists only to show why.
- **Sim and real are two views, not one list.** No score is assumed to predict the other, so the Ledger switches between them rather than blending.
- **No number without a `sourceUrl` you can open.** Anything computed rather than cited (e.g. cross-board percentiles) is marked as derived and coloured differently (`--violet`) so it never looks like a cited value.
- **Filters are faceted.** Every dropdown on the Ledger rebuilds from whatever the other filters still allow, so no combination can return an empty table.

See inline comments in `data/ledger.js` for the full record schema if you're adding a new benchmark result.

## 4. Numbers: where they come from, and how they are checked

- **Live boards are not transcribed.** Each is saved as served in `data/raw/<id>.js` (RoboChallenge Table30, Table30-v2, the CVPR and ICRA competitions, PAW-GEN-10). `js/engine/raw-sources.js` parses it into its Ledger table on load; the table in `data/ledger.js` keeps only the citation and `entrants` (board entry -> our model id, plus a variant or note). To update: Checks tab → "Download every raw source again" (under `bash tools/preview.sh`), or `python3 tools/fetch_raw.py`. A new board entry still appears, under an `unmapped` model, and the Checks tab lists it for mapping. Paper tables are still typed, each with its source.
- **Text never types a number the data can give.** Data text (discussion, TODO, index configs) writes `{namespace.key}` - e.g. `{robotics.heldOutPct:robochallenge-t30}`, `{ledger.best:libero}`, `{scope.boards}`; HTML writes `<span data-m="key">`; formulas quote config values as KaTeX macros (`\cfgprior`, `\cfgtol`, ...). `js/common/facts.js` fills them; the keys are listed at the top of that file and in `facts()` in `ranking-analysis.js`. A number written on purpose (a definition, a proposal, a quoted protocol fact) is marked `{!text}` in data or `<span data-fact>` in HTML.
- **Every page checks itself.** `js/common/selfcheck.js` reads the page's own text before any script runs; if it finds a typed number, a missing value or a script error, a red line appears at the foot of the page, linking to the Checks tab.
- **The Checks tab** (`check.html`) runs: data integrity (ids, sources, ranges, configs point at real tables); every formula printed on the Index pages re-implemented from its text and compared with the engine on every row, pair and board of both indices (noise, win share, weights, Bradley-Terry fixed point, index, drop-one refits, held-out accuracy, tau); worked examples against the index; raw sources (loaded, unedited, every entrant mapped, downloaded in the last 14 days); typed numbers in data text and in every page (http only); formulas in page scripts (http only); and what moved since the saved baseline (`data/expected.js`): Ledger rows, ranks and index, board weights, quoted numbers. "Save the current numbers as the baseline" accepts the current state.


### Manipulation benchmark inventory

Open **Internal Work in Progress → Mobile Manipulation Platforms**. Research data lives in `data/benchmark-landscape.js`, rendering in `js/pages/benchmark-landscape.js`, and page-specific styling in `assets/benchmark-landscape.css`. Separate tables cover Mobile/Loco and Dexterous manipulation, including asset suppliers/acquisition, deformable objects and articulated objects with count scope. Filter by domain or simulator, search across fields, optionally include adjacent references, and export the filtered rows as CSV. Source links and version caveats are stored per entry.
