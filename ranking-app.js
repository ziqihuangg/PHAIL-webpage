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

  /* --- model gaps (static: raw published scores, not the index) ----------------------------------
     The rules come from cfg.gaps; every number is computed here from the
     ledger, so nothing in this section is typed by hand. */
  const gapMount = document.querySelector("[data-rank-gaps]");
  if (gapMount && cfg.gaps) {
    const agentSet = new Set(cfg.agents || []);
    const groupOf = (id) => db.resultGroups.filter((group) => group.id === id)[0];
    const boardName = (id) => (cfg.boards[id] || {}).label || id;
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
        const cells = gap.boards.map((id) => {
          const rows = bestPerModel(groupOf(id), (row) => row[gap.field]);
          return rows.length ? { id: id, rows: rows, best: rows[0], med: median(rows.map((entry) => entry.value)) } : null;
        }).filter(Boolean);
        if (!cells.length) return null;
        const many = cells.length > 1;
        const tag = (cell) => (many ? `<span class="gap-board">${escape(boardName(cell.id))}</span>` : "");
        const fails = cells.map((cell) => Math.round(100 - cell.best.value));
        return {
          board: many ? "" : boardName(cells[0].id),
          best: cells.map((cell) => `<div>${tag(cell)}<b>${fixed(cell.best.value)}%</b> ${who(cell.best)}</div>`).join(""),
          typical: cells.map((cell) => `<div>${tag(cell)}${fixed(cell.med)}%</div>`).join(""),
          reading: many
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
          reading: `${halved} of ${rows.length} policies lose more than half their ${escape(gap.labels[0])}-scene score. Largest fall: ${escape(nameOf(worst.model))}, ${fixed(worst.from)}% &rarr; ${fixed(worst.to)}%.`
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
      scope.layers.filter((layer) => !layer.boundary).forEach((layer) => layer.domains.forEach((domain) => {
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
