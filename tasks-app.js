/* =============================================================================
   PhAIL - Ledger page: filtered evaluation records
   -----------------------------------------------------------------------------
   Reads window.phailDatabase (tasks-data-new.js) and renders the sim/real
   switch, the filters, a chart of whichever benchmark is in view, and the record
   table. No data lives here.

   Three things in here are worth knowing before editing:

   1. TRACK IS NOT A FILTER, it is the view. Simulation numbers and real-hardware
      numbers are not two slices of one population; they are two different
      measurements that happen to share model names. The switch at the top picks
      one. Records whose source states no track are all documented gaps rather
      than scores, so they stay visible in both views instead of vanishing.

   2. THE FILTERS ARE FACETED. Task is the primary key: once a task is chosen,
      every other dropdown is rebuilt from the records that survive the OTHER
      filters, so it can never offer a combination that returns an empty table.

   3. ONE MODEL IS PLOTTED AS PERCENTILES, NOT VALUES. 97.1% on LIBERO and 0.02%
      on RoboDojo are both true, and drawing them as neighbouring bars says
      something false. Position on each board is the comparable quantity, so that
      is what the single-model view draws - flagged as ours, because no source
      publishes it.
   ========================================================================== */

const database = window.phailDatabase;
const charts = window.phailCharts;

const byId = (items, id) => items.find((item) => item.id === id);

/* --- flatten resultGroups into individual records -------------------------- */
const records = [];
database.resultGroups.forEach((group) => {
  group.rows.forEach((row, index) => {
    const model = byId(database.models, row.model);
    const value = group.primary ? row[group.primary] : undefined;
    records.push({
      key: `${group.id}:${index}`,
      group,
      row,
      model,
      task: byId(database.tasks, group.task),
      benchmark: byId(database.benchmarks, group.benchmark),
      provenance: database.provenance[group.provenance],
      provenanceId: group.provenance,
      value: typeof value === "number" ? value : null,
      isReference: row.reference === true
    });
  });
});

/* --- the six filters -------------------------------------------------------
   `get` is the value a record filters on; `label` is what the dropdown shows.
   Adding a seventh filter means adding one entry here and one <select> in the
   HTML - the faceting, the deep links and the reset button all follow.        */
const FILTERS = {
  task:       { el: "#task-filter",       all: "All tasks",       get: (r) => r.group.task,       label: (r) => r.task.name },
  benchmark:  { el: "#benchmark-filter",  all: "All benchmarks",  get: (r) => r.group.benchmark,  label: (r) => r.benchmark.name },
  model:      { el: "#model-filter",      all: "All models",      get: (r) => r.row.model,        label: (r) => r.model.name },
  openness:   { el: "#openness-filter",   all: "Any licence",     get: (r) => r.model.open,       label: (r) => r.model.open },
  embodiment: { el: "#embodiment-filter", all: "All embodiments", get: (r) => r.model.embodiment, label: (r) => r.model.embodiment }
};
const FILTER_KEYS = Object.keys(FILTERS);
FILTER_KEYS.forEach((key) => { FILTERS[key].node = document.querySelector(FILTERS[key].el); });

const resultCount = document.querySelector("[data-result-count]");
const recommendation = document.querySelector("[data-recommendation]");
const tableBody = document.querySelector(".task-database");
const chartMount = document.querySelector("[data-ledger-chart]");
const chartCaption = document.querySelector("[data-ledger-chart-caption]");
const chartTitle = document.querySelector("[data-ledger-chart-title]");
const legendMount = document.querySelector("[data-provenance-legend]");
const stampMount = document.querySelector("[data-updated-stamp]");
const trackSwitch = document.querySelector("[data-track-switch]");

/* --- track: the view, not a filter ----------------------------------------- */
let track = "Sim";
const hasTrack = (record) => record.group.track === "Sim" || record.group.track === "Real";
const inTrack = (record) => !hasTrack(record) || record.group.track === track;

/* --- model size: a range over the sizes that are actually published ---------
   Only models whose source states a single parameter count carry `sizeB`. The
   slider steps through those values rather than a smooth axis, so both ends
   always land on a number some lab actually published. At full width the range
   is inert and every model is in view, including the ones with no stated size;
   narrow it at all and those drop out, and the summary line says how many.    */
const sizeStops = [...new Set(database.models.map((item) => item.sizeB).filter((value) => typeof value === "number"))].sort((a, b) => a - b);
const sizeInputs = { min: document.querySelector("#size-min"), max: document.querySelector("#size-max") };
const sizeReadout = document.querySelector("[data-size-readout]");
const sizeFill = document.querySelector("[data-size-fill]");
let sizeRange = [0, Math.max(0, sizeStops.length - 1)];

function sizeIsFullWidth() {
  return sizeRange[0] === 0 && sizeRange[1] === sizeStops.length - 1;
}
function matchesSize(record) {
  if (sizeIsFullWidth()) return true;
  const size = record.model.sizeB;
  if (typeof size !== "number") return false;
  return size >= sizeStops[sizeRange[0]] && size <= sizeStops[sizeRange[1]];
}
function formatSize(value) {
  return value < 1 ? `${Math.round(value * 1000)}M` : `${value}B`;
}

if (sizeInputs.min && sizeInputs.max && sizeStops.length > 1) {
  [sizeInputs.min, sizeInputs.max].forEach((input, index) => {
    input.min = 0;
    input.max = sizeStops.length - 1;
    input.step = 1;
    input.value = index === 0 ? 0 : sizeStops.length - 1;
    input.addEventListener("input", () => {
      const next = [Number(sizeInputs.min.value), Number(sizeInputs.max.value)];
      /* Either handle may be dragged past the other; keep them ordered rather
         than blocking the drag, which feels broken under the finger. */
      sizeRange = [Math.min(next[0], next[1]), Math.max(next[0], next[1])];
      render();
    });
  });
}

function paintSize() {
  if (!sizeReadout || sizeStops.length < 2) return;
  const [low, high] = sizeRange;
  sizeReadout.textContent = sizeIsFullWidth()
    ? "any size"
    : `${formatSize(sizeStops[low])} - ${formatSize(sizeStops[high])}`;
  if (sizeFill) {
    const span = sizeStops.length - 1;
    sizeFill.style.left = `${(low / span) * 100}%`;
    sizeFill.style.right = `${100 - (high / span) * 100}%`;
  }
}

/* --- filtering -------------------------------------------------------------
   `skip` lets the faceting ask "what would be available if this one dropdown
   were open" without the dropdown narrowing itself to its own value.          */
function matches(record, skip) {
  if (!inTrack(record)) return false;
  if (!matchesSize(record)) return false;
  return FILTER_KEYS.every((key) => {
    if (key === skip) return true;
    const chosen = FILTERS[key].node ? FILTERS[key].node.value : "";
    return !chosen || String(FILTERS[key].get(record)) === chosen;
  });
}

/* --- faceted dropdowns ------------------------------------------------------
   Rebuilt on every render. A value that is no longer reachable is dropped and
   the filter falls back to "all", so the table can never be empty because of a
   combination the interface itself offered.                                   */
function refreshOptions() {
  FILTER_KEYS.forEach((key) => {
    const filter = FILTERS[key];
    if (!filter.node) return;
    const available = new Map();
    records.forEach((record) => {
      if (!matches(record, key)) return;
      const value = filter.get(record);
      if (!value || value === "-") return;
      if (!available.has(value)) available.set(value, filter.label(record));
    });
    const options = [...available.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    const current = filter.node.value;
    const stillThere = options.some(([value]) => value === current);
    filter.node.innerHTML = `<option value="">${filter.all}</option>` +
      options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
    filter.node.value = stillThere ? current : "";
    filter.node.disabled = options.length === 0;
  });
}

if (stampMount) {
  stampMount.textContent = `${records.length} records · ${database.resultGroups.length} cited sources · last updated ${database.meta.updated}`;
}

if (legendMount) {
  legendMount.innerHTML = Object.keys(database.provenance).map((key) => {
    const entry = database.provenance[key];
    return `<li><span class="provenance-swatch" style="background:${entry.color}"></span><span class="provenance-copy"><strong>${entry.label}</strong> - ${entry.detail}</span></li>`;
  }).join("");
}

/* Warm the logo cache once, so changing a filter redraws the badges without a
   frame of empty tiles while each PNG is fetched again. */
Object.values(database.organisations).forEach((org) => {
  if (org.logo) { const img = new Image(); img.src = org.logo; }
});

/* --- display helpers -------------------------------------------------------- */
function primaryDisplay(record) {
  const { group, row } = record;
  if (row.display) return row.display;
  if (record.value === null) return "Not reported";
  const main = charts.formatValue(record.value, group.unit === "%" ? "%" : "") + (group.unit === "%" ? "" : ` ${group.unit}`);
  if (group.secondary && typeof row[group.secondary] === "number") {
    const second = charts.formatValue(row[group.secondary], group.secondaryUnit === "%" ? "%" : "");
    return `${main} / ${second}${group.secondaryUnit && group.secondaryUnit !== "%" ? " " + group.secondaryUnit : ""}`;
  }
  return main;
}

function breakdownDisplay(record) {
  const { group, row } = record;
  if (group.suites && row.s) {
    return group.suites.map((suite, index) => `${suite} ${charts.formatValue(row.s[index], "%")}`).join(" · ");
  }
  if (group.dims && row.d) {
    const short = { "Generalization": "Gen", "Precision": "Prec", "Long-horizon": "Long", "Memory": "Mem", "Open-vocab": "Open" };
    return group.dims.map((dim, index) => `${short[dim] || dim} ${charts.formatValue(row.d[index], "")}`).join(" · ");
  }
  if (group.extras) {
    const parts = group.extras
      .filter((extra) => typeof row[extra] === "number")
      .map((extra) => `${extraLabel(extra)} ${charts.formatValue(row[extra], extraUnit(extra))}`);
    return parts.join(" · ");
  }
  return "";
}

function extraLabel(key) {
  return { easy: "clean scenes", hard: "randomised", sd: "SD", evals: "A/B evals", latencyMs: "latency",
    pairedSuccess: "LIBERO-Long", arx: "ARX X5", piper: "Piper", piperX: "Piper X" }[key] || key;
}
function extraUnit(key) {
  return { easy: "%", hard: "%", pairedSuccess: "%" }[key] || "";
}

/* --- chart plumbing --------------------------------------------------------
   Columns are coloured by ORGANISATION so that every model from one lab reads as
   one group. The source class (who produced the number) moves into the hover
   panel and the table - it is still on every record, just not on the fill.
   --------------------------------------------------------------------------- */
function orgOf(model) {
  return database.organisations[model.org] || database.organisations.unconfirmed;
}

function benchmarkLabel(record) {
  const name = record.benchmark.name;
  const trackName = record.group.track;
  /* Several benchmark names already carry their track ("RoboDojo (Sim)"), so
     only append it when it is not already in the name. */
  if (!trackName || trackName === "-" || name.toLowerCase().includes(trackName.toLowerCase())) return name;
  return `${name} (${trackName})`;
}

function chartRow(record) {
  const { group, row, model } = record;
  const details = [
    ["Organisation", orgOf(model).name],
    ["Benchmark", benchmarkLabel(record)],
    ["Result", primaryDisplay(record)],
    ["Source type", record.provenance.label],
    ["Reported by", group.reporter]
  ];
  if (row.submitter) details.push(["Submitted by", row.submitter]);
  details.push(["Protocol", group.protocol]);
  details.push(["Retrieved", group.retrieved]);
  return {
    label: model.name + (row.variant ? ` (${row.variant})` : ""),
    value: record.value,
    org: orgOf(model),
    reference: record.isReference,
    href: `tasks.html?model=${model.id}`,
    details
  };
}

function provenanceTag(record) {
  return `<span class="provenance-tag" style="--tag:${record.provenance.color}" title="${record.provenance.detail}">${record.provenance.short}</span>`;
}

/* --- pick what a chart may show ----------------------------------------------
   Charts never mix benchmarks, but they may merge several source tables that
   report the SAME benchmark in the same unit - LIBERO, for instance, is reported
   by five different groups and putting them on one axis is the whole point. We
   pick whichever benchmark has the most numeric rows in view, then merge only the
   tables under it that agree on metric and unit.
   --------------------------------------------------------------------------- */
function pickChartGroup(visible) {
  const numeric = visible.filter((record) => record.value !== null);
  if (!numeric.length) return null;

  const byBenchmark = new Map();
  numeric.forEach((record) => {
    const list = byBenchmark.get(record.group.benchmark) || [];
    list.push(record);
    byBenchmark.set(record.group.benchmark, list);
  });
  const chosenBenchmark = [...byBenchmark.keys()].sort((a, b) => byBenchmark.get(b).length - byBenchmark.get(a).length)[0];
  const candidates = byBenchmark.get(chosenBenchmark);

  /* keep only the tables that measure the same thing in the same unit */
  const leadGroup = candidates.sort((a, b) => b.value - a.value)[0].group;
  const rows = candidates.filter((record) => record.group.unit === leadGroup.unit && record.group.primary === leadGroup.primary);
  const sources = [...new Set(rows.map((record) => record.group.id))];

  return {
    rows: rows.slice().sort((a, b) => b.value - a.value),
    group: leadGroup,
    sources: sources.map((id) => rows.find((record) => record.group.id === id).group),
    otherBenchmarks: byBenchmark.size - 1
  };
}

/* --- one model, its position on every board ----------------------------------
   The single-model view. Absolute values across boards are not comparable and
   plotting them side by side implies that they are, so this draws where the
   model SITS on each board instead: the share of that board's entries it beats.
   The rank is taken over the whole source table, not over what the filters left
   visible, because a percentile against a filtered subset would mean nothing.
   --------------------------------------------------------------------------- */
/* Minimum size for a board to be worth a percentile. Below this, "top of the
   table" is a fact about how few people reported the benchmark. */
/* Minimum size for a board to be worth a percentile. Below this, "top of the
   table" is a fact about how few people reported the benchmark rather than about
   the model, so those boards are named in the caption instead of drawn. */
const MIN_BOARD = 5;

function percentileRows(modelId) {
  /* Pool by BENCHMARK, not by source table. LIBERO is reported by six separate
     groups and a percentile against only the table this model happens to sit in
     would flatter whoever published alone. Tables are merged only when they
     agree on the metric field and the unit - the same rule the benchmark chart
     uses - and the reference rows never count as competitors. */
  const pools = new Map();
  database.resultGroups.forEach((group) => {
    if (!group.primary) return;
    if ((group.track === "Sim" || group.track === "Real") && group.track !== track) return;
    const key = `${group.benchmark}|${group.primary}|${group.unit}`;
    const pool = pools.get(key) || { benchmark: group.benchmark, field: group.primary, rows: [], groups: [] };
    group.rows.forEach((row) => {
      if (typeof row[group.primary] !== "number" || row.reference === true) return;
      pool.rows.push({ model: row.model, value: row[group.primary], group });
    });
    if (!pool.groups.includes(group)) pool.groups.push(group);
    pools.set(key, pool);
  });

  const ranked = [];
  const tooSmall = [];
  pools.forEach((pool) => {
    const order = pool.rows.slice().sort((a, b) => b.value - a.value);
    const index = order.findIndex((row) => row.model === modelId);
    if (index < 0) return;
    const name = byId(database.benchmarks, pool.benchmark).name;
    if (order.length < MIN_BOARD) { tooSmall.push({ label: name, total: order.length }); return; }
    ranked.push({
      label: name,
      value: ((order.length - 1 - index) / (order.length - 1)) * 100,
      rank: index + 1,
      total: order.length,
      sources: pool.groups.length,
      group: order[index].group
    });
  });
  ranked.sort((a, b) => b.value - a.value);
  return { ranked, tooSmall };
}

/* Always returns true. Once a single model is in view this is THE chart: falling
   back to absolute values for the models that only appear on one board would
   mean the same view answered a different question depending on how widely the
   model happened to be evaluated. */
function renderModelProfile() {
  const modelId = FILTERS.model.node.value;
  const model = byId(database.models, modelId);
  const { ranked, tooSmall } = percentileRows(modelId);

  const aside = tooSmall.length
    ? ` Also on ${tooSmall.map((item) => `${item.label} (${item.total} entr${item.total === 1 ? "y" : "ies"})`).join(", ")}, `
      + `too few entries to rank against - the cited values are in the table below.`
    : "";

  chartTitle.textContent = `${model.name} · where it sits on each board`;

  if (!ranked.length) {
    chartMount.innerHTML = `<p class="chart-missing">No board in the ${track === "Sim" ? "simulation" : "real-hardware"} view ranks enough entries to place ${model.name}.</p>`;
    chartCaption.innerHTML = `A single model is always drawn as its position on each board rather than its score, and a position needs a field to hold it - `
      + `at least ${MIN_BOARD} ranked entries.${aside || " Every record for this model in this view is a documented gap rather than a number."}`;
    return true;
  }

  chartCaption.innerHTML = `Each bar is one published table, and its length is the share of that table's entries this model beats - `
    + `100% is top of the board, 0% is bottom. <strong>We compute this; no source publishes it.</strong> `
    + `Success rates are deliberately not drawn here: `
    + `<a href="charts.html#cross-board">the same model reads 97.1% on one board and 0.02% on another</a>, `
    + `and a bar length that means one thing per board would claim a comparison that does not exist. The cited values are in the table below, per row.`
    + aside;

  charts.mount(chartMount, (container) => charts.horizontalBars(container, {
    unit: "%",
    max: 100,
    valueWidth: 118,
    axisLabel: "Percentile within that board (computed by us)",
    rows: ranked.map((entry) => ({
      label: entry.label,
      value: entry.value,
      color: charts.colors.derived,
      suffix: `#${entry.rank} of ${entry.total}`,
      title: `#${entry.rank} of ${entry.total} entries on ${entry.group.metric}` + (entry.sources > 1 ? `, pooled from ${entry.sources} source tables` : "") + `. This model's row: ${entry.group.reporter} - ${entry.group.protocol}`
    }))
  }));
  return true;
}

/* --- chart of whichever benchmark is in view -------------------------------- */
function renderChart(chosen) {
  if (!chartMount) return;
  charts.resetMounts();
  chartMount.innerHTML = "";

  /* One model selected: the percentile view owns the chart, always. */
  if (FILTERS.model.node && FILTERS.model.node.value) { renderModelProfile(); return; }

  if (!chosen) {
    chartTitle.textContent = "Nothing numeric to plot in this view";
    chartCaption.textContent = "Every record here is a documented gap rather than a score. That is the point of leaving them visible.";
    return;
  }

  const { rows, group, sources, otherBenchmarks } = chosen;
  chartTitle.textContent = `${rows[0].benchmark.name} · ${group.metric}`;

  const citations = sources
    .map((item) => `<a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.reporter}</a>`)
    .join(", ");
  chartCaption.innerHTML = (sources.length > 1
    ? `${sources.length} separate sources report this benchmark, each with its own protocol - rollout counts and input configurations differ, and the table below gives them per row. Columns are coloured by organisation; the hover panel carries the source class. Sources: ${citations}.`
    : `${group.protocol}. Columns are coloured by organisation; the hover panel carries the source class. <a href="${group.sourceUrl}" target="_blank" rel="noreferrer">${group.source}</a>`)
    + (otherBenchmarks > 0
      ? ` <span class="chart-caption-aside">${otherBenchmarks} other benchmark${otherBenchmarks === 1 ? " is" : "s are"} in this view but not plotted here - different benchmarks are never merged into one chart.</span>`
      : "");

  charts.mount(chartMount, (container) => {
    charts.verticalBars(container, {
      unit: group.unit === "%" ? "%" : "",
      max: group.unit === "%" ? 100 : undefined,
      valueLabel: group.unit === "%" ? "success rate" : group.unit,
      legendNote: "One colour per organisation. Source class is in the hover panel and in the table below.",
      rows: rows.map((record) => chartRow(record))
    });
  });
}

/* --- main render ------------------------------------------------------------ */
function render() {
  refreshOptions();
  paintSize();

  const visible = records.filter((record) => matches(record));

  /* rank inside each source table, best first */
  const rankMap = new Map();
  const grouped = new Map();
  visible.forEach((record) => {
    const list = grouped.get(record.group.id) || [];
    list.push(record);
    grouped.set(record.group.id, list);
  });
  grouped.forEach((list) => {
    list.filter((record) => record.value !== null && !record.isReference)
      .sort((a, b) => b.value - a.value)
      .forEach((record, index) => rankMap.set(record.key, index + 1));
  });

  const ordered = visible.slice().sort((left, right) => {
    if (left.group.id !== right.group.id) {
      const leftSize = grouped.get(left.group.id).length;
      const rightSize = grouped.get(right.group.id).length;
      if (leftSize !== rightSize) return rightSize - leftSize;
      return left.group.id.localeCompare(right.group.id);
    }
    if (left.value === null && right.value === null) return 0;
    if (left.value === null) return 1;
    if (right.value === null) return -1;
    return right.value - left.value;
  });

  const provenanceCounts = Object.keys(database.provenance).map((key) => {
    const count = visible.filter((record) => record.provenanceId === key).length;
    return count ? `${count} ${database.provenance[key].short.toLowerCase()}` : null;
  }).filter(Boolean);

  const inThisTrack = records.filter(inTrack).length;
  resultCount.textContent = `${visible.length} of ${inThisTrack} ${track === "Sim" ? "simulation" : "real-hardware"} records`;
  const summaryAside = document.querySelector("[data-result-breakdown]");
  if (summaryAside) {
    const parts = provenanceCounts.slice();
    if (!sizeIsFullWidth()) {
      const noSize = records.filter((record) => inTrack(record) && typeof record.model.sizeB !== "number").length;
      if (noSize) parts.push(`${noSize} hidden for publishing no size`);
    }
    summaryAside.textContent = parts.length ? parts.join(" · ") : "no records";
  }

  /* Highlight: the top row of the one table the chart is showing. Deliberately
     not "the best record in view" - that would compare an Elo against a success
     rate and produce a winner that means nothing. */
  const chosen = pickChartGroup(visible);
  const best = chosen ? chosen.rows.find((record) => !record.isReference) : null;

  if (best) {
    recommendation.innerHTML = `<strong>Top of the table in view</strong>`
      + `<span>${best.model.name}${best.row.variant ? ` (${best.row.variant})` : ""} · ${primaryDisplay(best)} on ${best.benchmark.name}</span>`
      + provenanceTag(best)
      + `<a href="${best.group.sourceUrl}" target="_blank" rel="noreferrer">${best.group.source}</a>`;
  } else {
    recommendation.innerHTML = `<strong>No citable number in this view</strong><span>Only documented gaps match these filters. Use the source links to see what exists.</span>`;
  }

  renderChart(chosen);

  tableBody.innerHTML = ordered.length ? ordered.map((record) => {
    const { group, row, model } = record;
    const rank = rankMap.has(record.key) ? `#${rankMap.get(record.key)}` : record.isReference ? "ref" : "-";
    const breakdown = breakdownDisplay(record);
    const notes = [row.note, row.derived ? "Average computed by us from the cited per-suite numbers." : null, model.cite]
      .filter(Boolean).join(" ");
    return `<tr${record.isReference ? ' class="row-reference"' : ""}>`
      + `<td class="rank-cell">${rank}</td>`
      + `<td><strong>${model.name}</strong>${row.variant ? `<small>${row.variant}</small>` : ""}`
        + `<small>${model.maker} · ${model.open} · ${model.size}</small></td>`
      + `<td><strong>${record.task.name}</strong><small>${record.task.family}</small></td>`
      + `<td><a href="${record.benchmark.url}" target="_blank" rel="noreferrer">${record.benchmark.name}</a>`
        + `<small>${record.benchmark.type} · ${record.benchmark.year}</small></td>`
      + `<td>${group.track}</td>`
      + `<td><strong>${primaryDisplay(record)}</strong><small>${group.metric}</small>${breakdown ? `<small>${breakdown}</small>` : ""}</td>`
      + `<td>${provenanceTag(record)}<small>${group.reporter}</small>${row.submitter ? `<small>submitted by ${row.submitter}</small>` : ""}</td>`
      + `<td><a href="${group.sourceUrl}" target="_blank" rel="noreferrer">${group.source}</a>`
        + `<small>${group.protocol}</small>`
        + `<small>retrieved ${group.retrieved}</small>`
        + (notes ? `<small class="record-note">${notes}</small>` : "")
      + `</td>`
      + `</tr>`;
  }).join("") : `<tr><td colspan="8" class="empty-state">No records match these filters. That is a gap in the ledger, not a zero.</td></tr>`;
}

/* --- the sim/real switch ---------------------------------------------------- */
function paintTrack() {
  if (!trackSwitch) return;
  trackSwitch.querySelectorAll("[data-track]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.track === track));
  });
}

if (trackSwitch) {
  trackSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track]");
    if (!button) return;
    track = button.dataset.track;
    paintTrack();
    render();
  });
}

/* --- deep links: tasks.html?benchmark=robodojo_sim&track=Real --------------- */
const params = new URLSearchParams(window.location.search);
if (params.get("track") === "Real" || params.get("track") === "Sim") track = params.get("track");

/* A link from a chart points at one model, and that model may only appear on the
   other track. Follow it there rather than showing an empty view. */
const linkedModel = params.get("model");
if (linkedModel && !records.some((record) => record.row.model === linkedModel && inTrack(record))) {
  const elsewhere = records.find((record) => record.row.model === linkedModel && hasTrack(record));
  if (elsewhere) track = elsewhere.group.track;
}

paintTrack();
refreshOptions();
FILTER_KEYS.forEach((key) => {
  const value = params.get(key);
  if (!value || !FILTERS[key].node) return;
  const allowed = [...FILTERS[key].node.options].some((option) => option.value === value);
  if (allowed) FILTERS[key].node.value = value;
});

FILTER_KEYS.forEach((key) => FILTERS[key].node && FILTERS[key].node.addEventListener("change", render));
const resetButton = document.querySelector("[data-reset-filters]");
if (resetButton) {
  resetButton.addEventListener("click", () => {
    FILTER_KEYS.forEach((key) => { if (FILTERS[key].node) FILTERS[key].node.value = ""; });
    sizeRange = [0, Math.max(0, sizeStops.length - 1)];
    if (sizeInputs.min && sizeInputs.max) {
      sizeInputs.min.value = 0;
      sizeInputs.max.value = sizeStops.length - 1;
    }
    render();
  });
}

render();
