/* =============================================================================
   PhAIL - Ranking tab
   -----------------------------------------------------------------------------
   Draws whatever ranking-engine.js returns for the current switches. The
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
  const cfg = { robotics: window.phailRanking, cad: window.phailCadRanking }[document.body.dataset.ranking || "robotics"] || window.phailRanking;
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
  ].filter((control) => !cfg.controls || cfg.controls.indexOf(control.key) !== -1);
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
        + `<small>${escape(board.provenance === "benchmark" ? "benchmark-run" : board.provenance === "thirdParty" ? "third-party tables" : "paper tables")}${board.assumedTrials ? ", trials assumed" : ""}</small>`
        + (board.leftOut ? `<small>${board.leftOut} more ran under ${board.minTasks} tasks: Ledger only</small>` : "") + "</td>"
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

  /* --- model gaps (static: raw published scores, not the index) ----------------------------------
     The rules come from cfg.gaps; every number is computed here from the
     ledger, so nothing in this section is typed by hand. */
  const gapMount = document.querySelector("[data-rank-gaps]");
  if (gapMount && cfg.gaps) {
    const agentSet = new Set(cfg.agents || []);
    const groupOf = (id) => db.resultGroups.filter((group) => group.id === id)[0];
    const boardName = (id) => {
      if (cfg.boards[id]) return cfg.boards[id].label;
      const group = groupOf(id);
      const meta = group && (db.benchmarks || []).filter((item) => item.id === group.benchmark)[0];
      return meta ? meta.name : id;
    };
    const num = (value) => typeof value === "number" && !Number.isNaN(value);
    const median = (values) => {
      const sorted = values.slice().sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };
    /* one row per model - its best on this column - sorted high to low;
       entries under a board's minTasks are left out, as in the index */
    const bestPerModel = (group, valueOf) => {
      const best = new Map();
      const setup = group ? cfg.boards[group.id] || {} : {};
      (group ? group.rows : []).forEach((row) => {
        if (setup.minTasks && num(row.tasks) && row.tasks < setup.minTasks) return;
        const value = valueOf(row);
        if (!num(value)) return;
        const current = best.get(row.model);
        if (!current || value > current.value) best.set(row.model, { model: row.model, value: value, row: row });
      });
      return Array.from(best.values()).sort((a, b) => b.value - a.value);
    };
    const who = (entry) => `<small>${escape(nameOf(entry.model))}</small>`;
    const agentTag = '<span class="rank-tag rank-tag--agent">agent</span>';

    const axisMedians = new Map();
    cfg.gaps.forEach((gap) => {
      if (gap.kind !== "axis") return;
      const values = bestPerModel(groupOf(gap.board), (row) => (row.d ? row.d[gap.dim] : null))
        .filter((entry) => !agentSet.has(entry.model)).map((entry) => entry.value);
      if (values.length) axisMedians.set(gap, median(values));
    });
    const medianList = Array.from(axisMedians.values());
    const strongest = Math.max.apply(null, medianList);
    const weakest = Math.min.apply(null, medianList);

    const rowFor = (gap) => {
      if (gap.kind === "level") {
        const fieldOf = (id) => (gap.fields ? gap.fields[id] : gap.field);
        const unitOf = (id) => (fieldOf(id) === "success" || (groupOf(id) || {}).unit === "%" ? "%" : "");
        const cells = gap.boards.map((id) => {
          const rows = bestPerModel(groupOf(id), (row) => row[fieldOf(id)]);
          return rows.length ? { id: id, rows: rows, best: rows[0], med: median(rows.map((entry) => entry.value)), unit: unitOf(id) } : null;
        }).filter(Boolean);
        const successLike = gap.boards.every((id) => fieldOf(id) === "success");
        if (!cells.length) return null;
        const many = cells.length > 1;
        const tag = (cell) => (many ? `<span class="gap-board">${escape(boardName(cell.id))}</span>` : "");
        const fails = cells.map((cell) => Math.round(100 - cell.best.value));
        return {
          board: many ? "" : boardName(cells[0].id),
          best: cells.map((cell) => `<div>${tag(cell)}<b>${fixed(cell.best.value)}${cell.unit}</b> ${who(cell.best)}</div>`).join(""),
          typical: cells.map((cell) => `<div>${tag(cell)}${fixed(cell.med)}${cell.unit}</div>`).join(""),
          reading: !successLike
            ? (many
              ? `The best entry reaches ${cells.map((cell) => `${fixed(cell.best.value)}${cell.unit}`).join(", ")} on these boards (0-100 each). They score differently, so their bests are not compared with each other.`
              : `The best entry reaches ${fixed(cells[0].best.value)}${cells[0].unit} of 100; half of the ${cells[0].rows.length} entries stay below ${fixed(cells[0].med)}${cells[0].unit}.`)
            : many
            ? `Even the best entry on each board fails ${Math.min.apply(null, fails)}-${Math.max.apply(null, fails)}% of its trials. The boards differ in difficulty, so their bests are not compared with each other.`
            : `Even the best entry fails ${fails[0]}% of episodes; half of the ${cells[0].rows.length} entries succeed in fewer than ${fixed(cells[0].med)}%.`
        };
      }
      if (gap.kind === "axis") {
        const rows = bestPerModel(groupOf(gap.board), (row) => (row.d ? row.d[gap.dim] : null));
        const policies = rows.filter((entry) => !agentSet.has(entry.model));
        const agent = rows.filter((entry) => agentSet.has(entry.model))[0];
        if (!policies.length) return null;
        const top = policies[0];
        const below = policies.filter((entry) => entry.value < gap.low).length;
        const agentWins = agent && agent.value > top.value;
        const med = axisMedians.get(gap);
        return {
          board: boardName(gap.board),
          best: `<div><b>${fixed(top.value)}</b> ${who(top)}</div>`
            + (agentWins ? `<div><b>${fixed(agent.value)}</b> ${who(agent)} ${agentTag}</div>` : ""),
          typical: fixed(med),
          reading: `${below} of ${policies.length} trained policies score below ${gap.low} out of 100.`
            + (med === strongest ? " The strongest of the five axes." : med === weakest ? " The weakest of the five axes." : "")
            + (agentWins ? ` ${escape(nameOf(agent.model))}, an LLM driving the arm through a harness, beats every trained policy here.` : "")
        };
      }
      if (gap.kind === "drop") {
        const rows = bestPerModel(groupOf(gap.board), (row) => (num(row[gap.from]) && num(row[gap.to]) ? row[gap.to] : null))
          .map((entry) => ({ model: entry.model, from: entry.row[gap.from], to: entry.row[gap.to] }));
        if (!rows.length) return null;
        const halved = rows.filter((entry) => entry.to < entry.from / 2).length;
        const worst = rows.reduce((a, b) => (b.from - b.to > a.from - a.to ? b : a));
        const top = rows[0];
        return {
          board: boardName(gap.board),
          best: `<div><b>${fixed(top.to)}%</b> ${escape(gap.labels[1])} ${who(top)}</div>`,
          typical: `${fixed(median(rows.map((entry) => entry.from)))}% ${escape(gap.labels[0])} &rarr; ${fixed(median(rows.map((entry) => entry.to)))}% ${escape(gap.labels[1])}`,
          reading: `${halved} of ${rows.length} policies lose more than half of their ${escape(gap.labels[0])} score. Largest fall: ${escape(nameOf(worst.model))}, ${fixed(worst.from)}% &rarr; ${fixed(worst.to)}%.`
        };
      }
      if (gap.kind === "arms") {
        const group = groupOf(gap.board);
        const rows = bestPerModel(group, (row) => (gap.fields.every((key) => num(row[key])) ? Math.min.apply(null, gap.fields.map((key) => row[key])) : null))
          .map((entry) => ({ model: entry.model, min: entry.value, max: Math.max.apply(null, gap.fields.map((key) => entry.row[key])), row: entry.row }));
        if (!rows.length) return null;
        const zero = rows.filter((entry) => entry.min === 0).length;
        const weakCount = gap.fields.map((key) => rows.filter((entry) => entry.max > 0 && entry.row[key] === entry.min).length);
        const weakIndex = weakCount.indexOf(Math.max.apply(null, weakCount));
        return {
          board: boardName(gap.board),
          best: `<div><b>${fixed(rows[0].min)}</b> on its weakest arm ${who(rows[0])}</div>`,
          typical: `weakest arm ${fixed(median(rows.map((entry) => entry.min)))}, best arm ${fixed(median(rows.map((entry) => entry.max)))}`,
          reading: `${escape(gap.labels[weakIndex])} is the weakest arm for ${weakCount[weakIndex]} of ${rows.length} policies; ${zero} score zero on at least one arm. A policy's score depends on which arm it runs on.`
        };
      }
      return null;
    };

    const body = cfg.gaps.map((gap) => {
      const row = rowFor(gap);
      if (!row) return "";
      return `<tr><td>${escape(gap.name)}</td><td>${escape(gap.asks)}${row.board ? `<small>${escape(row.board)}</small>` : ""}</td>`
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
     Static: always the default settings, so the explanation does not change
     when a reader flips a switch. Every number comes from a fresh build. */
  /* One build at the default settings, shared by every static explanation. */
  const base = engine.build(db, cfg, defaults);

  function drawMethod() {
    const boards = base.boards;
    const setText = (key, value) => document.querySelectorAll(`[data-m="${key}"]`).forEach((node) => { node.textContent = value; });
    setText("boards", boards.length);
    setText("results", boards.reduce((sum, board) => sum + board.rows.length, 0));
    setText("models", base.entries.length);
    const mount = (key, html) => { const node = document.querySelector(`[data-method="${key}"]`); if (node) node.innerHTML = html; };
    const table = (head, rows) => `<div class="method-table-wrap"><table class="method-table"><thead><tr>${head.map((cell) => `<th>${cell}</th>`).join("")}</tr></thead><tbody>`
      + rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>";
    const unitOf = (board) => (board.scale === "elo" ? " Elo" : board.metric === "success" ? "%" : "");
    const columnName = { success: "success rate", score: "score (0-100)", elo: "Elo rating" };
    const se = (value, n) => { const p = Math.min(0.98, Math.max(0.02, value / 100)); return 100 * Math.sqrt(p * (1 - p) / n); };
    const shown = (board, value) => fixed(value, board.scale === "elo" ? 0 : 1) + unitOf(board);

    /* 1. boards */
    mount("boards", table(["Board", "Run by", "Track", "Models", "Trials per model", "Ranked by", "Read"], boards.map((board) => [
      `<a href="${escape(board.group.sourceUrl)}" target="_blank" rel="noreferrer">${escape(board.label)}</a>`,
      escape(String(board.group.reporter || "").replace(/\s*\([^)]*\)/g, "").replace(/,.*$/, "")), escape(board.track),
      board.rows.length + (board.leftOut ? ` <small>(+${board.leftOut} under ${board.minTasks} tasks)</small>` : ""),
      board.scale === "elo" ? "own SD per model" : board.trials.toLocaleString("en"),
      columnName[board.metric] || escape(board.metric), escape(board.group.retrieved || "")])));

    /* 2. one model's raw scores across boards */
    const widest = base.entries.slice().sort((a, b) => b.coverage - a.coverage || a.rank - b.rank)[0];
    if (widest) {
      mount("raw", `<p>Example: <b>${escape(nameOf(widest.id))}</b> is on ${widest.coverage} boards.</p>`
        + table(["Board", "Its score", "Its place"], widest.boards.map((item) => [escape(item.board.label), shown(item.board, item.row.value), `${item.rank} of ${item.of}`]))
        + `<p>Averaged, these raw numbers would mostly say which boards it happened to enter. The index uses only its places, and how clearly it won or lost each pair.</p>`);
    }

    /* 3. noise */
    const percentBoards = boards.filter((board) => board.scale !== "elo");
    const noiseRows = percentBoards.map((board) => {
      const middle = board.rows[Math.floor(board.rows.length / 2)].value;
      const sigma = Math.SQRT2 * se(middle, board.trials);
      return [escape(board.label), board.trials.toLocaleString("en"), fixed(middle), fixed(sigma, 2), fixed(engine.phi(1 / sigma), 2), fixed(sigma * 2, 1)];
    });
    let noiseExample = "";
    const realBoard = boards.filter((board) => board.track === "Real" && board.scale !== "elo")[0];
    if (realBoard && realBoard.rows.length > 1) {
      const a = realBoard.rows[0];
      const b = realBoard.rows[1];
      const sigma = Math.sqrt(Math.pow(se(a.value, realBoard.trials), 2) + Math.pow(se(b.value, realBoard.trials), 2));
      noiseExample = `<p>Example on ${escape(realBoard.label)}: ${escape(nameOf(a.model))} ${fixed(a.value)} against ${escape(nameOf(b.model))} ${fixed(b.value)}. &sigma; = ${fixed(sigma, 1)}, so P = &Phi;(${fixed((a.value - b.value) / sigma, 1)}) = ${fixed(engine.phi((a.value - b.value) / sigma), 2)}: close to a full win.</p>`;
    }
    mount("noise", table(["Board", "Trials n", "Median score", "&sigma; for two models at the median", "A 1-point gap gives P =", "Gap for P &asymp; 0.98"], noiseRows) + noiseExample);

    /* Elo: the head-to-head preference a rating gap implies, against the
       confidence in the order that the index uses */
    const eloBoard = boards.filter((board) => board.scale === "elo")[0];
    if (eloBoard && eloBoard.rows.length > 1) {
      const a = eloBoard.rows[0];
      const b = eloBoard.rows[1];
      const gap = a.value - b.value;
      const sdA = typeof a.row.sd === "number" ? a.row.sd : eloBoard.eloSd || 30;
      const sdB = typeof b.row.sd === "number" ? b.row.sd : eloBoard.eloSd || 30;
      const preferred = 1 / (1 + Math.pow(10, -gap / 400));
      const z = gap / Math.sqrt(sdA * sdA + sdB * sdB);
      const row = (label, tex, note) => `<div class="eq"><span class="eq-label">${label}</span><span class="eq-body">\\(\\displaystyle ${tex}\\)</span></div>` + (note ? `<div class="eq-note">${note}</div>` : "");
      mount("elo", `<p>Example from the Ledger: ${escape(nameOf(a.model))} ${fixed(a.value, 0)} &plusmn; ${fixed(sdA, 1)} against ${escape(nameOf(b.model))} ${fixed(b.value, 0)} &plusmn; ${fixed(sdB, 1)} on ${escape(eloBoard.label)}, a gap of ${fixed(gap, 0)} points.</p>`
        + `<div class="step-math">`
        + row("Elo's question", `\\Pr(\\text{preferred}) = \\frac{1}{1 + 10^{-${fixed(gap, 0)}/400}} \\approx ${preferred.toFixed(2)}`, `how often evaluators should prefer ${escape(nameOf(a.model))} in one head-to-head`)
        + row("the index's question", `\\Phi\\!\\left(\\frac{${fixed(gap, 0)}}{\\sqrt{${fixed(sdA, 1)}^{2} + ${fixed(sdB, 1)}^{2}}}\\right) = \\Phi(${z.toFixed(1)}) \\approx ${engine.phi(z).toFixed(2)}`, `how sure we are that ${escape(nameOf(a.model))}'s rating really is the higher one - the question the index asks on every board`)
        + `</div>`);
    }

    /* 4. weights */
    const weightRows = boards.map((board) => [escape(board.label), `${fixed(board.best, board.scale === "elo" ? 0 : 1)}${unitOf(board)} <small>${escape(nameOf(board.rows[0].model))}</small>`,
      board.scale === "elo" ? "0.50 <small>no ceiling</small>" : fixed(board.difficulty, 2), fixed(board.share, 2), fixed(board.evidence, 1), fixed(board.weight, 3), `${(board.weightShare * 100).toFixed(1)}%`]);
    const withPapers = engine.build(db, cfg, Object.assign({}, defaults, { evidence: "all" }));
    const saturated = withPapers.boards.filter((board) => board.provenance !== "benchmark" && board.scale !== "elo").sort((a, b) => a.difficulty - b.difficulty)[0];
    mount("weights", table(["Board", "Best score", "<i>d</i>", "<i>f</i>", "<i>e</i>", "<i>w</i>", "Share"], weightRows)
      + (saturated && saturated.difficulty < 0.1 ? `<p>With paper tables switched on, ${escape(saturated.label)} has a best of ${fixed(saturated.best)}, so <i>d</i> = ${fixed(saturated.difficulty, 2)} and, at half evidence, it barely counts.</p>` : ""));

    /* 5. pairs */
    mount("pairs", table(["Board", "Models <i>k</i>", "Pairs", "Weight per pair", "Total per model"], boards.map((board) => {
      const k = board.rows.length;
      return [escape(board.label), k, (k * (k - 1) / 2).toLocaleString("en"), fixed(board.weight / (k - 1), 4), fixed(board.weight, 3)];
    })));

    /* 6. Bradley-Terry: how much evidence, and one chain of comparisons */
    const boardsOf = new Map(base.entries.map((entry) => [entry.id, new Set(entry.boards.map((item) => item.board.id))]));
    const pairCount = boards.reduce((sum, board) => sum + board.rows.length * (board.rows.length - 1) / 2, 0);
    const bridges = base.entries.filter((entry) => entry.coverage >= 2).length;
    let chain = "";
    const shares = (a, c) => Array.from(boardsOf.get(a)).some((id) => boardsOf.get(c).has(id));
    const first = base.entries.find((entry) => entry.coverage === 1);
    const other = first && base.entries.find((entry) => entry.id !== first.id && !shares(first.id, entry.id));
    const bridge = other && base.entries.filter((entry) => shares(first.id, entry.id) && shares(other.id, entry.id) && entry.id !== first.id && entry.id !== other.id)
      .sort((a, b) => b.coverage - a.coverage)[0];
    if (bridge) {
      const on = (entry, peer) => entry.boards.filter((item) => boardsOf.get(peer.id).has(item.board.id))[0];
      const firstBoard = on(first, bridge);
      const otherBoard = on(other, bridge);
      const valueOn = (entry, item) => entry.boards.filter((own) => own.board.id === item.board.id)[0].row.value;
      chain = `<p>Example of a chain: ${escape(nameOf(first.id))} (only on ${escape(firstBoard.board.label)}) and ${escape(nameOf(other.id))} (on ${escape(other.boards.map((item) => item.board.label).join(", "))}) never met. `
        + `${escape(nameOf(bridge.id))} is on both of their boards: ${shown(firstBoard.board, valueOn(bridge, firstBoard))} against ${escape(nameOf(first.id))}'s ${shown(firstBoard.board, firstBoard.row.value)} on ${escape(firstBoard.board.label)}, `
        + `${shown(otherBoard.board, valueOn(bridge, otherBoard))} against ${escape(nameOf(other.id))}'s ${shown(otherBoard.board, otherBoard.row.value)} on ${escape(otherBoard.board.label)}. `
        + `How clearly each beat ${escape(nameOf(bridge.id))} - and every other shared rival - decides their order: ${escape(nameOf(first.id))} ${fixed(first.index)}, ${escape(nameOf(other.id))} ${fixed(other.index)}.</p>`;
    }
    mount("bt", `<p>Default view: ${pairCount.toLocaleString("en")} weighted pairs from ${boards.length} boards; ${bridges} of ${base.entries.length} models sit on two or more boards and link the boards into one scale.</p>` + chain);

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

    /* the index as win chances: one model against the field (Meaning line and step 7) */
    const strengthOf = (id) => base.strengths.get(id);
    const chance = (a, b) => strengthOf(a) / (strengthOf(a) + strengthOf(b));
    const pivot = base.entries.slice().sort((a, b) => b.coverage - a.coverage || a.rank - b.rank)[0];
    if (pivot && base.strengths) {
      const others = base.entries.filter((entry) => entry.id !== pivot.id);
      const above = others.filter((entry) => entry.index < pivot.index).length;
      const picks = [others[0], others[Math.floor(others.length / 2)], others[others.length - 1]];
      const meaning = document.querySelector("[data-meaning-example]");
      if (meaning) {
        meaning.innerHTML = `Example: ${escape(nameOf(pivot.id))} (index ${fixed(pivot.index)}) would beat `
          + picks.map((entry, i) => `${i === picks.length - 1 ? "and " : ""}${escape(nameOf(entry.id))} with probability ${chance(pivot.id, entry.id).toFixed(2)}`).join(", ")
          + `; averaged over all ${others.length} other models that is ${(pivot.index / 100).toFixed(3)}, hence ${fixed(pivot.index)}. It is ranked above ${above} of the ${others.length} (${Math.round(100 * above / others.length)}%) - close to its index, but a count, not an average of chances.`;
      }
      const spreadPicks = [0, 0.25, 0.5, 0.75, 1].map((q) => others[Math.min(others.length - 1, Math.round(q * (others.length - 1)))]);
      mount("index", `<p><i>N</i> = ${base.entries.length}. Worked example, ${escape(nameOf(pivot.id))} (index ${fixed(pivot.index)}) against five of the other ${others.length}:</p>`
        + table(["Opponent", "Its index", `Chance ${escape(nameOf(pivot.id))} wins`], spreadPicks.map((entry) => [escape(nameOf(entry.id)), fixed(entry.index), chance(pivot.id, entry.id).toFixed(2)]))
        + `<p>Averaging this chance over all ${others.length} opponents gives ${(pivot.index / 100).toFixed(3)}, so the index is ${fixed(pivot.index)}. The top model, ${escape(nameOf(base.entries[0].id))}, scores ${fixed(base.entries[0].index)}; the last, ${escape(nameOf(base.entries[base.entries.length - 1].id))}, ${fixed(base.entries[base.entries.length - 1].index)}.</p>`);
    }

    /* 8. error bars, worked through for the widest one in the top 15 */
    const widestBar = base.entries.slice(0, 15).map((entry) => ({ entry: entry, width: entry.range[1] - entry.range[0] })).sort((a, b) => b.width - a.width)[0];
    if (widestBar && widestBar.entry.drops) {
      const entry = widestBar.entry;
      const mark = (value) => (value === entry.range[0] ? " <small>lowest</small>" : value === entry.range[1] ? " <small>highest</small>" : "");
      const oneBoard = base.entries.filter((item) => item.coverage === 1);
      const several = base.entries.filter((item) => item.coverage >= 2);
      const meanWidth = (list) => list.reduce((sum, item) => sum + item.range[1] - item.range[0], 0) / (list.length || 1);
      mount("doubt-example", `<p>Worked example, the widest error bar in the top 15: ${escape(nameOf(entry.id))}, index ${fixed(entry.index)} (rank ${entry.rank}) with all boards.</p>`
        + table(["Board removed", "Its index", "Its rank"], entry.drops.map((drop) => [escape(drop.board),
          drop.index === null ? "not ranked" : fixed(drop.index) + mark(drop.index), drop.rank === null ? "-" : drop.rank]))
        + `<p>So its error bar is ${fixed(entry.range[0])}-${fixed(entry.range[1])} and its rank range ${entry.rankRange[0]}-${entry.rankRange[1]}. A short bar is not proof of certainty: a model on one board is simply dropped when that board is removed, so its bar only shows how the other boards move it. The ${oneBoard.length} one-board models have bars ${fixed(meanWidth(oneBoard))} points wide on average; the ${several.length} models on two or more boards, ${fixed(meanWidth(several))}. Read the bar together with the Boards column.</p>`);
    }

    /* 8. doubt */
    const spread = base.entries.slice(0, 15).map((entry) => ({ entry: entry, width: entry.range[1] - entry.range[0] })).sort((a, b) => b.width - a.width)[0];
    mount("doubt", (spread ? `<p>Widest spread in the top 15: ${escape(nameOf(spread.entry.id))}, index ${fixed(spread.entry.range[0])}-${fixed(spread.entry.range[1])}, rank ${spread.entry.rankRange[0]}-${spread.entry.rankRange[1]} depending on which board is dropped.</p>` : "")
      + table(["Board left out", "Held-out accuracy", "Pairs checked"], boards.map((board) => [escape(board.label),
        board.heldOut ? `<span class="${board.heldOut.accuracy < 0.6 ? "held-weak" : ""}">${Math.round(board.heldOut.accuracy * 100)}%</span>` : "-",
        board.heldOut ? board.heldOut.pairs : "none: fewer than two of its models are on another board"])));
  }
  drawMethod();

  /* --- Board agreement: tau, pair by pair (default settings) ----------------------------------------
     Counts C, D and one-sided ties the same way ranking-engine.js kendallTau
     does, so the table reproduces the matrix below at the default view. */
  const minShared = cfg.minSharedForTau || 4;
  function tauRows() {
    const rows = [];
    base.boards.forEach((a, i) => base.boards.forEach((b, j) => {
      if (j <= i) return;
      const other = new Map(b.rows.map((row) => [row.model, row.value]));
      const shared = a.rows.filter((row) => other.has(row.model)).map((row) => [row.value, other.get(row.model)]);
      const n = shared.length;
      if (n < 1) return;
      let same = 0;
      let opposite = 0;
      let ties = 0;
      for (let x = 0; x < n; x += 1) {
        for (let y = x + 1; y < n; y += 1) {
          const da = shared[x][0] - shared[y][0];
          const db = shared[x][1] - shared[y][1];
          if (da === 0 || db === 0) { if (da !== db) ties += 1; continue; }
          if (da * db > 0) same += 1; else opposite += 1;
        }
      }
      const tau = n >= minShared ? engine.kendallTau(shared) : null;
      const chance = n >= minShared ? Math.sqrt(2 * (2 * n + 5) / (9 * n * (n - 1))) : null;
      rows.push({ a: a.label, b: b.label, n: n, pairs: n * (n - 1) / 2, same: same, opposite: opposite, ties: ties, tau: tau, chance: chance,
        beyond: tau !== null && Math.abs(tau) >= 2 * chance });
    }));
    rows.sort((x, y) => (y.tau === null ? -2 : y.tau) - (x.tau === null ? -2 : x.tau) || y.n - x.n);
    return rows;
  }
  const tauTable = tauRows();

  function drawTauDetails() {
    const node = document.querySelector("[data-tau-details]");
    if (!node) return;
    const rows = tauTable;
    const measured = rows.filter((row) => row.tau !== null);
    const signed = (value) => (value >= 0 ? "+" : "&minus;") + Math.abs(value).toFixed(2);
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

  /* --- Why an index: coverage, noise, and pooled vs single-board prediction -------------------------
     All at the default settings. A "clear" pair on a board is one whose gap
     exceeds its noise (same test as the engine's held-out check). */
  function drawEvidence() {
    const seOf = (row, board) => {
      if (board.scale === "elo") return typeof row.row.sd === "number" ? row.row.sd : board.eloSd || 30;
      const p = Math.min(0.98, Math.max(0.02, row.value / 100));
      return 100 * Math.sqrt(p * (1 - p) / board.trials);
    };
    const clearPair = (a, b, board) => Math.abs(a.value - b.value) > Math.sqrt(Math.pow(seOf(a, board), 2) + Math.pow(seOf(b, board), 2));

    /* coverage */
    const onBoards = new Map(base.entries.map((entry) => [entry.id, new Set(entry.boards.map((item) => item.board.id))]));
    const ids = base.entries.map((entry) => entry.id);
    let modelPairs = 0;
    let met = 0;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        modelPairs += 1;
        const other = onBoards.get(ids[j]);
        if (Array.from(onBoards.get(ids[i])).some((id) => other.has(id))) met += 1;
      }
    }
    const single = base.entries.filter((entry) => entry.coverage === 1).length;

    /* noise: neighbouring places that are statistical ties */
    let neighbours = 0;
    let ties = 0;
    base.boards.forEach((board) => {
      for (let i = 0; i + 1 < board.rows.length; i += 1) {
        neighbours += 1;
        if (!clearPair(board.rows[i], board.rows[i + 1], board)) ties += 1;
      }
    });

    /* pooled (engine's held-out check) against the best-overlapping single board */
    const rows = base.boards.map((board) => {
      const clear = [];
      for (let i = 0; i < board.rows.length; i += 1) {
        for (let j = i + 1; j < board.rows.length; j += 1) {
          if (clearPair(board.rows[i], board.rows[j], board)) clear.push([board.rows[i], board.rows[j]]);
        }
      }
      const singles = base.boards.filter((other) => other !== board).map((other) => {
        const values = new Map(other.rows.map((row) => [row.model, row.value]));
        let judged = 0;
        let correct = 0;
        clear.forEach(([a, b]) => {
          if (!values.has(a.model) || !values.has(b.model) || values.get(a.model) === values.get(b.model)) return;
          judged += 1;
          if ((values.get(a.model) > values.get(b.model)) === (a.value > b.value)) correct += 1;
        });
        return { label: other.label, judged: judged, correct: correct };
      }).filter((item) => item.judged).sort((x, y) => y.judged - x.judged || y.correct / y.judged - x.correct / x.judged);
      const pooled = board.heldOut ? { judged: board.heldOut.pairs, correct: Math.round(board.heldOut.accuracy * board.heldOut.pairs) } : null;
      return { board: board, clear: clear.length, pooled: pooled, single: singles[0] || null };
    });
    const pct = (part, whole) => (whole ? Math.round(100 * part / whole) : 0);
    const reading = (row) => {
      if (!row.pooled) return "cannot be checked: fewer than two of its models are on other boards";
      if (!row.single) return "no other single board shares two of its models";
      const pooledAcc = row.pooled.correct / row.pooled.judged;
      const singleAcc = row.single.correct / row.single.judged;
      if (pooledAcc < 0.6 && singleAcc < 0.6) return '<span class="held-weak">other boards predict it poorly</span>';
      const more = row.pooled.judged / row.single.judged;
      const accuracy = pooledAcc - singleAcc >= 0.03 ? "higher accuracy" : singleAcc - pooledAcc >= 0.03 ? "lower accuracy" : "about the same accuracy";
      return `${more >= 1.1 ? `${more.toFixed(1)}&times; the pairs` : "the same pairs"}, ${accuracy}`;
    };
    const pooledMount = document.querySelector("[data-rank-pooled]");
    if (pooledMount) {
      pooledMount.innerHTML = `<table class="data-table method-table pooled-table"><thead><tr><th>Board left out</th><th>Clear pairs on it</th><th>Pooled index: judged</th><th>Correct</th><th>Single board with most overlap</th><th>Judged</th><th>Correct</th><th>Reading</th></tr></thead><tbody>`
        + rows.map((row) => `<tr><td>${escape(row.board.label)}</td><td>${row.clear}</td>`
          + (row.pooled ? `<td>${row.pooled.judged}</td><td>${pct(row.pooled.correct, row.pooled.judged)}%</td>` : "<td>-</td><td>-</td>")
          + (row.single ? `<td>${escape(row.single.label)}</td><td>${row.single.judged}</td><td>${pct(row.single.correct, row.single.judged)}%</td>` : "<td>-</td><td>-</td><td>-</td>")
          + `<td>${reading(row)}</td></tr>`).join("") + "</tbody></table>";
    }
    const both = rows.filter((row) => row.pooled && row.single);
    const sum = (list, pick) => list.reduce((total, row) => total + pick(row), 0);
    const pooledJudged = sum(both, (row) => row.pooled.judged);
    const pooledCorrect = sum(both, (row) => row.pooled.correct);
    const singleJudged = sum(both, (row) => row.single.judged);
    const singleCorrect = sum(both, (row) => row.single.correct);
    const totalMount = document.querySelector("[data-rank-pooled-total]");
    if (totalMount && both.length) {
      totalMount.innerHTML = `<span><b>All ${both.length} checkable boards</b> pooled index ${pct(pooledCorrect, pooledJudged)}% correct on ${pooledJudged} pairs; best-overlapping single board ${pct(singleCorrect, singleJudged)}% on ${singleJudged} pairs.</span>`;
    }

    /* the Why line in the method overview: three facts, every number named */
    const why = document.querySelector("[data-why]");
    if (why && both.length) {
      const pooledAcc = pooledCorrect / pooledJudged;
      const singleAcc = singleCorrect / singleJudged;
      const third = pooledAcc >= singleAcc - 0.03
        ? `<b>Pooling adds evidence.</b> Leave one board out, fit the index on the other ${base.boards.length - 1}, and check the left-out board's clearly separated pairs (gap larger than the board's noise). Over the ${both.length} boards this can be done for, the index orders <b>${pct(pooledCorrect, pooledJudged)}%</b> of ${pooledJudged} such pairs correctly; the single other board that shares the most models with each one orders ${pct(singleCorrect, singleJudged)}% of the ${singleJudged} it can judge.`
        : `<b>But the boards agree poorly.</b> Leave one board out, fit the index on the other ${base.boards.length - 1}, and check the left-out board's clearly separated pairs (gap larger than the board's noise). Over the ${both.length} boards this can be done for, the index orders only <b>${pct(pooledCorrect, pooledJudged)}%</b> of ${pooledJudged} such pairs correctly, while the single other board that shares the most models with each one orders ${pct(singleCorrect, singleJudged)}% of the ${singleJudged} it can judge. Read this index as provisional.`;
      why.innerHTML = `<ul class="why-list">`
        + `<li><b>No single board ranks the field.</b> The index ranks ${ids.length} models from the ${base.boards.length} boards listed at the top. Taking them two at a time gives ${modelPairs.toLocaleString("en")} pairs (${ids.length} &times; ${ids.length - 1} / 2); <b>${pct(modelPairs - met, modelPairs)}%</b> of these pairs never appear together on any board, so no board says which of the two is better. ${single} of the ${ids.length} models appear on one board only.</li>`
        + `<li><b>Each board alone is noisy.</b> Going down each board's own order, <b>${ties} of the ${neighbours}</b> steps from one model to the next are smaller than the board's noise - statistically a tie.</li>`
        + `<li>${third} Details under <a href="#agreement">Board agreement</a>.</li></ul>`;
    }

    /* one reading line above the agreement matrix */
    const readingLine = document.querySelector("[data-agree-reading]");
    if (readingLine) {
      const signed = (value) => (value >= 0 ? "+" : "&minus;") + Math.abs(value).toFixed(2);
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
    const labelOf = (id) => (cfg.boards[id] || {}).label || id;
    const summary = document.querySelector("[data-cap-summary]");
    if (summary && caps.length) {
      const boardsOf = (cap) => Array.from(new Set(cap.sources.map((source) => source.board)));
      const single = caps.filter((cap) => boardsOf(cap).length === 1);
      const byBoard = new Map();
      single.forEach((cap) => {
        const board = labelOf(boardsOf(cap)[0]);
        byBoard.set(board, (byBoard.get(board) || []).concat(cap.short));
      });
      summary.innerHTML = `${single.length} of the ${caps.length} columns rest on a single board (`
        + Array.from(byBoard.entries()).map(([board, list]) => `${escape(list.join(", "))}: ${escape(board)}`).join("; ")
        + `); ${caps.length - single.length === 0 ? "none combines" : caps.length - single.length === 1 ? "1 combines" : `${caps.length - single.length} combine`} several boards. Who defines each one is in the details.`;
    }
    const node = document.querySelector("[data-cap-details]");
    if (!node || !caps.length) return;
    const rows = caps.map((cap) => {
      const item = fitted.get(cap.id);
      const sources = cap.sources.map((source) => {
        const trials = source.trials || (cfg.boards[source.board] || {}).trials;
        return `<div><b>${escape(labelOf(source.board))}</b> ${escape(source.what || "")}${trials ? ` <small>(${trials.toLocaleString("en")} trials per model${source.trials ? "" : ", the board's own count"})</small>` : ""}</div>`;
      }).join("");
      return `<tr><td>${escape(cap.name)}</td><td>${escape(cap.definedBy || "")}</td><td class="cap-sources">${sources}</td><td>${item ? item.index.size : 0}</td></tr>`;
    }).join("");
    node.innerHTML = `<p>Each column is fitted exactly like the index (noise from the trial count, difficulty weights, Bradley-Terry, expected win rate), but only on the columns listed for it. Where the trial count is not published per sub-score, the number shown is our conservative stand-in.</p>`
      + `<div class="method-table-wrap"><table class="method-table cap-table"><thead><tr><th>Capability</th><th>Defined by</th><th>Measured by (board and what it scores)</th><th>Models scored</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  drawCapabilityDetails();

  /* --- Sim boards against real boards (only where the index has both) ------------------------------ */
  function drawSimReal() {
    const node = document.querySelector("[data-simreal]");
    if (!node) return;
    const trackOf = new Map(base.boards.map((board) => [board.label, board.track]));
    const kinds = [["Sim", "Sim"], ["Sim", "Real"], ["Real", "Real"]];
    if (!base.boards.some((board) => board.track === "Sim") || !base.boards.some((board) => board.track === "Real")) { node.innerHTML = ""; return; }
    const kindOf = (row) => [trackOf.get(row.a), trackOf.get(row.b)].sort().join("-");
    const signed = (value) => (value >= 0 ? "+" : "&minus;") + Math.abs(value).toFixed(2);
    const groups = kinds.map(([x, y]) => {
      const key = [x, y].sort().join("-");
      const rows = tauTable.filter((row) => kindOf(row) === key);
      return { label: `${x.toLowerCase()}&ndash;${y.toLowerCase()}`, measured: rows.filter((row) => row.tau !== null), unmeasured: rows.filter((row) => row.tau === null).length };
    });
    const tableRows = groups.map((group) => `<tr><td>${group.label}</td><td>${group.measured.length}${group.unmeasured ? ` <small>(+${group.unmeasured} sharing too few)</small>` : ""}</td>`
      + `<td>${group.measured.map((row) => `${escape(row.a)} &times; ${escape(row.b)} ${signed(row.tau)} <small>(${row.n} shared${row.beyond ? ", beyond chance" : ", could be chance"})</small>`).join("<br>") || "-"}</td></tr>`).join("");

    /* the whole index on sim boards only against real boards only */
    const sim = engine.build(db, cfg, Object.assign({}, defaults, { track: "Sim" }));
    const real = engine.build(db, cfg, Object.assign({}, defaults, { track: "Real" }));
    const simIndex = new Map(sim.entries.map((entry) => [entry.id, entry.index]));
    const realEntry = new Map(real.entries.map((entry) => [entry.id, entry]));
    const shared = Array.from(simIndex.keys()).filter((id) => realEntry.has(id));
    const pairs = shared.map((id) => [simIndex.get(id), realEntry.get(id).index]);
    const tau = shared.length >= minShared ? engine.kendallTau(pairs) : null;
    const chanceLevel = shared.length >= minShared ? Math.sqrt(2 * (2 * shared.length + 5) / (9 * shared.length * (shared.length - 1))) : null;
    const gaps = shared.map((id) => ({ id: id, sim: simIndex.get(id), real: realEntry.get(id).index, boards: realEntry.get(id).boards.map((item) => item.board.label) }))
      .sort((x, y) => Math.abs(y.real - y.sim) - Math.abs(x.real - x.sim)).slice(0, 3);

    const simReal = groups[1].measured;
    const realReal = groups[2].measured;
    const negatives = tauTable.filter((row) => row.tau !== null && row.tau < 0);
    const sentences = [];
    if (simReal.length) {
      const values = simReal.map((row) => row.tau);
      sentences.push(values.every((value) => value > 0)
        ? `Every sim&ndash;real pair that can be measured leans the same way (${signed(Math.min.apply(null, values))} to ${signed(Math.max.apply(null, values))}).`
        : `Sim&ndash;real pairs range from ${signed(Math.min.apply(null, values))} to ${signed(Math.max.apply(null, values))}.`);
    }
    sentences.push(realReal.length
      ? `Real&ndash;real agreement can be measured for only ${realReal.length} pair${realReal.length === 1 ? "" : "s"}${groups[2].unmeasured ? `; ${groups[2].unmeasured} other real&ndash;real pairs share too few models` : ""}.`
      : "No real&ndash;real pair shares enough models to measure.");
    if (tau !== null) {
      sentences.push(`Fitted on sim boards only and on real boards only, the two indices order their ${shared.length} shared models with &tau; = ${signed(tau)} (${Math.abs(tau) >= 2 * chanceLevel ? "beyond chance" : "could be chance"}).`);
    }
    if (simReal.length && simReal.every((row) => row.tau > 0) && tau !== null && tau > 0) {
      sentences.push(`So the data do not show real boards disagreeing with sim boards as a group.`
        + (negatives.length ? ` The pair${negatives.length === 1 ? " that leans" : "s that lean"} reversed - ${negatives.map((row) => `${escape(row.a)} &times; ${escape(row.b)} (${row.beyond ? "beyond chance" : "within chance on its own"})`).join(", ")} - ${negatives.every((row) => trackOf.get(row.a) === "Real" && trackOf.get(row.b) === "Real") ? (negatives.length === 1 ? "sits between two real boards" : "sit between real boards") : (negatives.length === 1 ? "involves a sim board" : "involve a sim board")}.` : ""));
    }
    node.innerHTML = `<div class="method-table-wrap"><table class="method-table simreal-table"><thead><tr><th>Board pair</th><th>Pairs with a &tau;</th><th>&tau; per pair</th></tr></thead><tbody>${tableRows}</tbody></table></div>`
      + `<p class="simreal-reading">${sentences.join(" ")}</p>`
      + (gaps.length ? `<p class="simreal-reading">Single models can still differ a lot between the two: ${gaps.map((gap) => `${escape(nameOf(gap.id))} ${fixed(gap.sim)} on sim against ${fixed(gap.real)} on real <small>(real: ${escape(gap.boards.join(", "))})</small>`).join("; ")}.</p>` : "");
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
    const pivot = entries.slice().sort((a, b) => b.coverage - a.coverage || a.rank - b.rank)[0];
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
          + `<td>${entry.id === pivot.id ? "-" : (strength(entry.id) / (strength(entry.id) + strength(pivot.id))).toFixed(2)}</td></tr>`).join("")
        + "</tbody></table></div>";
    }

    const values = entries.map((entry) => strength(entry.id));
    const high = Math.max.apply(null, values);
    const low = Math.min.apply(null, values);
    const belowOne = values.filter((value) => value < 1).length;
    const top = entries[0];
    const why = document.querySelector("[data-strength-why]");
    if (why) {
      why.innerHTML = `<li><b>Strengths have no unit.</b> Only their ratios matter: multiply every strength by 10 and every predicted head-to-head stays the same. Our scale is pinned only by the weak tie to a reference of strength 1.</li>`
        + `<li><b>They are hard to read on a chart.</b> They run from ${low.toPrecision(2)} to ${high.toPrecision(3)}, a factor of ${Math.round(high / low).toLocaleString("en")}; ${belowOne} of the ${n} models sit below 1, squeezed near zero, while the top few stretch the axis.</li>`
        + `<li><b>The index answers a plain question</b> on a fixed 0-100 scale: how often would this model beat the others? It is computed from the strengths and keeps their order exactly - same ranking, readable numbers.</li>`
        + `<li><b>What strengths are still best for:</b> one direct match. ${escape(nameOf(top.id))} against ${escape(nameOf(pivot.id))}: ${strength(top.id).toPrecision(3)} / (${strength(top.id).toPrecision(3)} + ${strength(pivot.id).toPrecision(3)}) = ${(strength(top.id) / (strength(top.id) + strength(pivot.id))).toFixed(2)}. The index averages such chances over the whole field, so it moves when models are added or removed; the ratio of two strengths hardly does.</li>`;
    }

    /* the worked update: the fitted strength balances the update rule */
    const exampleNode = document.querySelector("[data-strength-example]");
    if (exampleNode) {
      const seOf = (item, board) => {
        if (board.scale === "elo") return typeof item.row.sd === "number" ? item.row.sd : board.eloSd || 30;
        if (typeof item.row.se === "number") return item.row.se;
        const p = Math.min(0.98, Math.max(0.02, item.value / 100));
        return 100 * Math.sqrt(p * (1 - p) / board.trials);
      };
      const prior = cfg.prior || 0.1;
      const si = strength(pivot.id);
      let wins = 0;
      let exposure = 0;
      const perBoard = [];
      base.boards.forEach((board) => {
        const mine = board.rows.filter((item) => item.model === pivot.id)[0];
        if (!mine) return;
        const perPair = board.weight / (board.rows.length - 1);
        let boardWins = 0;
        let boardExposure = 0;
        board.rows.forEach((other) => {
          if (other === mine) return;
          const sigma = Math.sqrt(Math.pow(seOf(mine, board), 2) + Math.pow(seOf(other, board), 2)) || 1;
          boardWins += perPair * engine.phi((mine.value - other.value) / sigma);
          boardExposure += perPair / (si + strength(other.model));
        });
        wins += boardWins;
        exposure += boardExposure;
        perBoard.push([board.label, board.rows.length - 1, boardWins, boardExposure]);
      });
      const top = prior / 2 + wins;
      const bottom = prior / (si + 1) + exposure;
      exampleNode.innerHTML = `<p>${escape(nameOf(pivot.id))} is on ${perBoard.length} boards. On each, every opponent contributes its pair weight \\(\\omega\\) (step 5) times the win share \\(W\\) (step 3) to the top of the update, and \\(\\omega / (s_i + s_j)\\) to the bottom, using the final strengths:</p>`
        + `<div class="method-table-wrap"><table class="method-table"><thead><tr><th>Board</th><th>Opponents</th><th>Weighted wins \\(\\sum \\omega W\\)</th><th>\\(\\sum \\omega / (s_i + s_j)\\)</th></tr></thead><tbody>`
        + perBoard.map(([label, opponents, w, x]) => `<tr><td>${escape(label)}</td><td>${opponents}</td><td>${w.toFixed(4)}</td><td>${x.toFixed(4)}</td></tr>`).join("")
        + `</tbody></table></div>`
        + `<div class="step-math"><div class="eq"><span class="eq-label">balance</span><span class="eq-body">\\(\\displaystyle \\frac{${(prior / 2).toFixed(2)} + ${wins.toFixed(4)}}{${(prior / (si + 1)).toFixed(4)} + ${exposure.toFixed(4)}} = \\frac{${top.toFixed(4)}}{${bottom.toFixed(4)}} = ${(top / bottom).toFixed(3)} \\approx s = ${si.toFixed(3)}\\)</span></div>`
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
        return `<li><a href="${escape(group.sourceUrl)}" target="_blank" rel="noreferrer">${escape(label)}</a>`
          + `<small>${entrants.length} entrants${overlap.length ? " · " + overlap.map((item) => `${item.count} also on ${escape(item.label)}`).join(" · ") : " · none on an index board"} · in the Ledger</small>`
          + `<span>${escape((entry && (entry.reason || entry)) || "No reason recorded yet.")}</span></li>`;
      }).join("") + "</ul>" : "";
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

  /* Typeset every \( ... \) formula on the page, including those the code
     above has just written. KaTeX is vendored in vendor/katex/. */
  if (window.renderMathInElement) {
    window.renderMathInElement(document.querySelector("main"), {
      delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }],
      throwOnError: false
    });
  }
})();
