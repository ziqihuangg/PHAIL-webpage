/* =============================================================================
   PhAIL - Ranking tab
   -----------------------------------------------------------------------------
   Draws whatever ranking-engine.js returns for the current switches. The
   switches live in the URL (?track=Real&method=naive), so a particular view can
   be linked in a meeting and reloads the same.

   Colour: each lab's own colour, exactly as in the Ledger and Charts, so a
   model reads the same everywhere. Faded = the model sits on one board only
   (its index is that board's order, re-expressed; nothing cross-checks it).
   Agents are named "(agent)". Violet is kept for scales that are ours alone:
   the capability heat map and the board-weight bars.
   ========================================================================== */

(function () {
  const db = window.phailDatabase;
  const cfg = window.phailRanking;
  const engine = window.phailRankingEngine;
  const charts = window.phailCharts;
  const icon = window.phailIcon || (() => "");
  if (!db || !cfg || !engine || !charts) return;

  const VIOLET = charts.colors.derived;
  const labColor = (id) => orgOf(id).color || "#8a949b";

  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
  ];
  const defaults = { track: "all", agents: "true", coverage: "1", weighting: "difficulty", evidence: "benchmark", method: "bt" };
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
      : `PhAIL Robotics Index (draft) - ${methodName[state.method]}, ${state.weighting === "equal" ? "equal weights" : "difficulty-weighted"}`;
    const chartMount = document.querySelector("[data-rank-chart]");
    charts.resetMounts();
    charts.mount(chartMount, (container) => charts.verticalBars(container, {
      rows: shown.map((entry) => ({
        label: nameOf(entry.id) + (entry.agent ? " (agent)" : ""),
        value: Number(entry.index.toFixed(1)),
        range: naive ? null : entry.range,
        org: orgOf(entry.id),
        color: labColor(entry.id),
        faint: entry.coverage === 1,
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
      legendNote: "Colour = lab, as in the Ledger. Faded bar = on one board only.",
      nameLimit: 22
    }));
    document.querySelector("[data-rank-chart-caption]").innerHTML = naive
      ? "Each model's raw primary scores averaged across the boards it happens to be on, weighted as below. RoboArena's Elo cannot be averaged with percentages and is left out. Compare the order with the pairwise index: models entered on easy boards climb, models entered on hard ones sink."
      : "Whiskers: range when any one board is dropped. Faded bars: on one board only.";

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
      return `<tr class="${entry.coverage === 1 ? "row-single" : ""}">`
        + `<td class="rank-cell">${entry.rank}</td>`
        + `<td><span class="rank-model">${badge}<a href="tasks.html?model=${escape(entry.id)}">${escape(model.name || entry.id)}</a>${entry.agent ? '<span class="rank-tag rank-tag--agent">agent</span>' : ""}</span><small>${escape(model.maker || "")}</small></td>`
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
  function drawBoards(result, naive) {
    const rows = result.boards.map((board) => {
      const held = board.heldOut;
      const heldText = state.method !== "bt" ? "pairwise only"
        : held ? `<span class="${held.accuracy < 0.6 ? "held-weak" : ""}">${Math.round(held.accuracy * 100)}%</span> <small>of ${held.pairs} pair${held.pairs === 1 ? "" : "s"}</small>` : "<small>no overlap</small>";
      const url = board.group && board.group.sourceUrl;
      return `<tr><td>${url ? `<a href="${escape(url)}" target="_blank" rel="noreferrer">${escape(board.label)}</a>` : escape(board.label)}`
        + `<small>${escape(board.provenance === "benchmark" ? "benchmark-run" : board.provenance === "thirdParty" ? "third-party tables" : "paper tables")}${board.assumedTrials ? ", trials assumed" : ""}</small></td>`
        + `<td>${escape(board.track)}</td><td class="num">${board.rows.length}</td>`
        + `<td class="num">${board.scale === "elo" ? fixed(board.best, 0) + " Elo" : fixed(board.best)}</td>`
        + `<td class="num">${board.scale === "elo" ? "0.50 <small>(no ceiling)</small>" : fixed(board.difficulty, 2)}</td>`
        + `<td class="num">${board.share === 1 ? "1" : fixed(board.share, 2)}</td>`
        + `<td class="num">${fixed(board.evidence, 1)}</td>`
        + `<td class="num"><span class="rank-bar rank-bar--narrow"><span style="width:${(board.weightShare * 100).toFixed(1)}%;background:${VIOLET}"></span></span>${(board.weightShare * 100).toFixed(0)}%</td>`
        + `<td class="num">${heldText}</td></tr>`;
    }).join("");
    document.querySelector("[data-rank-boards]").innerHTML = `<table class="data-table rank-boards-table">`
      + `<thead><tr><th>Board</th><th>Track</th><th>Models</th><th>Best</th><th>Difficulty</th><th>Family share</th><th>Evidence</th><th>Weight</th><th>Held-out accuracy</th></tr></thead>`
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

  /* --- index against size -------------------------------------------------------------------- */
  function drawSize(result, shown, naive) {
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

  /* --- factors (static for the page, from the config) ------------------------------------------ */
  const factorMount = document.querySelector("[data-rank-factors]");
  if (factorMount) {
    const statusText = { used: "In the index", toggle: "Switch above", beside: "Shown beside", missing: "No data yet" };
    factorMount.innerHTML = `<table class="data-table factor-table"><thead><tr><th>Factor</th><th>Why it matters</th><th>What exists today</th><th>Status</th></tr></thead><tbody>`
      + (cfg.factors || []).map((factor) => `<tr><td>${escape(factor.name)}</td><td>${escape(factor.why)}</td><td>${escape(factor.data)}</td>`
        + `<td><span class="factor-status factor-status--${factor.status}">${statusText[factor.status]}</span></td></tr>`).join("")
      + "</tbody></table>";
  }

  render();
})();
