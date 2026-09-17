/* =============================================================================
   PhAIL - Tasks page: filtered evaluation ledger
   -----------------------------------------------------------------------------
   Reads window.phailDatabase (tasks-data-new.js) and renders filters, a chart of
   whichever benchmark is in view, and the record table. No data lives here.
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

/* --- filter controls -------------------------------------------------------- */
const controls = {
  task: document.querySelector("#task-filter"),
  benchmark: document.querySelector("#benchmark-filter"),
  model: document.querySelector("#model-filter"),
  provenance: document.querySelector("#provenance-filter"),
  openness: document.querySelector("#openness-filter"),
  embodiment: document.querySelector("#embodiment-filter"),
  size: document.querySelector("#size-filter"),
  track: document.querySelector("#track-filter"),
  metric: document.querySelector("#metric-filter"),
  search: document.querySelector("#search-filter")
};

const resultCount = document.querySelector("[data-result-count]");
const recommendation = document.querySelector("[data-recommendation]");
const tableBody = document.querySelector(".task-database");
const chartMount = document.querySelector("[data-ledger-chart]");
const chartCaption = document.querySelector("[data-ledger-chart-caption]");
const chartTitle = document.querySelector("[data-ledger-chart-title]");
const legendMount = document.querySelector("[data-provenance-legend]");
const stampMount = document.querySelector("[data-updated-stamp]");

function unique(values) {
  return [...new Set(values.filter((value) => value && value !== "-"))].sort((a, b) => a.localeCompare(b));
}

function fillOptions(select, items, allLabel) {
  if (!select) return;
  select.innerHTML = `<option value="">${allLabel}</option>` +
    items.map((item) => `<option value="${item.value}">${item.label}</option>`).join("");
}

fillOptions(controls.task, database.tasks.map((task) => ({ value: task.id, label: task.name })), "All tasks");
fillOptions(controls.benchmark, database.benchmarks
  .filter((benchmark) => records.some((record) => record.benchmark.id === benchmark.id))
  .map((benchmark) => ({ value: benchmark.id, label: benchmark.name })), "All benchmarks");
fillOptions(controls.model, database.models
  .filter((model) => records.some((record) => record.model.id === model.id))
  .map((model) => ({ value: model.id, label: model.name })), "All models");
fillOptions(controls.provenance, Object.keys(database.provenance)
  .map((key) => ({ value: key, label: database.provenance[key].label })), "Any source type");
fillOptions(controls.openness, unique(database.models.map((model) => model.open)).map((value) => ({ value, label: value })), "Any licence");
fillOptions(controls.embodiment, unique(database.models.map((model) => model.embodiment)).map((value) => ({ value, label: value })), "All embodiments");
fillOptions(controls.size, unique(database.models.map((model) => model.size)).map((value) => ({ value, label: value })), "All sizes");
fillOptions(controls.track, unique(database.resultGroups.map((group) => group.track)).map((value) => ({ value, label: value })), "All tracks");
fillOptions(controls.metric, unique(database.resultGroups.map((group) => group.metric)).map((value) => ({ value, label: value })), "All metrics");

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

/* --- filtering -------------------------------------------------------------- */
function matches(record) {
  const query = controls.search.value.trim().toLowerCase();
  const haystack = [
    record.task.name, record.task.family, record.benchmark.name, record.model.name, record.model.maker,
    record.group.metric, record.group.source, record.group.reporter, record.row.variant || "",
    record.row.submitter || "", record.row.note || "", record.provenance.label
  ].join(" ").toLowerCase();

  return (!controls.task.value || record.group.task === controls.task.value)
    && (!controls.benchmark.value || record.group.benchmark === controls.benchmark.value)
    && (!controls.model.value || record.row.model === controls.model.value)
    && (!controls.provenance.value || record.provenanceId === controls.provenance.value)
    && (!controls.openness.value || record.model.open === controls.openness.value)
    && (!controls.embodiment.value || record.model.embodiment === controls.embodiment.value)
    && (!controls.size.value || record.model.size === controls.size.value)
    && (!controls.track.value || record.group.track === controls.track.value)
    && (!controls.metric.value || record.group.metric === controls.metric.value)
    && (!query || haystack.includes(query));
}

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
  return { easy: "clean scenes", hard: "randomised", sd: "SD", evals: "A/B evals", latencyMs: "latency", pairedSuccess: "LIBERO-Long" }[key] || key;
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
  const track = record.group.track;
  /* Several benchmark names already carry their track ("RoboDojo (Sim)"), so
     only append it when it is not already in the name. */
  if (!track || track === "-" || name.toLowerCase().includes(track.toLowerCase())) return name;
  return `${name} (${track})`;
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

/* --- one model, every board it appears on ------------------------------------
   The single case where plotting several benchmarks together is defensible: one
   model, each bar named after its own board, nothing averaged. Restricted to
   rows that report a binary success rate, so at least the quantity is the same
   kind of thing even though the task sets are not.
   --------------------------------------------------------------------------- */
function renderModelProfile(visible) {
  const rows = visible
    .filter((record) => typeof record.row.success === "number" && !record.isReference)
    .sort((a, b) => b.row.success - a.row.success);
  const boards = new Set(rows.map((record) => record.group.benchmark));
  if (rows.length < 3 || boards.size < 2) return false;

  const name = rows[0].model.name;
  chartTitle.textContent = `${name} · success rate on every board that reports one`;
  chartCaption.innerHTML = `Each bar is a different benchmark, named on the left, and is never averaged with the others - `
    + `the task sets, robots, and rollout counts all differ. `
    + `Rows that report no binary success rate (RoboArena's preference score, for instance) cannot appear here. `
    + `<a href="charts.html#cross-board">Why the spread is this wide.</a>`;

  charts.mount(chartMount, (container) => charts.verticalBars(container, {
    unit: "%", max: 100,
    valueLabel: "success rate",
    legend: false,
    rows: rows.map((record) => ({
      label: record.benchmark.name + (record.row.variant ? ` (${record.row.variant})` : ""),
      value: record.row.success,
      org: orgOf(record.model),
      details: [
        ["Model", record.model.name],
        ["Result", primaryDisplay(record)],
        ["Metric", record.group.metric],
        ["Source type", record.provenance.label],
        ["Reported by", record.group.reporter],
        ["Protocol", record.group.protocol]
      ]
    }))
  }));
  return true;
}

/* --- chart of whichever benchmark is in view -------------------------------- */
function renderChart(chosen, visible) {
  if (!chartMount) return;
  charts.resetMounts();
  chartMount.innerHTML = "";

  if (controls.model.value && renderModelProfile(visible)) return;

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
  const visible = records.filter(matches);

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

  resultCount.textContent = `${visible.length} of ${records.length} records`;
  const summaryAside = document.querySelector("[data-result-breakdown]");
  if (summaryAside) {
    summaryAside.textContent = provenanceCounts.length ? provenanceCounts.join(" · ") : "no records";
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

  renderChart(chosen, visible);

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

/* --- deep links: tasks.html?benchmark=robodojo_sim&provenance=model --------- */
const params = new URLSearchParams(window.location.search);
["task", "benchmark", "model", "provenance", "openness", "embodiment", "size", "track", "metric"].forEach((key) => {
  const value = params.get(key);
  if (!value || !controls[key]) return;
  const allowed = [...controls[key].options].some((option) => option.value === value);
  if (allowed) controls[key].value = value;
});
if (params.get("q") && controls.search) controls.search.value = params.get("q");

Object.values(controls).forEach((control) => control && control.addEventListener("input", render));
const resetButton = document.querySelector("[data-reset-filters]");
if (resetButton) {
  resetButton.addEventListener("click", () => {
    Object.values(controls).forEach((control) => { if (control) control.value = ""; });
    render();
  });
}

render();
