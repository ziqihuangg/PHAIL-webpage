/* =============================================================================
   PhAIL - Charts page
   -----------------------------------------------------------------------------
   Every chart here is built from one resultGroup in data/ledger.js, so a chart
   can never silently mix two benchmarks. If a group disappears from the data, its
   section says so instead of rendering an empty box.
   ========================================================================== */

const database = window.phailDatabase;
const charts = window.phailCharts;

const group = (id) => database.resultGroups.find((item) => item.id === id);
const model = (id) => database.models.find((item) => item.id === id);
const benchmark = (id) => database.benchmarks.find((item) => item.id === id);
const colorOf = (provenanceId) => database.provenance[provenanceId].color;

function label(row) {
  const name = model(row.model).name;
  return row.variant ? `${name} (${row.variant})` : name;
}

/* Columns are filled by ORGANISATION, so that every model out of one lab reads
   as one group across the page. Who produced the number stays on every record -
   it moves into the hover panel rather than onto the fill. */
const orgOf = (modelId) => database.organisations[model(modelId).org] || database.organisations.unconfirmed;

function benchmarkLabel(source) {
  const name = benchmark(source.benchmark).name;
  const track = source.track;
  /* Several benchmark names already carry their track ("RoboDojo (Sim)"), so
     only append it when it is not already in the name. */
  if (!track || track === "-" || name.toLowerCase().includes(track.toLowerCase())) return name;
  return `${name} (${track})`;
}

function columnRow(source, row, extra) {
  const details = [
    ["Organisation", orgOf(row.model).name],
    ["Benchmark", benchmarkLabel(source)],
    ["Source type", database.provenance[source.provenance].label],
    ["Reported by", source.reporter]
  ];
  if (row.submitter) details.push(["Submitted by", row.submitter]);
  (extra && extra.extraDetails ? extra.extraDetails : []).forEach((line) => details.push(line));
  details.push(["Protocol", source.protocol]);
  details.push(["Retrieved", source.retrieved]);
  return {
    label: label(row),
    value: extra ? extra.value : undefined,
    error: extra ? extra.error : undefined,
    color: extra ? extra.color : undefined,
    org: orgOf(row.model),
    reference: row.reference === true,
    href: `tasks.html?model=${row.model}`,
    details
  };
}

function sourceLine(source) {
  return `${source.protocol}. <a href="${source.sourceUrl}" target="_blank" rel="noreferrer">${source.source}</a> · ${database.provenance[source.provenance].label}, retrieved ${source.retrieved}.`;
}

/* --- shared page furniture -------------------------------------------------- */
const legendMount = document.querySelector("[data-provenance-legend]");
if (legendMount) {
  legendMount.innerHTML = Object.keys(database.provenance).map((key) => {
    const entry = database.provenance[key];
    return `<li><span class="provenance-swatch" style="background:${entry.color}"></span><span class="provenance-copy"><strong>${entry.label}</strong> - ${entry.detail}</span></li>`;
  }).join("");
}
const stampMount = document.querySelector("[data-updated-stamp]");
if (stampMount) {
  const rows = database.resultGroups.reduce((total, item) => total + item.rows.length, 0);
  stampMount.textContent = `${rows} records · ${database.resultGroups.length} cited sources · last updated ${database.meta.updated}`;
}

function section(name) {
  const block = document.querySelector(`[data-chart="${name}"]`);
  if (!block) return null;
  return {
    block,
    mount: block.querySelector("[data-chart-mount]"),
    caption: block.querySelector("[data-chart-caption]")
  };
}

function unavailable(target, why) {
  if (!target) return;
  target.mount.innerHTML = `<p class="chart-missing">${why}</p>`;
  target.caption.textContent = "";
}

/* --- 01: real-robot success ------------------------------------------------- */
(function realRobot() {
  const target = section("realRobot");
  const source = group("robochallenge-t30");
  if (!target) return;
  if (!source) return unavailable(target, "The RoboChallenge table is not in the current data file.");

  const rows = source.rows.slice().sort((a, b) => b.success - a.success);
  charts.mount(target.mount, (container) => charts.verticalBars(container, {
    unit: "%",
    max: 100,
    valueLabel: "binary success rate",
    rows: rows.map((row) => columnRow(source, row, {
      value: row.success,
      extraDetails: [["Progress score", String(row.score)]]
    }))
  }));
  target.caption.innerHTML = sourceLine(source) + ` Even the top entry completes fewer than two thirds of the tasks, and the axis runs to 100% deliberately - truncating it would flatter the field.`;
})();

/* --- 02: robustness, paired bars -------------------------------------------- */
(function robustness() {
  const target = section("robustness");
  const source = group("robotwin-2");
  if (!target) return;
  if (!source) return unavailable(target, "The RoboTwin 2.0 table is not in the current data file.");

  const rows = source.rows.slice().sort((a, b) => b.easy - a.easy);
  charts.mount(target.mount, (container) => charts.pairedBars(container, {
    unit: "%",
    max: 100,
    colorA: "#003b68",
    colorB: "#7f9db3",
    axisLabel: "Upper bar: clean scenes. Lower bar: domain-randomised scenes.",
    rows: rows.map((row) => ({ label: label(row), a: row.easy, b: row.hard }))
  }));
  target.caption.innerHTML = sourceLine(source) + ` Fast-WAM is the sharpest case: 77.8% clean, 1.9% randomised.`;
})();

/* --- 02b: robustness, scatter ------------------------------------------------ */
(function robustnessScatter() {
  const target = section("robustnessScatter");
  const source = group("robotwin-2");
  if (!target) return;
  if (!source) return unavailable(target, "The RoboTwin 2.0 table is not in the current data file.");

  charts.mount(target.mount, (container) => charts.scatter(container, {
    xUnit: "%", yUnit: "%",
    xMax: 100, yMax: 100,
    diagonal: true,
    diagonalLabel: "no loss under randomisation",
    xLabel: "Success rate on clean scenes (%)",
    yLabel: "Success rate under randomisation (%)",
    points: source.rows.map((row) => ({
      x: row.easy,
      y: row.hard,
      label: model(row.model).name,
      color: orgOf(row.model).color,
      title: `${label(row)} - clean ${row.easy}%, randomised ${row.hard}% (${orgOf(row.model).name})`
    }))
  }));
  target.caption.innerHTML = sourceLine(source) + ` The two policies closest to the line, GigaBrain-0.7 and OLA-Sem, are also the only ones whose randomised score stays above 65%.`;
})();

/* --- 03: capability dimensions ----------------------------------------------- */
(function dimensions() {
  const target = section("dimensions");
  const source = group("robodojo-sim");
  if (!target) return;
  if (!source) return unavailable(target, "The RoboDojo simulation table is not in the current data file.");

  /* Top twelve only, and no teleoperation reference row. The reference used to
     sit at the bottom of this grid at 80/100, which set the cell scale for
     everything else and left the actual field as a row of slivers. The live
     board no longer publishes it either. */
  const rows = source.rows.filter((row) => !row.reference).slice(0, 12);

  charts.mount(target.mount, (container) => charts.dimensionGrid(container, {
    dims: source.dims,
    max: 50,
    unit: "",
    axisLabel: "Cells are scaled to 50 of a possible 100 - no policy on this board is close to the top of the range.",
    rows: rows.map((row) => ({
      label: label(row),
      values: row.d,
      color: orgOf(row.model).color
    }))
  }));
  target.caption.innerHTML = sourceLine(source) + ` GPT-6-Astra, a general language model with no robotics training, is third on this board and has the opposite profile to every policy around it: first on memory and open-vocabulary instructions, last-tier on precision.`;
})();

/* --- 04: LIBERO by reporter --------------------------------------------------- */
(function libero() {
  const target = section("libero");
  if (!target) return;
  const groups = database.resultGroups.filter((item) => item.benchmark === "libero");
  if (!groups.length) return unavailable(target, "No LIBERO tables in the current data file.");

  /* The one chart on this page where the FILL is the source class rather than
     the organisation, because the source class is the whole subject. The badge
     under each column still carries the lab, so both readings are available. */
  const rows = [];
  groups.forEach((source) => {
    source.rows.forEach((row) => {
      if (typeof row.success !== "number") return;
      rows.push(columnRow(source, row, {
        value: row.success,
        color: colorOf(source.provenance),
        extraDetails: [["Suites", (source.suites || []).map((suite, i) => `${suite} ${row.s[i]}%`).join(", ")]]
      }));
    });
  });
  rows.sort((a, b) => b.value - a.value);

  charts.mount(target.mount, (container) => charts.verticalBars(container, {
    unit: "%", max: 100,
    valueLabel: "average across the four suites",
    legend: false,
    rows
  }));
  const sources = groups.map((source) => `<a href="${source.sourceUrl}" target="_blank" rel="noreferrer">${source.reporter}</a>`).join(", ");
  target.caption.innerHTML = `<strong>Bars on this chart are coloured by source class, not by organisation</strong> - it is the one place where who reported the number is the subject. The badge under each column still shows the lab. `
    + `${groups.length} separate sources, all cited in the <a href="tasks.html?benchmark=libero">Ledger</a>: ${sources}. `
    + `OpenVLA appears twice at the same 76.5% - once from its own README and once as a baseline in the OpenVLA-OFT paper - which is the rare case where a self-report and a third-party report agree exactly.`;
})();

/* --- 05: speed vs success ----------------------------------------------------- */
(function speed() {
  const target = section("speed");
  const source = group("oft-efficiency");
  if (!target) return;
  if (!source) return unavailable(target, "The inference-efficiency table is not in the current data file.");

  charts.mount(target.mount, (container) => charts.scatter(container, {
    xUnit: "", yUnit: "%",
    xMax: 120, yMax: 100,
    xLabel: "Action-generation throughput (Hz)",
    yLabel: "LIBERO-Long success rate (%)",
    height: 320,
    points: source.rows.map((row) => ({
      x: row.throughput,
      y: row.pairedSuccess,
      label: row.variant,
      color: colorOf(source.provenance),
      title: `${label(row)} - ${row.throughput} Hz, ${row.latencyMs} ms latency, ${row.pairedSuccess}% on LIBERO-Long`
    }))
  }));
  target.caption.innerHTML = sourceLine(source) + ` Both axes improved at once here, which is not the usual trade-off shape - parallel decoding and action chunking bought speed without costing success.`;
})();

/* --- 06: human preference ------------------------------------------------------ */
(function preference() {
  const target = section("preference");
  const source = group("roboarena");
  if (!target) return;
  if (!source) return unavailable(target, "The RoboArena table is not in the current data file.");

  charts.mount(target.mount, (container) => charts.verticalBars(container, {
    unit: "",
    min: 700,
    max: 1800,
    valueLabel: "Bradley-Terry score",
    rows: source.rows.slice().sort((a, b) => b.elo - a.elo).map((row) => columnRow(source, row, {
      value: row.elo,
      error: row.sd,
      extraDetails: [["Std. deviation", String(row.sd)], ["A/B evals", row.evals.toLocaleString("en-US")]]
    }))
  }));
  target.caption.innerHTML = sourceLine(source) + ` DreamZero leads on 190 comparisons; the policies below it have 600-1,100 each, so the gap is real but thinly sampled at the top.`;
})();

/* --- 07: the same model on two boards ------------------------------------------ */
(function crossBoard() {
  const target = section("crossBoard");
  if (!target) return;
  const challenge = group("robochallenge-t30");
  const dojoReal = group("robodojo-real");
  const liberoGroups = database.resultGroups.filter((item) => item.benchmark === "libero");
  const dojoSim = group("robodojo-sim");
  if (!challenge || !dojoReal || !dojoSim) return unavailable(target, "One of the source tables is missing from the current data file.");

  function bestSuccess(source, modelId) {
    const hits = source.rows.filter((row) => row.model === modelId && typeof row.success === "number");
    if (!hits.length) return null;
    return Math.max(...hits.map((row) => row.success));
  }

  const palette = ["#003b68", "#a2560a", "#2f6b4f", "#6a3d7c", "#8a2f33", "#41606d"];

  /* panel A: two real-robot boards */
  const sharedReal = database.models
    .map((entry) => ({ id: entry.id, name: entry.name, left: bestSuccess(challenge, entry.id), right: bestSuccess(dojoReal, entry.id) }))
    .filter((entry) => entry.left !== null && entry.right !== null)
    .sort((a, b) => b.left - a.left);

  /* panel B: LIBERO against RoboDojo sim */
  const sharedSim = database.models
    .map((entry) => {
      const liberoValues = liberoGroups.flatMap((source) => source.rows.filter((row) => row.model === entry.id && typeof row.success === "number").map((row) => row.success));
      return {
        id: entry.id,
        name: entry.name,
        left: liberoValues.length ? Math.max(...liberoValues) : null,
        right: bestSuccess(dojoSim, entry.id)
      };
    })
    .filter((entry) => entry.left !== null && entry.right !== null)
    .sort((a, b) => b.left - a.left);

  charts.mount(target.mount, (container) => {
    const panelA = document.createElement("div");
    panelA.className = "chart-panel";
    panelA.innerHTML = `<h3 class="chart-panel-title">Two real-robot boards, both run by the benchmark operator</h3>`;
    const surfaceA = document.createElement("div");
    panelA.appendChild(surfaceA);
    container.appendChild(panelA);
    charts.slope(surfaceA, {
      leftLabel: "RoboChallenge Table30",
      rightLabel: "RoboDojo real",
      axisLabel: "Binary success rate (%), same scale on both axes",
      height: 330,
      series: sharedReal.map((entry, index) => ({ label: entry.name, left: entry.left, right: entry.right, color: palette[index % palette.length] }))
    });

    const panelB = document.createElement("div");
    panelB.className = "chart-panel";
    panelB.innerHTML = `<h3 class="chart-panel-title">Best reported LIBERO score against the same model in RoboDojo simulation</h3>`;
    const surfaceB = document.createElement("div");
    panelB.appendChild(surfaceB);
    container.appendChild(panelB);
    charts.slope(surfaceB, {
      leftLabel: "LIBERO (best reported)",
      rightLabel: "RoboDojo sim",
      axisLabel: "Binary success rate (%), same scale on both axes",
      height: 380,
      series: sharedSim.map((entry, index) => ({ label: entry.name, left: entry.left, right: entry.right, color: palette[index % palette.length] }))
    });
  });

  target.caption.innerHTML = `Sources: <a href="${challenge.sourceUrl}" target="_blank" rel="noreferrer">RoboChallenge</a>, `
    + `<a href="${dojoReal.sourceUrl}" target="_blank" rel="noreferrer">RoboDojo</a>, and the LIBERO reports listed above. `
    + `DM0 sits second on RoboChallenge and last on RoboDojo real; OpenVLA-OFT reports 97.1% on LIBERO and scores 0.02% in RoboDojo simulation. `
    + `Averaging any of these into one index would produce a number that describes nothing.`;
})();

/* --- 08: what we could not chart -------------------------------------------------- */
(function gaps() {
  const list = document.querySelector("[data-gap-list]");
  if (!list) return;
  const pending = database.resultGroups.filter((item) => item.provenance === "pending");
  list.innerHTML = pending.map((item) => {
    const board = benchmark(item.benchmark);
    return `<li><strong>${board.name}</strong> <span>${item.note}</span>`
      + `<a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.source}</a></li>`;
  }).join("");
})();
