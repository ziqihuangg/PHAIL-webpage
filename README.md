# PHAIL-webpage

A static research dashboard mapping physical AI tasks, evaluation metrics, models, and benchmarks.

Open `index.html` directly or serve the folder with a local static server. No build step, no dependencies.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home / dashboard | `index.html` | Task categories, metrics table, model spec sheet, benchmark list |
| Tasks | `tasks.html` | The filterable evaluation ledger - every cited record, with a chart of whichever board is in view |
| Charts | `charts.html` | One chart per published table, plus the cross-board comparison that explains why there is no composite index |
| Metrics / Models / Benchmarks | `metrics.html`, `models.html`, `benchmarks.html` | Single sections cloned out of `index.html` by `section-page.js` |
| GPT-6 Astra | `gpt-6-astra.html` | Model spotlight: one model read across six published sources, with the clips and the questions they answer differently |
| About | `about.html` | Project statement |

## Data lives apart from rendering

[`tasks-data-new.js`](tasks-data-new.js) holds the ledger database. Rendering never contains data and data never contains markup:

- [`tasks-app.js`](tasks-app.js) - Tasks page: filters, ranking, table, in-view chart
- [`charts-page.js`](charts-page.js) - Charts page: one function per chart
- [`charts.js`](charts.js) - dependency-free SVG chart primitives (bars, paired bars, scatter, error bars, dimension grid, slope)
- [`script.js`](script.js) - site name, nav, header

The GPT-6-Astra spotlight follows the same rule with its own pair, because it is the ledger's mirror image - one model read across many documents, rather than one document listing many models:

- [`astra-data.js`](astra-data.js) - every number, citation, video URL and source class on that page
- [`astra-app.js`](astra-app.js) - draws them, through the same `window.phailCharts` primitives

It is deliberately *not* folded into `resultGroups`: most of its sources are not leaderboards (a safety-stopped diagnostic campaign, a piano-controller case study, a pull request), and giving them benchmark entries would invent structure the sources do not have. Its chart fills come from `astraData.classes`, a narrowed version of the ledger's provenance vocabulary. Videos are hot-linked from each source's own server with `preload="none"`, so the page loads no media until a clip is played.

### Source provenance

This is the part the ledger tries hardest to get right. Every record carries a `provenance` field recording **who produced the number**, not who made the model:

| Value | Shown as | Meaning |
| --- | --- | --- |
| `benchmark` | Benchmark-run | The benchmark operator ran the evaluation themselves - RoboChallenge, RoboDojo, RoboTwin, RoboArena. Where an outside team submitted the checkpoint, the row's `submitter` field records that. |
| `model` | Self-reported | The model's own authors published it, on a harness they controlled. |
| `thirdParty` | Third-party | A group that did not build the model produced or re-tabulated the number - usually a baseline column in a competing paper. |
| `pending` | No citable number | An evaluation is claimed or expected, but we have nothing we can cite. Kept visible on purpose. |

The colour of every bar on the site comes from this field.

### Organisations, colours, and logos

Chart columns are filled by **organisation**, so every model out of one lab reads as one group. Each model carries `org: "<id>"` pointing into the `organisations` map:

```js
organisations: {
  nvidia: { name: "NVIDIA", mark: "NV", color: "#76b900" },
  ...
}
```

- `logo` points at a file in `logos/`. The badge under each column draws it on a white tile.
- `mark` is the fallback monogram, drawn in the organisation colour when there is no logo file.
- `color` is the column fill; badge text colour is chosen automatically from its luminance.
- `site` records where the logo came from.
- `org: "unconfirmed"` renders grey and is a deliberate, meaningful value. Leave it grey rather than guessing.

#### The `logos/` folder

Each file is the organisation's own site icon, fetched from the `site` URL in the table, converted to PNG and capped at 128px. They are the trademarks of their respective owners and are used here only to identify which lab published a result — the same way any comparison table does. To refresh or add one:

1. Fetch the icon the site declares (`<link rel="apple-touch-icon">` first, then `rel="icon"`, then `/favicon.ico`).
2. Convert to PNG, cap at 128px, save as `logos/<org-id>.png`.
3. Point that organisation's `logo` field at it.

Five organisations have no logo file — `robotera`, `atlas`, plus `unconfirmed` and `reference`, which are not companies. They fall back to monograms automatically; nothing else needs changing.

#### Attributions

`maker` and `org` come from the paper's own title block wherever possible, not from the leaderboard row. For example RoboDojo lists "Hy-Embodied-0.5-VLA (Zhang et al., 2026a)" with no affiliation; the paper (arXiv:2606.14409) says Tencent Robotics X. When an affiliation had to be read off something other than the title block — a GitHub org, a project page — the model's `cite` field says so. Papers with several affiliations are filed under the first-listed one, with the full list in `maker`.

The one chart coloured by **source class** instead of organisation is `#libero` on the Charts page, where who reported the number is the entire subject. Its badges still show the lab.

### Adding results

Results are grouped so that **one `resultGroups` entry is one table in one document**. The citation is written once on the group and inherited by every row inside it. To add a board, copy a group, change the header, and paste the rows:

```js
{
  id: "my-benchmark-2026",
  task: "tabletop",              // id from tasks[]
  benchmark: "my_benchmark",     // id from benchmarks[]
  track: "Real",
  metric: "Success rate",
  provenance: "benchmark",       // see table above
  reporter: "Who published this table",
  source: "Human-readable citation, including the table number",
  sourceUrl: "https://...",      // must open
  retrieved: "2026-09-17",
  protocol: "20 tasks x 10 rollouts on ...",
  primary: "success",            // the field charts and ranking read
  unit: "%",
  rows: [
    { model: "pi05", success: 42.67, submitter: "Their team" }
  ]
}
```

Rules that keep the site honest:

- **No number without a `sourceUrl` you can open.** If a value exists only in a figure image, record it as `pending` with a note rather than eyeballing it.
- **Anything we computed gets `derived: true`** and a row note saying what we did. (Example: GR00T's LIBERO average, which NVIDIA publishes only as four per-suite counts.)
- **Never average across benchmarks.** Charts plot one `resultGroups` entry at a time. The single exception is the per-model profile on the Tasks page, where each bar is labelled with its own board and the caption says they are not comparable.
- `maker: "Not confirmed"` is a valid, deliberate value for models whose only source is a leaderboard row.

Optional row fields: `variant` (checkpoint or configuration), `submitter`, `note`, `reference: true` (human-teleoperation baselines - drawn as a dashed rule, excluded from ranking), `s: []` (per-suite breakdown, paired with a group-level `suites: []`), `d: []` (capability dimensions, paired with `dims: []`).

### Deep links

The Tasks page reads filters from the query string, so a model or a board can be linked directly:

```
tasks.html?model=pi05
tasks.html?benchmark=robochallenge&provenance=benchmark
```

Accepted keys: `task`, `benchmark`, `model`, `provenance`, `openness`, `embodiment`, `size`, `track`, `metric`, `q`.

## Local preview

```bash
python -m http.server 4173 --bind 127.0.0.1
```

- [Home](http://127.0.0.1:4173/)
- [Tasks](http://127.0.0.1:4173/tasks.html)
- [Charts](http://127.0.0.1:4173/charts.html)
- [Metrics](http://127.0.0.1:4173/metrics.html)
- [Models](http://127.0.0.1:4173/models.html)
- [Benchmarks](http://127.0.0.1:4173/benchmarks.html)
- [About](http://127.0.0.1:4173/about.html)
