# PHAIL-webpage

A static research dashboard mapping physical AI tasks, evaluation metrics, models, and benchmarks.

Open `index.html` directly or serve the folder with a local static server. No build step, no dependencies.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home / dashboard | `index.html` | Task categories, metrics table, model spec sheet, benchmark list |
| Ledger | `tasks.html` | The filterable evaluation ledger - every cited record, with a chart of whichever board is in view. Nav label is "Ledger"; the filename stays `tasks.html` so old links keep working |
| Charts | `charts.html` | One chart per published table, plus the cross-board comparison that explains why there is no composite index |
| Benchmarks | `benchmarks.html` | Two sections cloned out of `index.html` by `section-page.js`: the board list and the metric glossary |
| Metrics / Models | `metrics.html`, `models.html` | Same mechanism, one section each. **No longer in the nav** - metrics moved under Benchmarks and the model specs are a slice of the ledger. The files stay so existing links resolve |
| GPT-6 Astra | `gpt-6-astra.html` | Model spotlight: one model read across six published sources, with the clips and the questions they answer differently |
| About | `about.html` | Project statement |

## Data lives apart from rendering

[`tasks-data-new.js`](tasks-data-new.js) holds the ledger database. Rendering never contains data and data never contains markup:

- [`tasks-app.js`](tasks-app.js) - Ledger page: the sim/real switch, faceted filters, ranking, table, in-view chart
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
- **Never average across benchmarks.** Charts plot one `resultGroups` entry at a time. The single exception is the per-model view on the Ledger page, and it does not plot values at all - see *Percentiles* below.
- **Prefer a live official board to the paper it came from.** Where a benchmark runs its own leaderboard, cite the board, not the arXiv table: they diverge. RoboDojo's July paper lists 30 models with the teleoperation reference at the top; its live board lists 45, has re-scored MolmoAct2 from 1.02 to 8.99, and no longer publishes the reference row at all.
- `maker: "Not confirmed"` is a valid, deliberate value for models whose only source is a leaderboard row.

Optional row fields: `variant` (checkpoint or configuration), `submitter`, `note`, `reference: true` (drawn as a dashed rule, excluded from ranking and from every chart), `s: []` (per-suite breakdown, paired with a group-level `suites: []`), `d: []` (capability dimensions, paired with `dims: []`).

Optional model field: `sizeB`, a parameter count in **billions**, present only where the source states a single figure - not for ranges ("27M-93M"), not for backbone-plus-head sums, not where the size is undisclosed. It is what the size slider filters on, so a model without one drops out the moment the slider is narrowed, and the summary line says how many did.

### Sim and real are two views, not one list

The switch above the Ledger filters picks between `track: "Sim"` and `track: "Real"`. They are not two slices of one population - nobody has shown that a simulation ranking predicts a real-robot one, and [the cross-board chart](charts.html) is the evidence. Records whose source states no track are all `pending` gaps rather than scores, so they stay visible in both views instead of disappearing.

### Filters are faceted

Task is the primary key. Every dropdown is rebuilt on each render from the records that survive the *other* filters, so the interface can never offer a combination that returns an empty table. A chosen value that stops being reachable falls back to "all" rather than sticking. See the next section for the second test an option has to pass.

### What the dropdowns withhold, and why it is not a list

**This is the section to read before adding a new benchmark.**

A dropdown option has to earn its place twice: at least one record must survive
the other filters, *and* at least one of those records must carry a citable
number. The second test exists because about a fifth of this ledger is
`pending` - an evaluation someone has claimed, or that plainly ought to exist,
with nothing we can cite yet. Those records stay in the table on purpose. But
offering them in a dropdown is a different promise: picking "Autonomous driving"
and landing on a single row that reads *leaderboard not transcribed* looks like
a broken filter, not like an honest gap.

So gaps stay in the table and come out of the dropdowns. **This file is the only
place the withheld set is written down** - the page itself says nothing about it,
by request, so the table below is what a future editor has to go on.

**Nothing here is a maintained exclusion list.** It is recomputed from the data
on every render, in `refreshOptions`. Add one citable number for a withheld task,
benchmark, model or embodiment and it reappears in its dropdown by itself. There
is no file to edit and nothing to remember to undo - only the snapshot below to
refresh, and it is a snapshot, not a switch.

As of 2026-09-17 the withheld set is:

| View | Withheld, gaps only |
| --- | --- |
| Simulation | Tasks: Autonomous driving, Embodied reasoning, World-model prediction. Benchmarks: Embodied-reasoning suite, PAI-Bench, WorldArena. Models: Gemini Robotics-ER 1.5, NVIDIA Cosmos |
| Real hardware | Tasks: Autonomous driving, Bimanual manipulation, Bin-picking and assembly, Embodied reasoning, Loco-manipulation, World-model prediction. Benchmarks: Embodied-reasoning suite, PAI-Bench, PhAIL (Positronic), Psi-0 own real suite, WorldArena. Models: AGIBOT BFM / GCFM, Gemini Robotics 1.5, Gemini Robotics-ER 1.5, Helix, NVIDIA Cosmos, Omega-0, Psi-0 |

Separately, two entries in the task taxonomy carry **no record at all**, in
either view - `mobile` (Mobile manipulation) and `locomotion` (Whole-body
locomotion). They are not a filtering decision, they are the part of the map
this ledger has not reached: BEHAVIOR-1K and ManiSkill3 would populate the
first, HumanoidBench the second.

### Percentiles

Selecting one model replaces the chart with its **position** on every board it appears on, not its scores. OpenVLA-OFT reports 97.1% on LIBERO and 0.02% on RoboDojo simulation; both are cited and drawing them as neighbouring bars would claim a comparison that does not exist. Percentile is pooled per benchmark across every source table that agrees on the metric field and unit, needs at least five entries to be drawn at all, and is filled in `--violet` because **this site computes it and no source publishes it**. The cited values stay in the table below, per row.

### Deep links

The Tasks page reads filters from the query string, so a model or a board can be linked directly:

```
tasks.html?model=pi05
tasks.html?benchmark=robochallenge&track=Real
```

Accepted keys: `task`, `benchmark`, `model`, `openness`, `embodiment`, and `track` (`Sim` or `Real`). A link to a model that only has records on the other track switches tracks to find it.

## Local preview

```bash
python -m http.server 4173 --bind 127.0.0.1
```

- [Home](http://127.0.0.1:4173/)
- [Ledger](http://127.0.0.1:4173/tasks.html)
- [Charts](http://127.0.0.1:4173/charts.html)
- [GPT-6 Astra](http://127.0.0.1:4173/gpt-6-astra.html)
- [Benchmarks](http://127.0.0.1:4173/benchmarks.html)
- [About](http://127.0.0.1:4173/about.html)

## Colour

Four colours mean *who produced a number* (`provenance`) and around forty mean *which lab built a model* (`organisations`). Both are data and neither is decoration. Two more belong to the interface and never appear on a bar - with one deliberate exception:

| Token | Used for |
| --- | --- |
| `--teal` `#0e7c86` | The rule above every section heading, callouts, the "top of the table" strip, rank cells, the stat figures on the Astra page |
| `--violet` `#5b3fc4` | Anything interactive: the selected tab, the size slider, focus rings, the current nav item. **Also the percentile bars**, because a percentile is the one quantity on this site that we computed rather than read off a board, and it should not look like anything cited |

The rule across the top of every page carries navy, teal and violet together, and is the only place all three appear at once.
