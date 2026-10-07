/* =============================================================================
   PhAIL - Ranking tab
   -----------------------------------------------------------------------------
   Draws whatever js/engine/ranking-engine.js returns for the current switches. The
   switches live in the URL (?track=Real&method=naive), so a particular view can
   be linked in a meeting and reloads the same.

   Colour: each lab's colour, exactly as in the Ledger and Charts - no
   transparency, so a model reads the same everywhere. Coverage is a number in
   the table, not a shade. Agents are named "(agent)". Violet is kept for scales that are ours alone:
   the capability heat map and the board-weight bars.
   ========================================================================== */

(function () {
  const db = window.phailDatabase;
  /* One renderer, two indices: the page says which with <body data-ranking>. */
  const rankingKey = document.body.dataset.ranking === "cad" ? "cad" : "robotics";
  const cfg = { robotics: window.phailRanking, cad: window.phailCadRanking }[rankingKey];
  const engine = window.phailRankingEngine;
  const charts = window.phailCharts;
  const icon = window.phailIcon || (() => "");
  if (!db || !cfg || !engine || !charts) return;

  const VIOLET = charts.colors.derived;
  const labColor = (id) => orgOf(id).color || "#8a949b";

  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  /* config prose may carry {tokens} (js/common/facts.js) */
  const prose = (text, where) => window.phailFacts.fill(escape(text), where);
  const models = new Map(db.models.map((model) => [model.id, model]));
  const nameOf = (id) => (models.get(id) || { name: id }).name;
  const orgOf = (id) => db.organisations[(models.get(id) || {}).org] || db.organisations.unconfirmed;
  const fixed = (value, digits) => (value === null || value === undefined ? "-" : Number(value).toFixed(digits === undefined ? 1 : digits));

  /* --- switches ------------------------------------------------------------------ */
  const controls = [
    { key: "track", label: "Boards", options: [["all", "All"], ["Sim", "Sim"], ["Real", "Real"]] },
    { key: "agents", label: "Entrants", options: [["true", "Policies + agents"], ["false", "Policies only"]] },
    { key: "coverage", label: "Show", options: [["1", "All models"], ["2", "On 2+ boards"], ["3", "On 3+ boards"]] },
    { key: "weighting", label: "Weights", options: [["difficulty", "By difficulty"], ["equal", "Equal"]] },
    { key: "evidence", label: "Evidence", options: [["benchmark", "Benchmark-run"], ["all", "+ paper tables"]] },
    { key: "method", label: "Method", options: [["bt", "Pairwise"], ["percentile", "Percentile mean"], ["naive", "Raw mean"]] }
  ].filter((control) => !cfg.controls || cfg.controls.indexOf(control.key) !== -1);
  const defaults = window.phailRankingAnalysis.defaults;
  const state = Object.assign({}, defaults);
  const params = new URLSearchParams(window.location.search);
  controls.forEach((control) => {
    const value = params.get(control.key);
    if (value && control.options.some((option) => option[0] === value)) state[control.key] = value;
  });
  let showAllCapabilities = false;
  let showAllRows = false;
  const ROW_LIMIT = 25;

  const controlMount = document.querySelector("[data-rank-controls]");
  function drawControls() {
    controlMount.innerHTML = controls.map((control) => `<div class="rank-control"><span class="rank-control-label">${control.label}</span>`
      + `<div class="track-switch track-switch--small" role="radiogroup" aria-label="${control.label}">`
      + control.options.map(([value, text]) => `<button type="button" role="radio" data-key="${control.key}" data-value="${value}" aria-checked="${state[control.key] === value}" aria-selected="${state[control.key] === value}">${text}</button>`).join("")
      + "</div></div>").join("")
      + '<button type="button" class="filter-reset" data-rank-reset>Reset</button>';
  }
  controlMount.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-rank-reset")) Object.assign(state, defaults);
    else state[button.dataset.key] = button.dataset.value;
    const query = new URLSearchParams();
    Object.keys(state).forEach((key) => { if (state[key] !== defaults[key]) query.set(key, state[key]); });
    window.history.replaceState(null, "", window.location.pathname + (query.toString() ? "?" + query : "") + window.location.hash);
    render();
  });

  const methodName = { bt: "pairwise (Bradley-Terry)", percentile: "percentile mean", naive: "raw-score mean" };

  /* --- render ------------------------------------------------------------------------ */
  function render() {
    drawControls();
    const opts = {
      track: state.track,
      agents: state.agents === "true",
      weighting: state.weighting,
      evidence: state.evidence,
      method: state.method
    };
    const result = engine.build(db, cfg, opts);
    const minCoverage = Number(state.coverage);
    const shown = result.entries.filter((entry) => entry.coverage >= minCoverage);
    const multi = result.entries.filter((entry) => entry.coverage >= 2).length;
    const naive = state.method === "naive";

    document.querySelector("[data-rank-summary]").innerHTML =
      `<strong>${result.entries.length} models</strong><span>fitted on ${result.boards.length} boards</span>`
      + `<span>${multi} sit on two or more</span><span>showing ${shown.length}</span>`
      + `<span class="database-summary-note">${escape(cfg.version)} &middot; ledger read ${escape(db.meta.updated)}</span>`;

    /* chart */
    document.querySelector("[data-rank-chart-title]").textContent = naive
      ? "Raw-score mean across boards - shown to be argued with, not used"
      : `${cfg.indexName || "PhAIL Index (draft)"} - ${methodName[state.method]}, ${state.weighting === "equal" ? "equal weights" : "difficulty-weighted"}`;
    const chartMount = document.querySelector("[data-rank-chart]");
    charts.resetMounts();
    charts.mount(chartMount, (container) => charts.verticalBars(container, {
      rows: shown.map((entry) => ({
        label: nameOf(entry.id) + (entry.agent ? " (agent)" : ""),
        value: Number(entry.index.toFixed(1)),
        range: naive ? null : entry.range,
        org: orgOf(entry.id),
        color: labColor(entry.id),
        href: "tasks.html?model=" + entry.id,
        details: [
          ["Rank", `${entry.rank} of ${result.entries.length}` + (naive ? "" : `; ${entry.rankRange[0]}-${entry.rankRange[1]} if one board is dropped`)],
          ["Boards", entry.boards.map((item) => `${item.board.label} ${item.rank}/${item.of}`).join(" · ")],
          ["Range", naive ? "-" : `${fixed(entry.range[0])} to ${fixed(entry.range[1])} if one board is dropped`],
          ["Maker", (models.get(entry.id) || {}).maker || "-"]
        ]
      })),
      max: naive ? undefined : 100,
      valueLabel: naive ? "mean of raw scores" : "index, 0-100 (computed by PhAIL)",
      legendNote: "Colour = lab, as in the Ledger.",
      nameLimit: 22
    }));
    document.querySelector("[data-rank-chart-caption]").innerHTML = naive
      ? "Each model's raw primary scores averaged across the boards it happens to be on, weighted as below. RoboArena's Elo cannot be averaged with percentages and is left out. Compare the order with the pairwise index: models entered on easy boards climb, models entered on hard ones sink."
      : "Whiskers: range when any one board is dropped. The Boards column below shows how many boards each model rests on.";

    drawTable(result, shown, naive);
    drawBoards(result, naive);
    drawCapabilities(result, shown);
    drawAgreement(result);
    drawSize(result, shown, naive);
  }

  /* --- ranking table ---------------------------------------------------------------- */
  function drawTable(result, shown, naive) {
    const visible = showAllRows ? shown : shown.slice(0, ROW_LIMIT);
    const more = document.querySelector("[data-rank-table-more]");
    more.hidden = shown.length <= ROW_LIMIT;
    more.textContent = showAllRows ? `Show the top ${ROW_LIMIT} only` : `Show all ${shown.length} models`;
    const body = visible.map((entry) => {
      const model = models.get(entry.id) || {};
      const org = orgOf(entry.id);
      const badge = org.logo
        ? `<img class="rank-logo" src="${escape(org.logo)}" alt="" />`
        : `<span class="rank-logo rank-logo--mark" style="background:${escape(org.color || "#8a949b")}">${escape(org.mark || "?")}</span>`;
      const width = Math.max(0, Math.min(100, entry.index));
      return `<tr>`
        + `<td class="rank-cell">${entry.rank}</td>`
        + `<td><span class="rank-model">${badge}<a href="tasks.html?model=${escape(entry.id)}">${escape(model.name || entry.id)}</a>${entry.agent ? '<span class="rank-tag rank-tag--agent">agent</span>' : ""}`
          + `${entry.boards.some((on) => on.row.row.harness === "product") ? '<span class="rank-tag" title="A CAD product with its own harness; it does not set its board\'s difficulty">product</span>' : ""}</span><small>${escape(model.maker || "")}</small></td>`
        + `<td class="num"><span class="rank-bar"><span style="width:${width}%;background:${labColor(entry.id)}"></span></span>${fixed(entry.index)}</td>`
        + `<td class="num">${naive ? "-" : `${fixed(entry.range[0])}-${fixed(entry.range[1])}`}</td>`
        + `<td class="num">${naive ? "-" : `${entry.rankRange[0]}-${entry.rankRange[1]}`}</td>`
        + `<td class="num">${entry.coverage}</td>`
        + `<td class="rank-positions">${entry.boards.map((item) => `<span title="${escape(item.board.label)}: ${escape(String(item.row.value))}${item.row.row && item.row.row.variant ? " (" + escape(item.row.row.variant) + ")" : ""}">${escape(item.board.label)} <b>${item.rank}</b>/${item.of}</span>`).join("")}</td>`
        + "</tr>";
    }).join("");
    document.querySelector("[data-rank-table]").innerHTML = `<table class="data-table rank-table">`
      + `<thead><tr><th>#</th><th>Model</th><th>${naive ? "Raw mean" : "Index"}</th><th>Drop-one range</th><th>Rank range</th><th>Boards</th><th>Position on each board</th></tr></thead>`
      + `<tbody>${body || '<tr><td colspan="7">No model meets this coverage on these boards.</td></tr>'}</tbody></table>`;
  }

  /* --- boards and weights -------------------------------------------------------------- */
  /* CAD boards say how a model is run on them, in place of the track */
  const runLabel = { agentic: "Agentic", single: "Single shot" };
  function drawBoards(result, naive) {
    const rows = result.boards.map((board) => {
      const held = board.heldOut;
      const heldText = state.method !== "bt" ? "pairwise only"
        : held ? `<span class="${held.accuracy < reading.weakHeldOut ? "held-weak" : ""}">${Math.round(held.accuracy * 100)}%</span> <small>of ${held.pairs} pair${held.pairs === 1 ? "" : "s"}</small>` : "<small>no overlap</small>";
      const url = board.group && board.group.sourceUrl;
      return `<tr><td>${url ? `<a href="${escape(url)}" target="_blank" rel="noreferrer">${escape(board.label)}</a>` : escape(board.label)}`
        + `<small>${escape(board.provenance === "benchmark" ? "benchmark-run" : board.provenance === "thirdParty" ? "third-party tables" : "paper tables")}${board.assumedTrials ? ", trials assumed" : ""}</small>`
        + (board.leftOut ? `<small>${board.leftOut} more ${board.minTasks ? `ran under ${board.minTasks} tasks` : "rows in submitters' own harnesses"}: Ledger only</small>` : "") + "</td>"
        + `<td>${escape(runLabel[board.run] || board.track)}</td><td class="num">${board.rows.length}</td>`
        + `<td class="num">${board.scale === "elo" ? fixed(board.best, 0) + " Elo" : fixed(board.best)}</td>`
        + `<td class="num">${fixed(board.difficulty, 2)}${board.scale === "elo" ? " <small>(no ceiling)</small>" : ""}</td>`
        + `<td class="num">${board.share === 1 ? "1" : fixed(board.share, 2)}</td>`
        + `<td class="num">${fixed(board.evidence, 1)}</td>`
        + `<td class="num"><span class="rank-bar rank-bar--narrow"><span style="width:${(board.weightShare * 100).toFixed(1)}%;background:${VIOLET}"></span></span>${(board.weightShare * 100).toFixed(0)}%</td>`
        + `<td class="num">${heldText}</td></tr>`;
    }).join("");
    document.querySelector("[data-rank-boards]").innerHTML = `<table class="data-table rank-boards-table">`
      + `<thead><tr><th>Board</th><th>${result.boards.some((board) => board.run) ? "Run" : "Track"}</th><th>Models</th><th>Best</th><th>Difficulty</th><th>Family share</th><th>Evidence</th><th>Weight</th><th>Held-out accuracy</th></tr></thead>`
      + `<tbody>${rows}</tbody></table>`;
  }

  /* --- capability profile ----------------------------------------------------------------- */
  function drawCapabilities(result, shown) {
    const caps = result.capabilities;
    const limit = 30;
    const rows = showAllCapabilities ? shown : shown.slice(0, limit);
    const cell = (value) => {
      if (value === undefined || value === null) return '<td class="heat heat--empty">&middot;</td>';
      const alpha = (value / 100) * 0.62;
      return `<td class="heat${value > 72 ? " heat--dark" : ""}" style="background:rgba(91,63,196,${alpha.toFixed(3)})">${Math.round(value)}</td>`;
    };
    const head = `<tr><th>Model</th><th class="heat-head">Index</th>${caps.map((item) => `<th class="heat-head" title="${escape(item.capability.name)}: ${escape(item.boards.map((board) => board.label).join(" + ") || "no board in view")}">${icon(item.capability.icon, 14)}<span>${escape(item.capability.short)}</span></th>`).join("")}</tr>`;
    const body = rows.map((entry) => `<tr><td>${escape(nameOf(entry.id))}${entry.agent ? ' <span class="rank-tag rank-tag--agent">agent</span>' : ""}</td>${cell(entry.index)}`
      + caps.map((item) => cell(item.index.get(entry.id))).join("") + "</tr>").join("");
    document.querySelector("[data-rank-capabilities]").innerHTML = `<table class="data-table heat-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
    const more = document.querySelector("[data-rank-capabilities-more]");
    if (shown.length > limit) {
      more.hidden = false;
      more.textContent = showAllCapabilities ? `Show the top ${limit} only` : `Show all ${shown.length} models`;
    } else {
      more.hidden = true;
    }
    document.querySelector("[data-rank-capability-sources]").innerHTML = caps.map((item) =>
      `<span><b>${escape(item.capability.name)}</b> ${escape(item.boards.map((board) => board.label).join(" + ") || "-")}</span>`).join("");
  }
  document.querySelector("[data-rank-table-more]").addEventListener("click", () => {
    showAllRows = !showAllRows;
    render();
  });
  document.querySelector("[data-rank-capabilities-more]").addEventListener("click", () => {
    showAllCapabilities = !showAllCapabilities;
    render();
  });

  /* --- board agreement ---------------------------------------------------------------------- */
  function drawAgreement(result) {
    const boards = result.boards;
    const head = `<tr><th></th>${boards.map((board) => `<th class="tau-head">${escape(board.label)}</th>`).join("")}</tr>`;
    const body = result.agreement.map((row, i) => `<tr><th class="tau-row">${escape(boards[i].label)}</th>` + row.map((cellData, j) => {
      if (i === j) return `<td class="tau tau--self">${boards[i].rows.length} models</td>`;
      if (cellData.tau === null) return `<td class="tau tau--none">${cellData.shared ? cellData.shared + " shared" : "-"}</td>`;
      const tone = cellData.tau >= 0 ? "pos" : "neg";
      const alpha = Math.min(1, Math.abs(cellData.tau)) * 0.55;
      const colour = tone === "pos" ? `rgba(14,124,134,${alpha.toFixed(2)})` : `rgba(176,74,90,${alpha.toFixed(2)})`;
      return `<td class="tau tau--${tone}" style="background:${colour}">${cellData.tau >= 0 ? "+" : "&minus;"}${Math.abs(cellData.tau).toFixed(2)}<small>${cellData.shared} shared</small></td>`;
    }).join("") + "</tr>").join("");
    document.querySelector("[data-rank-agreement]").innerHTML = `<table class="data-table tau-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  }

  /* --- index against size, or against cost where the config names a cost column --------------- */
  function drawSize(result, shown, naive) {
    if (cfg.cost) return drawCost(result, shown, naive);
    const points = shown
      .filter((entry) => typeof (models.get(entry.id) || {}).sizeB === "number")
      .map((entry) => {
        const model = models.get(entry.id);
        return {
          x: Math.log10(model.sizeB),
          y: entry.index,
          label: model.name,
          color: labColor(entry.id),
          title: `${model.name}: ${model.size}; index ${fixed(entry.index)} (${entry.coverage} board${entry.coverage === 1 ? "" : "s"})`
        };
      });
    const mount = document.querySelector("[data-rank-size]");
    mount.innerHTML = "";
    if (!points.length) {
      mount.innerHTML = '<p class="chart-missing">No model in this view states a parameter count.</p>';
    } else {
      charts.mount(mount, (container) => charts.scatter(container, {
        points: points,
        xMin: -1.25, xMax: 1.05,
        yMin: 0, yMax: naive ? undefined : 100,
        xTicks: [[-1, "0.1B"], [Math.log10(0.3), "0.3B"], [0, "1B"], [Math.log10(3), "3B"], [1, "10B"]],
        xLabel: "Parameters (log scale, as stated by the authors)",
        yLabel: naive ? "Raw mean" : "Index",
        height: 330
      }));
    }
    document.querySelector("[data-rank-size-caption]").textContent =
      `${points.length} of the ${shown.length} models shown state a parameter count.`;
  }

  function drawCost(result, shown, naive) {
    const points = shown.map((entry) => {
      const item = entry.boards.filter((own) => own.board.id === cfg.cost.board)[0];
      const cost = item && item.row.row[cfg.cost.field];
      if (typeof cost !== "number" || cost <= 0) return null;
      const model = models.get(entry.id) || { name: entry.id };
      return {
        x: Math.log10(cost),
        y: entry.index,
        label: model.name,
        color: labColor(entry.id),
        title: `${model.name}: $${cost.toFixed(2)} per task${item.row.row.variant ? ` (${item.row.row.variant})` : ""}; index ${fixed(entry.index)}`
      };
    }).filter(Boolean);
    const mount = document.querySelector("[data-rank-size]");
    mount.innerHTML = "";
    if (!points.length) {
      mount.innerHTML = '<p class="chart-missing">No model in this view has a published cost.</p>';
    } else {
      const xs = points.map((point) => point.x);
      const ticks = [0.5, 1, 2, 5, 10, 20, 50].map((usd) => [Math.log10(usd), `$${usd}`]);
      charts.mount(mount, (container) => charts.scatter(container, {
        points: points,
        xMin: Math.min.apply(null, xs) - 0.12, xMax: Math.max.apply(null, xs) + 0.12,
        yMin: 0, yMax: naive ? undefined : 100,
        xTicks: ticks.filter((tick) => tick[0] >= Math.min.apply(null, xs) - 0.12 && tick[0] <= Math.max.apply(null, xs) + 0.12),
        xLabel: `${cfg.cost.label} (log scale)`,
        yLabel: naive ? "Raw mean" : "Index",
        height: 330
      }));
    }
    document.querySelector("[data-rank-size-caption]").textContent =
      `${points.length} of the ${shown.length} models shown have a published cost there; the cost is the one of the run the index uses.`;
  }

  /* --- explanations: one analysis at the default settings --------------------------------------
     Every number below the switches that does not follow them - worked
     examples, counts, agreement, gaps - comes from js/engine/ranking-analysis.js,
     which uses only the engine's own formulas. This file formats it. */
  const analysis = window.phailRankingAnalysis.explain(db, cfg, defaults);
  const base = analysis.base;
  window.phailFacts.set(rankingKey, window.phailRankingAnalysis.facts(analysis, db, cfg));
  const reading = window.phailRankingAnalysis.reading;
  const chance = (a, b) => base.strengths.get(a) / (base.strengths.get(a) + base.strengths.get(b));
  const numberWord = (n) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n] || String(n);

  /* --- model gaps (static: raw published scores, not the index) ----------------------------------
     The rules come from cfg.gaps; the numbers from the analysis, so nothing in
     this section is typed by hand. */
  const gapMount = document.querySelector("[data-rank-gaps]");
  if (gapMount && cfg.gaps) {
    const groupOf = (id) => db.resultGroups.filter((group) => group.id === id)[0];
    const boardName = (id) => {
      if (cfg.boards[id]) return cfg.boards[id].label;
      const group = groupOf(id);
      const meta = group && (db.benchmarks || []).filter((item) => item.id === group.benchmark)[0];
      return meta ? meta.name : id;
    };
    const who = (entry) => `<small>${escape(nameOf(entry.model))}</small>`;
    const agentTag = '<span class="rank-tag rank-tag--agent">agent</span>';
    const unitOf = (cell) => (cell.field === "success" || (groupOf(cell.id) || {}).unit === "%" ? "%" : "");
    const axes = analysis.gaps.filter((item) => item && item.gap.kind === "axis").length;

    const rowFor = (item) => {
      const gap = item.gap;
      if (gap.kind === "level") {
        const cells = item.cells;
        const many = cells.length > 1;
        const tag = (cell) => (many ? `<span class="gap-board">${escape(boardName(cell.id))}</span>` : "");
        const fails = cells.map((cell) => cell.fails);
        return {
          board: many ? "" : boardName(cells[0].id),
          best: cells.map((cell) => `<div>${tag(cell)}<b>${fixed(cell.best.value)}${unitOf(cell)}</b> ${who(cell.best)}</div>`).join(""),
          typical: cells.map((cell) => `<div>${tag(cell)}${fixed(cell.median)}${unitOf(cell)}</div>`).join(""),
          reading: !item.successLike
            ? (many
              ? `The best entry reaches ${cells.map((cell) => `${fixed(cell.best.value)}${unitOf(cell)}`).join(", ")} on these boards (0-100 each). They score differently, so their bests are not compared with each other.`
              : `The best entry reaches ${fixed(cells[0].best.value)}${unitOf(cells[0])} of 100; half of the ${cells[0].rows} entries stay below ${fixed(cells[0].median)}${unitOf(cells[0])}.`)
            : many
            ? `Even the best entry on each board fails ${Math.min.apply(null, fails)}-${Math.max.apply(null, fails)}% of its trials. The boards differ in difficulty, so their bests are not compared with each other.`
            : `Even the best entry fails ${fails[0]}% of episodes; half of the ${cells[0].rows} entries succeed in fewer than ${fixed(cells[0].median)}%.`
        };
      }
      if (gap.kind === "axis") {
        return {
          board: boardName(gap.board),
          best: `<div><b>${fixed(item.top.value)}</b> ${who(item.top)}</div>`
            + (item.agent ? `<div><b>${fixed(item.agent.value)}</b> ${who(item.agent)} ${agentTag}</div>` : ""),
          typical: fixed(item.median),
          reading: `${item.below} of ${item.policies} trained policies score below ${gap.low} out of 100.`
            + (item.strongest ? ` The strongest of the ${numberWord(axes)} axes.` : item.weakest ? ` The weakest of the ${numberWord(axes)} axes.` : "")
            + (item.agent ? ` ${escape(nameOf(item.agent.model))}, an LLM driving the arm through a harness, beats every trained policy here.` : "")
        };
      }
      if (gap.kind === "drop") {
        return {
          board: boardName(gap.board),
          best: `<div><b>${fixed(item.top.to)}%</b> ${escape(gap.labels[1])} ${who(item.top)}</div>`,
          typical: `${fixed(item.medianFrom)}% ${escape(gap.labels[0])} &rarr; ${fixed(item.medianTo)}% ${escape(gap.labels[1])}`,
          reading: `${item.halved} of ${item.rows} policies lose more than half of their ${escape(gap.labels[0])} score. Largest fall: ${escape(nameOf(item.worst.model))}, ${fixed(item.worst.from)}% &rarr; ${fixed(item.worst.to)}%.`
        };
      }
      if (gap.kind === "arms") {
        return {
          board: boardName(gap.board),
          best: `<div><b>${fixed(item.top.min)}</b> on its weakest arm ${who(item.top)}</div>`,
          typical: `weakest arm ${fixed(item.medianMin)}, best arm ${fixed(item.medianMax)}`,
          reading: `${escape(item.weakLabel)} is the weakest arm for ${item.weakCount} of ${item.rows} policies; ${item.zero} score zero on at least one arm. A policy's score depends on which arm it runs on.`
        };
      }
      return null;
    };

    const body = analysis.gaps.map((item) => {
      const row = item && rowFor(item);
      if (!row) return "";
      return `<tr><td>${escape(item.gap.name)}</td><td>${prose(item.gap.asks, "gaps")}${row.board ? `<small>${escape(row.board)}</small>` : ""}</td>`
        + `<td class="gap-best">${row.best}</td><td class="gap-typical">${row.typical}</td><td>${row.reading}</td></tr>`;
    }).join("");
    gapMount.innerHTML = `<table class="data-table gap-table"><thead><tr><th>Capability</th><th>What is tested</th><th>Best</th><th>Median</th><th>Reading</th></tr></thead><tbody>${body}</tbody></table>`;
    /* Everything on the Scope tab whose boards the ledger holds no numbers
       for yet: whole domains by name, else task categories and capability
       boards listed apart (a capability row above can come from RoboDojo's
       axes while the dedicated boards are still untranscribed). */
    const unmeasuredMount = document.querySelector("[data-rank-gaps-unmeasured]");
    const scope = window.phailScope;
    if (unmeasuredMount && scope) {
      const hasLedger = (task) => task.benchmarks.some((benchmark) => benchmark.ledger);
      const names = (tasks) => escape(tasks.map((task) => task.name).join(", "));
      const parts = [];
      const whole = [];
      scope.layers.filter((layer) => !layer.boundary).forEach((layer) => layer.domains.filter((domain) => !cfg.scopeDomains || cfg.scopeDomains.indexOf(domain.id) !== -1).forEach((domain) => {
        const missing = domain.tasks.filter((task) => !hasLedger(task));
        if (!missing.length) return;
        if (missing.length === domain.tasks.length) { whole.push(domain.name); return; }
        const tasks = missing.filter((task) => task.kind !== "capability");
        const capabilityBoards = missing.filter((task) => task.kind === "capability");
        if (tasks.length) parts.push(`<span><b>${escape(domain.name)} tasks</b> ${names(tasks)}</span>`);
        if (capabilityBoards.length) parts.push(`<span><b>${escape(domain.name)} capability boards</b> ${names(capabilityBoards)}</span>`);
      }));
      if (whole.length) parts.push(`<span><b>${escape(whole.join(", "))}</b> every board</span>`);
      unmeasuredMount.innerHTML = parts.length ? `<span>Boards on the Scope tab with no numbers in the ledger yet, so their gaps are not read here:</span>${parts.join("")}` : "";
    }
  }

  /* --- Index method: overview counts and the numbers inside each step's details -------------------
     Static: always the default settings (the analysis above), so the
     explanation does not change when a reader flips a switch. */
  function drawMethod() {
    const boards = base.boards;
    window.phailFacts.applyTo(document, rankingKey);
    const mount = (key, html) => { const node = document.querySelector(`[data-method="${key}"]`); if (node) node.innerHTML = html; };
    const table = (head, rows) => `<div class="method-table-wrap"><table class="method-table"><thead><tr>${head.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>`
      + rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>";
    const unitOf = (board) => (board.scale === "elo" ? " Elo" : board.metric === "success" ? "%" : "");
    const columnName = { success: "success rate", score: "score (0-100)", elo: "Elo rating" };
    const shown = (board, value) => fixed(value, board.scale === "elo" ? 0 : 1) + unitOf(board);

    /* 1. boards */
    mount("boards", table(["Board", "Run by", "Track", "Models", "Trials per model", "Ranked by", "Read"], boards.map((board) => [
      `<a href="${escape(board.group.sourceUrl)}" target="_blank" rel="noreferrer">${escape(board.label)}</a>`,
      escape(String(board.group.reporter || "").replace(/\s*\([^)]*\)/g, "").replace(/,.*$/, "")), escape(board.track),
      board.rows.length + (board.leftOut ? ` <small>(+${board.leftOut} ${board.minTasks ? `under ${board.minTasks} tasks` : "in own harnesses"})</small>` : ""),
      board.scale === "elo" ? "own SD per model" : board.trials.toLocaleString("en"),
      columnName[board.metric] || escape(board.metric), escape(board.group.retrieved || "")])));

    /* 2. one model's raw scores across boards */
    const widest = analysis.pivot;
    if (widest) {
      mount("raw", `<p>Example: <b>${escape(nameOf(widest.id))}</b> is on ${widest.coverage} boards.</p>`
        + table(["Board", "Its score", "Its place"], widest.boards.map((item) => [escape(item.board.label), shown(item.board, item.row.value), `${item.rank} of ${item.of}`]))
        + `<p>Averaged, these raw numbers would mostly say which boards it happened to enter. The index uses only its places, and how clearly it won or lost each pair.</p>`);
    }

    /* 3. noise; a board that publishes its own interval uses it instead of the trial count */
    const noiseRows = analysis.noise.map((item) => [escape(item.board.label),
      item.published ? "<small>own 95% interval</small>" : item.board.trials.toLocaleString("en"),
      fixed(item.median), fixed(item.sigma, 2), fixed(item.pOnePoint, 2), fixed(item.gapFor98, 1)]);
    const ex = analysis.noiseExample;
    const noiseExample = ex
      ? `<p>Example on ${escape(ex.board.label)}: ${escape(nameOf(ex.a.model))} ${fixed(ex.a.value)} against ${escape(nameOf(ex.b.model))} ${fixed(ex.b.value)}. &sigma; = ${fixed(ex.sigma, 1)}, so P = &Phi;(${fixed(ex.z, 1)}) = ${fixed(ex.p, 2)}: close to a full win.</p>`
      : "";
    mount("noise", table(["Board", "Trials n", "Median score", "&sigma; for two models at the median", "A 1-point gap gives P =", "Gap for P &asymp; 0.98"], noiseRows) + noiseExample);

    /* Elo: the head-to-head preference a rating gap implies, against the
       confidence in the order that the index uses */
    const elo = analysis.elo;
    if (elo) {
      const row = (label, tex, note) => `<div class="eq"><span class="eq-label">${label}</span><span class="eq-body">\\(\\displaystyle ${tex}\\)</span></div>` + (note ? `<div class="eq-note">${note}</div>` : "");
      const a = nameOf(elo.a.model);
      mount("elo", `<p>Example from the Ledger: ${escape(a)} ${fixed(elo.a.value, 0)} &plusmn; ${fixed(elo.sdA, 1)} against ${escape(nameOf(elo.b.model))} ${fixed(elo.b.value, 0)} &plusmn; ${fixed(elo.sdB, 1)} on ${escape(elo.board.label)}, a gap of ${fixed(elo.gap, 0)} points.</p>`
        + `<div class="step-math">`
        + row("Elo's question", `\\Pr(\\text{preferred}) = \\frac{1}{1 + 10^{-${fixed(elo.gap, 0)}/400}} \\approx ${elo.preferred.toFixed(2)}`, `how often evaluators should prefer ${escape(a)} in one head-to-head`)
        + row("the index's question", `\\Phi\\!\\left(\\frac{${fixed(elo.gap, 0)}}{\\sqrt{${fixed(elo.sdA, 1)}^{2} + ${fixed(elo.sdB, 1)}^{2}}}\\right) = \\Phi(${elo.z.toFixed(1)}) \\approx ${elo.p.toFixed(2)}`, `how sure we are that ${escape(a)}'s rating really is the higher one - the question the index asks on every board`)
        + `</div>`);
    }

    /* 4. weights */
    const weightRows = boards.map((board) => [escape(board.label), `${fixed(board.best, board.scale === "elo" ? 0 : 1)}${unitOf(board)} <small>${escape(nameOf(board.bestModel || board.rows[0].model))}</small>`,
      board.scale === "elo" ? `${fixed(board.difficulty, 2)} <small>no ceiling</small>` : fixed(board.difficulty, 2), fixed(board.share, 2), fixed(board.evidence, 1), fixed(board.weight, 3), `${(board.weightShare * 100).toFixed(1)}%`]);
    const saturated = analysis.saturated;
    mount("weights", table(["Board", "Best score", "<i>d</i>", "<i>f</i>", "<i>e</i>", "<i>w</i>", "Share"], weightRows)
      + (saturated && saturated.difficulty < reading.saturated ? `<p>With paper tables switched on, ${escape(saturated.label)} has a best of ${fixed(saturated.best)}, so <i>d</i> = ${fixed(saturated.difficulty, 2)} and, at half evidence, it barely counts.</p>` : ""));

    /* 5. pairs */
    mount("pairs", table(["Board", "Models <i>k</i>", "Pairs", "Weight per pair", "Total per model"], analysis.pairs.map((item) =>
      [escape(item.board.label), item.k, item.pairs.toLocaleString("en"), fixed(item.perPair, 4), fixed(item.weight, 3)])));

    /* 6. Bradley-Terry: how much evidence, and one chain of comparisons */
    const c = analysis.chain;
    const chain = c
      ? `<p>Example of a chain: ${escape(nameOf(c.first.id))} (only on ${escape(c.firstBoard.board.label)}) and ${escape(nameOf(c.other.id))} (on ${escape(c.other.boards.map((item) => item.board.label).join(", "))}) never met. `
        + `${escape(nameOf(c.bridge.id))} is on both of their boards: ${shown(c.firstBoard.board, c.bridgeOnFirst)} against ${escape(nameOf(c.first.id))}'s ${shown(c.firstBoard.board, c.firstBoard.row.value)} on ${escape(c.firstBoard.board.label)}, `
        + `${shown(c.otherBoard.board, c.bridgeOnOther)} against ${escape(nameOf(c.other.id))}'s ${shown(c.otherBoard.board, c.otherBoard.row.value)} on ${escape(c.otherBoard.board.label)}. `
        + `How clearly each beat ${escape(nameOf(c.bridge.id))} - and every other shared rival - decides their order: ${escape(nameOf(c.first.id))} ${fixed(c.first.index)}, ${escape(nameOf(c.other.id))} ${fixed(c.other.index)}.</p>`
      : "";
    mount("bt", `<p>Default view: ${analysis.pairCount.toLocaleString("en")} weighted pairs from ${boards.length} boards; ${analysis.coverage.multi} of ${base.entries.length} models sit on two or more boards and link the boards into one scale.</p>` + chain);

    /* boards in this index, by Scope category (under the page title) */
    const scopeLine = document.querySelector("[data-index-scope]");
    const scope = window.phailScope;
    if (scopeLine && scope) {
      const tasks = [];
      scope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) => tasks.push({ domain: domain, task: task }))));
      const byTask = new Map();
      boards.forEach((board) => {
        const key = (cfg.boards[board.id] || {}).scopeTask;
        if (!byTask.has(key)) byTask.set(key, []);
        byTask.get(key).push(board.label);
      });
      const nameOfTask = (id) => ((tasks.filter((item) => item.task.id === id)[0] || {}).task || { name: id }).name;
      const covered = Array.from(byTask.keys());
      const others = tasks.filter((item) => (cfg.scopeDomains || []).indexOf(item.domain.id) !== -1 && item.task.kind !== "capability" && covered.indexOf(item.task.id) === -1).map((item) => item.task.name);
      scopeLine.innerHTML = `<b>Boards in this index</b> `
        + covered.map((key) => `${escape(nameOfTask(key))}: ${byTask.get(key).map(escape).join(", ")}`).join(" &middot; ")
        + (others.length ? `<span class="index-scope-rest">Not in this index yet: ${escape(others.join(", "))}. Boards of these kinds are either not transcribed or left out for a stated reason (Boards and weights).</span>` : "");
    }

    /* the index as win chances: one model against the field (step 7) */
    const ix = analysis.index;
    if (ix) {
      const pivot = ix.pivot;
      const meaning = document.querySelector("[data-meaning-example]");
      if (meaning) {
        meaning.innerHTML = `Example: ${escape(nameOf(pivot.id))} (index ${fixed(pivot.index)}) would beat `
          + ix.picks.map((pick, i) => `${i === ix.picks.length - 1 ? "and " : ""}${escape(nameOf(pick.entry.id))} with probability ${pick.chance.toFixed(2)}`).join(", ")
          + `; averaged over all ${ix.opponents} other models that is ${ix.meanChance.toFixed(3)}, hence ${fixed(pivot.index)}. It is ranked above ${ix.above} of the ${ix.opponents} (${Math.round(100 * ix.above / ix.opponents)}%) - close to its index, but a count, not an average of chances.`;
      }
      mount("index", `<p><i>N</i> = ${base.entries.length}. Worked example, ${escape(nameOf(pivot.id))} (index ${fixed(pivot.index)}) against five of the other ${ix.opponents}:</p>`
        + table(["Opponent", "Its index", `Chance ${escape(nameOf(pivot.id))} wins`], ix.spread.map((pick) => [escape(nameOf(pick.entry.id)), fixed(pick.entry.index), pick.chance.toFixed(2)]))
        + `<p>Averaging this chance over all ${ix.opponents} opponents gives ${ix.meanChance.toFixed(3)}, so the index is ${fixed(pivot.index)}. The top model, ${escape(nameOf(ix.top.id))}, scores ${fixed(ix.top.index)}; the last, ${escape(nameOf(ix.last.id))}, ${fixed(ix.last.index)}.</p>`);
    }

    /* 8. error bars, worked through for the widest one in the top 15 */
    const doubt = analysis.doubt;
    const entry = doubt.widest;
    if (entry && entry.drops) {
      const mark = (value) => (value === entry.range[0] ? " <small>lowest</small>" : value === entry.range[1] ? " <small>highest</small>" : "");
      mount("doubt-example", `<p>Worked example, the widest error bar in the top ${reading.topForSpread}: ${escape(nameOf(entry.id))}, index ${fixed(entry.index)} (rank ${entry.rank}) with all boards.</p>`
        + table(["Board removed", "Its index", "Its rank"], entry.drops.map((drop) => [escape(drop.board),
          drop.index === null ? "not ranked" : fixed(drop.index) + mark(drop.index), drop.rank === null ? "-" : drop.rank]))
        + `<p>So its error bar is ${fixed(entry.range[0])}-${fixed(entry.range[1])} and its rank range ${entry.rankRange[0]}-${entry.rankRange[1]}. A short bar is not proof of certainty: a model on one board is simply dropped when that board is removed, so its bar only shows how the other boards move it. The ${doubt.oneBoard} one-board models have bars ${fixed(doubt.oneBoardWidth)} points wide on average; the ${doubt.several} models on two or more boards, ${fixed(doubt.severalWidth)}. Read the bar together with the Boards column.</p>`);
    }
    mount("doubt", (entry ? `<p>Widest spread in the top ${reading.topForSpread}: ${escape(nameOf(entry.id))}, index ${fixed(entry.range[0])}-${fixed(entry.range[1])}, rank ${entry.rankRange[0]}-${entry.rankRange[1]} depending on which board is dropped.</p>` : "")
      + table(["Board left out", "Held-out accuracy", "Pairs checked"], boards.map((board) => [escape(board.label),
        board.heldOut ? `<span class="${board.heldOut.accuracy < reading.weakHeldOut ? "held-weak" : ""}">${Math.round(board.heldOut.accuracy * 100)}%</span>` : "-",
        board.heldOut ? board.heldOut.pairs : "none: fewer than two of its models are on another board"])));
  }
  drawMethod();

  /* --- Board agreement: tau, pair by pair (default settings) ---------------------------------------- */
  const minShared = analysis.minShared;
  const tauTable = analysis.tau;
  const signed = (value) => (value >= 0 ? "+" : "&minus;") + Math.abs(value).toFixed(2);

  function drawTauDetails() {
    const node = document.querySelector("[data-tau-details]");
    if (!node) return;
    const rows = tauTable;
    const measured = rows.filter((row) => row.tau !== null);
    const verdict = (row) => {
      if (row.tau === null) return `<small>under ${minShared} shared: no &tau;</small>`;
      if (!row.beyond) return "could be chance";
      return row.tau > 0 ? "agree" : '<span class="held-weak">disagree</span>';
    };
    const cells = rows.map((row) => [
      `${escape(row.a)} &times; ${escape(row.b)}`, row.n, row.pairs, row.same, row.opposite, row.ties,
      row.tau === null ? "-" : signed(row.tau),
      row.same + row.opposite ? `${Math.round(100 * row.same / (row.same + row.opposite))}%` : "-",
      row.chance === null ? "-" : `&plusmn;${row.chance.toFixed(2)}`,
      verdict(row)]);
    const best = measured.slice().sort((x, y) => y.n - x.n)[0];
    const worst = measured.slice().sort((x, y) => x.tau - y.tau)[0];
    const example = (row) => `${escape(row.a)} and ${escape(row.b)} share ${row.n} models, so ${row.pairs} pairs: ${row.same} in the same order, ${row.opposite} opposite${row.ties ? `, ${row.ties} tied on one board` : ""}. &tau; = ${signed(row.tau)}; the boards agree on ${Math.round(100 * row.same / (row.same + row.opposite))}% of the pairs they both order.`;
    node.innerHTML = `<div class="method-table-wrap"><table class="method-table"><thead><tr><th>Boards</th><th>Shared <i>n</i></th><th>Pairs</th><th>C same</th><th>D opposite</th><th>One-sided ties</th><th>&tau;</th><th>Same order</th><th>Chance level</th><th>Reading</th></tr></thead><tbody>`
      + cells.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>"
      + (best ? `<p>Largest overlap: ${example(best)}</p>` : "")
      + (worst && worst !== best && worst.tau < 0 ? `<p>Strongest disagreement: ${example(worst)}</p>` : "")
      + `<p>Numbers for the default settings. ${rows.length - measured.length} of the ${rows.length} board pairs that share any model share fewer than ${minShared}, so their agreement cannot be measured yet.</p>`;
  }
  drawTauDetails();

  /* --- Why an index: coverage, noise, and pooled vs single-board prediction ------------------------- */
  function drawEvidence() {
    const cov = analysis.coverage;
    const ties = analysis.neighbours;
    const pooled = analysis.pooled;
    const pct = (part, whole) => (whole ? Math.round(100 * part / whole) : 0);
    const readingOf = (row) => {
      if (row.verdict === "unchecked") return "cannot be checked: fewer than two of its models are on other boards";
      if (row.verdict === "nosingle") return "no other single board shares two of its models";
      if (row.verdict === "poor") return '<span class="held-weak">other boards predict it poorly</span>';
      const accuracy = { higher: "higher accuracy", lower: "lower accuracy", same: "about the same accuracy" }[row.verdict];
      return `${row.more >= reading.morePairs ? `${row.more.toFixed(1)}&times; the pairs` : "the same pairs"}, ${accuracy}`;
    };
    const pooledMount = document.querySelector("[data-rank-pooled]");
    if (pooledMount) {
      pooledMount.innerHTML = `<table class="data-table method-table pooled-table"><thead><tr><th>Board left out</th><th>Clear pairs on it</th><th>Pooled index: judged</th><th>Correct</th><th>Single board with most overlap</th><th>Judged</th><th>Correct</th><th>Reading</th></tr></thead><tbody>`
        + pooled.rows.map((row) => `<tr><td>${escape(row.board.label)}</td><td>${row.clear}</td>`
          + (row.pooled ? `<td>${row.pooled.judged}</td><td>${pct(row.pooled.correct, row.pooled.judged)}%</td>` : "<td>-</td><td>-</td>")
          + (row.single ? `<td>${escape(row.single.label)}</td><td>${row.single.judged}</td><td>${pct(row.single.correct, row.single.judged)}%</td>` : "<td>-</td><td>-</td><td>-</td>")
          + `<td>${readingOf(row)}</td></tr>`).join("") + "</tbody></table>";
    }
    const t = pooled.total;
    const totalMount = document.querySelector("[data-rank-pooled-total]");
    if (totalMount && t.boards) {
      totalMount.innerHTML = `<span><b>All ${t.boards} checkable boards</b> pooled index ${pct(t.pooledCorrect, t.pooledJudged)}% correct on ${t.pooledJudged} pairs; best-overlapping single board ${pct(t.singleCorrect, t.singleJudged)}% on ${t.singleJudged} pairs.</span>`;
    }

    /* the Why line in step 1: three facts, every number named */
    const why = document.querySelector("[data-why]");
    if (why && t.boards) {
      const third = !t.agreePoorly
        ? `<b>Pooling adds evidence.</b> Leave one board out, fit the index on the other ${base.boards.length - 1}, and check the left-out board's clearly separated pairs (gap larger than the board's noise). Over the ${t.boards} boards this can be done for, the index orders <b>${pct(t.pooledCorrect, t.pooledJudged)}%</b> of ${t.pooledJudged} such pairs correctly; the single other board that shares the most models with each one orders ${pct(t.singleCorrect, t.singleJudged)}% of the ${t.singleJudged} it can judge.`
        : `<b>But the boards agree poorly.</b> Leave one board out, fit the index on the other ${base.boards.length - 1}, and check the left-out board's clearly separated pairs (gap larger than the board's noise). Over the ${t.boards} boards this can be done for, the index orders only <b>${pct(t.pooledCorrect, t.pooledJudged)}%</b> of ${t.pooledJudged} such pairs correctly, while the single other board that shares the most models with each one orders ${pct(t.singleCorrect, t.singleJudged)}% of the ${t.singleJudged} it can judge. Read this index as provisional.`;
      why.innerHTML = `<ul class="why-list">`
        + `<li><b>No single board ranks the field.</b> The index ranks ${cov.models} models from the ${base.boards.length} boards listed at the top. Taking them two at a time gives ${cov.pairs.toLocaleString("en")} pairs (${cov.models} &times; ${cov.models - 1} / 2); <b>${pct(cov.never, cov.pairs)}%</b> of these pairs never appear together on any board, so no board says which of the two is better. ${cov.single} of the ${cov.models} models appear on one board only.</li>`
        + `<li><b>Each board alone is noisy.</b> Going down each board's own order, <b>${ties.ties} of the ${ties.steps}</b> steps from one model to the next are smaller than the board's noise - statistically a tie.</li>`
        + `<li>${third} Details under <a href="#agreement">Board agreement</a>.</li></ul>`;
    }

    /* one reading line above the agreement matrix */
    const readingLine = document.querySelector("[data-agree-reading]");
    if (readingLine) {
      const name = (row) => `${escape(row.a)} &times; ${escape(row.b)} (${signed(row.tau)}, ${row.n} shared)`;
      const beyond = tauTable.filter((row) => row.beyond);
      const opposite = tauTable.filter((row) => row.tau !== null && row.tau < 0);
      const unmeasured = tauTable.filter((row) => row.tau === null).length;
      readingLine.innerHTML = `<b>Reading:</b> ${beyond.length ? `beyond chance, ${beyond.map(name).join(" and ")} agree` : "no board pair agrees beyond chance yet"}`
        + (opposite.length ? `; ${opposite.map(name).join(", ")} ${opposite.length === 1 ? "leans" : "lean"} opposite${opposite.every((row) => !row.beyond) ? ", within chance" : ""}` : "")
        + `. ${unmeasured} of ${tauTable.length} board pairs share fewer than ${minShared} models, so their agreement cannot be measured yet.`;
    }
  }
  drawEvidence();

  /* --- Capabilities: who defines each column, and what it is fitted on (default settings) ---------- */
  function drawCapabilityDetails() {
    const caps = cfg.capabilities || [];
    const fitted = new Map((base.capabilities || []).map((item) => [item.capability.id, item]));
    /* a board outside the index is named by its capability source's `label` */
    const sourceLabels = new Map();
    caps.forEach((cap) => cap.sources.forEach((source) => { if (source.label) sourceLabels.set(source.board, source.label); }));
    const labelOf = (id) => (cfg.boards[id] || {}).label || sourceLabels.get(id) || id;
    const summary = document.querySelector("[data-cap-summary]");
    const s = analysis.capabilities;
    if (summary && s.total) {
      summary.innerHTML = `${s.single} of the ${s.total} columns rest on a single board (`
        + Array.from(s.byBoard.entries()).map(([id, list]) => `${escape(list.join(", "))}: ${escape(labelOf(id))}`).join("; ")
        + `); ${s.combined === 0 ? "none combines" : s.combined === 1 ? "1 combines" : `${s.combined} combine`} several boards. Who defines each one is in the details.`;
    }
    const node = document.querySelector("[data-cap-details]");
    if (!node || !caps.length) return;
    const rows = caps.map((cap) => {
      const item = fitted.get(cap.id);
      const sources = cap.sources.map((source) => {
        const trials = source.trials || (cfg.boards[source.board] || {}).trials;
        return `<div><b>${escape(labelOf(source.board))}</b> ${prose(source.what || "", "capabilities")}${trials ? ` <small>(${trials.toLocaleString("en")} trials per model${source.trials ? "" : ", the board's own count"})</small>` : ""}</div>`;
      }).join("");
      return `<tr><td>${escape(cap.name)}</td><td>${prose(cap.definedBy || "", "capabilities")}</td><td class="cap-sources">${sources}</td><td>${item ? item.index.size : 0}</td></tr>`;
    }).join("");
    node.innerHTML = `<p>Each column is fitted exactly like the index (noise from the trial count, difficulty weights, Bradley-Terry, expected win rate), but only on the columns listed for it. Where the trial count is not published per sub-score, the number shown is our conservative stand-in.</p>`
      + `<div class="method-table-wrap"><table class="method-table cap-table"><thead><tr><th>Capability</th><th>Defined by</th><th>Measured by (board and what it scores)</th><th>Models scored</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  drawCapabilityDetails();

  /* --- Sim boards against real boards (only where the index has both) ------------------------------ */
  function drawSimReal() {
    const node = document.querySelector("[data-simreal]");
    if (!node) return;
    const sr = analysis.simReal;
    if (!sr) { node.innerHTML = ""; return; }
    const tableRows = sr.groups.map((group) => `<tr><td>${group.x.toLowerCase()}&ndash;${group.y.toLowerCase()}</td><td>${group.measured.length}${group.unmeasured ? ` <small>(+${group.unmeasured} sharing too few)</small>` : ""}</td>`
      + `<td>${group.measured.map((row) => `${escape(row.a)} &times; ${escape(row.b)} ${signed(row.tau)} <small>(${row.n} shared${row.beyond ? ", beyond chance" : ", could be chance"})</small>`).join("<br>") || "-"}</td></tr>`).join("");
    const simRealPairs = sr.groups[1].measured;
    const realReal = sr.groups[2].measured;
    const negatives = sr.negatives;
    const sentences = [];
    if (simRealPairs.length) {
      const values = simRealPairs.map((row) => row.tau);
      sentences.push(values.every((value) => value > 0)
        ? `Every sim&ndash;real pair that can be measured leans the same way (${signed(Math.min.apply(null, values))} to ${signed(Math.max.apply(null, values))}).`
        : `Sim&ndash;real pairs range from ${signed(Math.min.apply(null, values))} to ${signed(Math.max.apply(null, values))}.`);
    }
    sentences.push(realReal.length
      ? `Real&ndash;real agreement can be measured for only ${realReal.length} pair${realReal.length === 1 ? "" : "s"}${sr.groups[2].unmeasured ? `; ${sr.groups[2].unmeasured} other real&ndash;real pairs share too few models` : ""}.`
      : "No real&ndash;real pair shares enough models to measure.");
    if (sr.tau !== null) {
      sentences.push(`Fitted on sim boards only and on real boards only, the two indices order their ${sr.shared} shared models with &tau; = ${signed(sr.tau)} (${sr.beyond ? "beyond chance" : "could be chance"}).`);
    }
    if (simRealPairs.length && simRealPairs.every((row) => row.tau > 0) && sr.tau !== null && sr.tau > 0) {
      sentences.push(`So the data do not show real boards disagreeing with sim boards as a group.`
        + (negatives.length ? ` The pair${negatives.length === 1 ? " that leans" : "s that lean"} reversed - ${negatives.map((row) => `${escape(row.a)} &times; ${escape(row.b)} (${row.beyond ? "beyond chance" : "within chance on its own"})`).join(", ")} - ${negatives.every((row) => row.trackA === "Real" && row.trackB === "Real") ? (negatives.length === 1 ? "sits between two real boards" : "sit between real boards") : (negatives.length === 1 ? "involves a sim board" : "involve a sim board")}.` : ""));
    }
    node.innerHTML = `<div class="method-table-wrap"><table class="method-table simreal-table"><thead><tr><th>Board pair</th><th>Pairs with a &tau;</th><th>&tau; per pair</th></tr></thead><tbody>${tableRows}</tbody></table></div>`
      + `<p class="simreal-reading">${sentences.join(" ")}</p>`
      + (sr.gaps.length ? `<p class="simreal-reading">Single models can still differ a lot between the two: ${sr.gaps.map((gap) => `${escape(nameOf(gap.id))} ${fixed(gap.sim)} on sim against ${fixed(gap.real)} on real <small>(real: ${escape(gap.boards.join(", "))})</small>`).join("; ")}.</p>` : "");
  }
  drawSimReal();

  /* --- Index and strengths side by side (default settings) -------------------------------------------
     Strengths come straight from the engine's fit; the worked example
     recomputes one model's update from the board rows to show it balances. */
  function drawStrengths() {
    const chartNodes = document.querySelectorAll("[data-strength-chart]");
    if (!chartNodes.length || !base.strengths) return;
    const entries = base.entries;
    const n = entries.length;
    const strength = (id) => base.strengths.get(id);
    const pivot = analysis.pivot;
    /* few labels, placed where they do not collide: the steep top of the
       strength curve, and the ends and middle of the index curve */
    const labelled = {
      strength: new Set([entries[0].id, entries[1].id, pivot.id]),
      index: new Set([entries[0].id, pivot.id, entries[Math.floor(n / 2)].id, entries[n - 1].id])
    };
    const ticks = [1, Math.round(n / 4), Math.round(n / 2), Math.round((3 * n) / 4), n].map((rank) => [rank, `#${rank}`]);
    /* the charts sit in a closed <details>: drawn at their real width when it opens */
    const drawCharts = () => chartNodes.forEach((node) => {
      const kind = node.dataset.strengthChart;
      const points = entries.map((entry) => ({
        x: entry.rank,
        y: kind === "strength" ? strength(entry.id) : entry.index,
        label: nameOf(entry.id),
        hideLabel: !labelled[kind].has(entry.id),
        color: labColor(entry.id),
        title: `#${entry.rank} ${nameOf(entry.id)}: strength ${strength(entry.id).toPrecision(3)}, index ${fixed(entry.index)}`
      }));
      node.innerHTML = "";
      charts.mount(node, (container) => charts.scatter(container, {
        points: points,
        xMin: 0, xMax: n + 1,
        yMin: 0, yMax: kind === "strength" ? Math.ceil(strength(entries[0].id) / 10) * 10 : 100,
        xTicks: ticks,
        xLabel: "Rank",
        yLabel: kind === "strength" ? "Strength" : "Index",
        height: 240
      }));
    });
    const holder = chartNodes[0].closest("details");
    if (holder && !holder.open) {
      let drawn = false;
      holder.addEventListener("toggle", () => { if (holder.open && !drawn) { drawn = true; drawCharts(); } });
    } else {
      drawCharts();
    }

    const picks = [entries[0], entries[1], pivot, entries[Math.floor(n / 2)], entries[Math.floor((3 * n) / 4)], entries[n - 1]]
      .filter((entry, i, list) => list.indexOf(entry) === i);
    const tableNode = document.querySelector("[data-strength-table]");
    if (tableNode) {
      tableNode.innerHTML = `<div class="method-table-wrap"><table class="method-table"><thead><tr><th>Rank</th><th>Model</th><th>Strength</th><th>Index</th><th>Chance of beating ${escape(nameOf(pivot.id))}</th></tr></thead><tbody>`
        + picks.map((entry) => `<tr><td>${entry.rank}</td><td>${escape(nameOf(entry.id))}</td><td>${strength(entry.id).toPrecision(3)}</td><td>${fixed(entry.index)}</td>`
          + `<td>${entry.id === pivot.id ? "-" : chance(entry.id, pivot.id).toFixed(2)}</td></tr>`).join("")
        + "</tbody></table></div>";
    }

    const st = analysis.strengths;
    const top = entries[0];
    const why = document.querySelector("[data-strength-why]");
    if (why) {
      why.innerHTML = `<li><b>Strengths have no unit.</b> Only their ratios matter: multiply every strength by 10 and every predicted head-to-head stays the same. Our scale is pinned only by the weak tie to a reference of strength 1.</li>`
        + `<li><b>They are hard to read on a chart.</b> They run from ${st.low.toPrecision(2)} to ${st.high.toPrecision(3)}, a factor of ${Math.round(st.ratio).toLocaleString("en")}; ${st.belowOne} of the ${st.n} models sit below 1, squeezed near zero, while the top few stretch the axis.</li>`
        + `<li><b>The index answers a plain question</b> on a fixed 0-100 scale: how often would this model beat the others? It is computed from the strengths and keeps their order exactly - same ranking, readable numbers.</li>`
        + `<li><b>What strengths are still best for:</b> one direct match. ${escape(nameOf(top.id))} against ${escape(nameOf(pivot.id))}: ${strength(top.id).toPrecision(3)} / (${strength(top.id).toPrecision(3)} + ${strength(pivot.id).toPrecision(3)}) = ${chance(top.id, pivot.id).toFixed(2)}. The index averages such chances over the whole field, so it moves when models are added or removed; the ratio of two strengths hardly does.</li>`;
    }

    /* the worked update: the fitted strength balances the update rule */
    const exampleNode = document.querySelector("[data-strength-example]");
    const b = analysis.balance;
    if (exampleNode && b) {
      exampleNode.innerHTML = `<p>${escape(nameOf(pivot.id))} is on ${b.perBoard.length} boards. On each, every opponent contributes its pair weight \\(\\omega\\) (step 5) times the win share \\(W\\) (step 3) to the top of the update, and \\(\\omega / (s_i + s_j)\\) to the bottom, using the final strengths:</p>`
        + `<div class="method-table-wrap"><table class="method-table"><thead><tr><th>Board</th><th>Opponents</th><th>Weighted wins \\(\\sum \\omega W\\)</th><th>\\(\\sum \\omega / (s_i + s_j)\\)</th></tr></thead><tbody>`
        + b.perBoard.map((item) => `<tr><td>${escape(item.board.label)}</td><td>${item.opponents}</td><td>${item.wins.toFixed(4)}</td><td>${item.exposure.toFixed(4)}</td></tr>`).join("")
        + `</tbody></table></div>`
        + `<div class="step-math"><div class="eq"><span class="eq-label">balance</span><span class="eq-body">\\(\\displaystyle \\frac{${(b.prior / 2).toFixed(2)} + ${b.wins.toFixed(4)}}{${(b.prior / (b.strength + 1)).toFixed(4)} + ${b.exposure.toFixed(4)}} = \\frac{${b.top.toFixed(4)}}{${b.bottom.toFixed(4)}} = ${b.update.toFixed(3)} \\approx s = ${b.strength.toFixed(3)}\\)</span></div>`
        + `<div class="eq-note">at the fitted strengths the update returns the same value: that is what "fitted" means. Starting from 1 for every model, the rounds walk towards this point.</div></div>`;
    }
  }
  drawStrengths();

  /* --- operator-run tables left out of the index (static: they never enter it) ------------------ */
  const outMount = document.querySelector("[data-rank-out]");
  if (outMount) {
    const inIndex = db.resultGroups.filter((group) => cfg.boards[group.id]);
    const left = db.resultGroups.filter((group) => group.provenance === "benchmark" && !cfg.boards[group.id] && (!cfg.tasks || cfg.tasks.indexOf(group.task) !== -1));
    const reasons = cfg.outOfIndex || {};
    outMount.innerHTML = left.length ? `<h3 class="rank-out-title">Run by an operator, but left out of the index</h3><ul class="rank-out-list">`
      + left.map((group) => {
        const entrants = Array.from(new Set(group.rows.map((row) => row.model)));
        const overlap = inIndex.map((board) => {
          const there = new Set(board.rows.map((row) => row.model));
          return { label: cfg.boards[board.id].label, count: entrants.filter((id) => there.has(id)).length };
        }).filter((item) => item.count);
        const meta = (db.benchmarks || []).filter((item) => item.id === group.benchmark)[0] || {};
        const entry = reasons[group.id];
        const label = (entry && entry.label) || meta.name || group.id;
        return `<li><details class="why-more"><summary><a href="${escape(group.sourceUrl)}" target="_blank" rel="noreferrer">${escape(label)}</a>`
          + `<small>${entrants.length} entrants${overlap.length ? " · " + overlap.map((item) => `${item.count} also on ${escape(item.label)}`).join(" · ") : " · none on an index board"} · in the Ledger</small>`
          + `<em>why</em></summary><p>${prose((entry && (entry.reason || entry)) || "No reason recorded yet.", "outOfIndex")}</p></details></li>`;
      }).join("") + "</ul>" : "";
  }

  /* --- factors (static for the page, from the config) ------------------------------------------ */
  const factorMount = document.querySelector("[data-rank-factors]");
  if (factorMount) {
    const statusText = { used: "In the index", toggle: "Switch above", beside: "Shown beside", missing: "No data yet" };
    factorMount.innerHTML = `<table class="data-table factor-table"><thead><tr><th>Factor</th><th>Why it matters</th><th>What exists today</th><th>Status</th></tr></thead><tbody>`
      + (cfg.factors || []).map((factor) => `<tr><td>${escape(factor.name)}</td><td>${prose(factor.why, "factors")}</td><td>${prose(factor.data, "factors")}</td>`
        + `<td><span class="factor-status factor-status--${factor.status}">${statusText[factor.status]}</span></td></tr>`).join("")
      + "</tbody></table>";
  }

  render();

  /* Typeset every \( ... \) formula on the page, including those the code
     above has just written. KaTeX is vendored in vendor/katex/. */
  if (window.renderMathInElement) {
    /* numbers a printed formula quotes from the config or the engine, so the
       formula changes when the mechanism does: \cfgprior etc. in the HTML */
    const f = window.phailFacts.namespace(rankingKey);
    const tex = (value) => String(value).replace(/,/g, "{,}");
    window.renderMathInElement(document.querySelector("main"), {
      delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      macros: {
        "\\cfgprior": f.prior, "\\cfgpmin": f.pMin, "\\cfgpmax": f.pMax,
        "\\cfgdmin": f.minDifficulty, "\\cfgdneutral": f.neutralDifficulty,
        "\\cfgebench": f.evidenceBenchmark, "\\cfgepaper": f.evidencePaper,
        "\\cfgtol": `10^{${f.toleranceExponent}}`, "\\cfgrounds": tex(f.maxRounds.toLocaleString("en")),
        "\\cfgphione": f.phiOne, "\\cfgphitwo": f.phiTwo, "\\cfgeloone": f.eloHundred, "\\cfgelofour": f.eloFourHundred
      },
      throwOnError: false
    });
  }
})();
