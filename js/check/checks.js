/* =============================================================================
   PhAIL - every check, run in the browser by check.html (no build, no tools)
   -----------------------------------------------------------------------------
   Groups, each a list of { name, status: pass | fail | warn | skip, detail, list }:
     data         the ledger, the index configs and the Scope links hold together
     formulas     each formula printed on the Index pages, re-implemented here
                  from the page text, gives what the engine computes - on every
                  row, pair and board of both indices
     explanations the worked examples agree with the index they explain
     text         no number typed by hand; every {token} has a value
     sources      raw source files parse into the Ledger rows (js/engine/raw-sources.js)
     changes      what moved since the saved baseline (data/expected.js)
   The formula re-implementations below are deliberately written out again
   rather than calling the engine's helpers: a check that calls the code it
   checks proves nothing.
   ========================================================================== */

(function (root) {
  const E = root.phailRankingEngine;
  const A = root.phailRankingAnalysis;
  const L = root.phailLint;
  const F = root.phailFacts;

  const item = (name, ok, detail, list, softly) => ({ name: name, status: ok ? "pass" : softly ? "warn" : "fail", detail: detail || "", list: list || [] });
  const skip = (name, detail) => ({ name: name, status: "skip", detail: detail, list: [] });
  const near = (a, b, rel) => Math.abs(a - b) <= (rel || 1e-9) * Math.max(1, Math.abs(a), Math.abs(b));
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const indices = () => [["robotics", root.phailRanking], ["cad", root.phailCadRanking]].filter((pair) => pair[1]);

  /* ======================================================================== data */
  function dataChecks(db, scope) {
    const out = [];
    const groups = db.resultGroups;
    const modelIds = new Set(db.models.map((model) => model.id));
    const rowCount = groups.reduce((total, group) => total + group.rows.length, 0);

    const dupModels = db.models.map((model) => model.id).filter((id, i, list) => list.indexOf(id) !== i);
    out.push(item("Model ids are unique", !dupModels.length, `${db.models.length} models`, dupModels));
    const dupGroups = groups.map((group) => group.id).filter((id, i, list) => list.indexOf(id) !== i);
    out.push(item("Table ids are unique", !dupGroups.length, `${groups.length} tables`, dupGroups));

    const unknown = [];
    groups.forEach((group) => group.rows.forEach((row) => { if (!modelIds.has(row.model)) unknown.push(`${group.id}: ${row.model}`); }));
    out.push(item("Every row names a model in the model list", !unknown.length, `${rowCount} rows`, unknown));

    const orphans = db.models.filter((model) => !db.organisations[model.org]).map((model) => `${model.id}: org "${model.org}"`);
    out.push(item("Every model's organisation exists", !orphans.length, "", orphans));

    const unused = db.models.filter((model) => !groups.some((group) => group.rows.some((row) => row.model === model.id))).map((model) => model.id);
    out.push(item("Every model has at least one row", !unused.length, "a model without rows is shown nowhere", unused, true));

    const tasks = new Set(db.tasks.map((task) => task.id));
    const benchmarks = new Set((db.benchmarks || []).map((benchmark) => benchmark.id));
    const provenance = Object.keys(db.provenance);
    const citation = [];
    groups.forEach((group) => {
      if (!group.source) citation.push(`${group.id}: no source`);
      if (!/^https?:\/\//.test(group.sourceUrl || "")) citation.push(`${group.id}: no sourceUrl`);
      if (provenance.indexOf(group.provenance) === -1) citation.push(`${group.id}: provenance "${group.provenance}"`);
      if (!tasks.has(group.task)) citation.push(`${group.id}: task "${group.task}"`);
      if (group.benchmark && !benchmarks.has(group.benchmark)) citation.push(`${group.id}: benchmark "${group.benchmark}"`);
    });
    out.push(item("Every table has a source, an openable URL, a provenance, a known task and benchmark", !citation.length, "", citation));

    const noValue = [];
    const range = [];
    groups.forEach((group) => {
      if (group.provenance === "pending" || !group.primary) return;
      group.rows.forEach((row) => {
        const value = row[group.primary];
        if (typeof value !== "number" || Number.isNaN(value)) { if (!row.derived && row.display === undefined) noValue.push(`${group.id}: ${row.model}${row.variant ? " (" + row.variant + ")" : ""}`); return; }
        const percent = group.unit === "%" || group.primary === "success";
        if (percent && (value < 0 || value > 100)) range.push(`${group.id}: ${row.model} ${value}`);
        if (group.primary === "elo" && (value < 0 || value > 4000)) range.push(`${group.id}: ${row.model} ${value}`);
      });
    });
    out.push(item("Every row has a number in its table's primary column", !noValue.length, "", noValue, true));
    out.push(item("Percentages lie in 0-100, Elo ratings in 0-4000", !range.length, "", range));

    const dupRows = [];
    groups.forEach((group) => {
      const seen = new Set();
      group.rows.forEach((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) dupRows.push(`${group.id}: ${row.model}`);
        seen.add(key);
      });
    });
    out.push(item("No row is entered twice", !dupRows.length, "", dupRows));

    /* the index configs point at things that exist */
    indices().forEach(([key, cfg]) => {
      const file = key === "cad" ? "data/ranking-cad.js" : "data/ranking-robotics.js";
      const groupOf = (id) => groups.filter((group) => group.id === id)[0];
      const problems = [];
      Object.keys(cfg.boards).forEach((id) => {
        const group = groupOf(id);
        if (!group) problems.push(`boards: ${id} is not a Ledger table`);
        else if (group.provenance !== "benchmark") problems.push(`boards: ${id} is ${group.provenance}, not benchmark-run`);
        const metric = cfg.boards[id].metric;
        if (group && metric && !group.rows.some((row) => typeof row[metric] === "number")) problems.push(`boards: ${id} has no "${metric}" column`);
        if (!cfg.boards[id].trials && cfg.boards[id].scale !== "elo") problems.push(`boards: ${id} states no trials`);
      });
      (cfg.capabilities || []).forEach((cap) => cap.sources.forEach((source) => {
        const group = groupOf(source.board);
        if (!group) { problems.push(`capabilities ${cap.id}: ${source.board} is not a Ledger table`); return; }
        const has = (row) => (typeof source.dim === "number" ? row.d && typeof row.d[source.dim] === "number"
          : source.min ? source.min.every((field) => typeof row[field] === "number")
          : typeof row[source.field || (cfg.boards[group.id] || {}).metric || group.primary] === "number");
        if (group.rows.filter(has).length < 2) problems.push(`capabilities ${cap.id}: fewer than 2 rows on ${source.board}`);
      }));
      (cfg.gaps || []).forEach((gap) => (gap.boards || [gap.board]).forEach((id) => { if (!groupOf(id)) problems.push(`gaps ${gap.name}: ${id} is not a Ledger table`); }));
      (cfg.agents || []).forEach((id) => { if (!modelIds.has(id)) problems.push(`agents: ${id} is not a model`); });
      out.push(item(`${file}: boards, capabilities, gaps and agents point at existing tables and columns`, !problems.length, "", problems));

      const silent = groups.filter((group) => group.provenance === "benchmark" && !cfg.boards[group.id] && !(cfg.outOfIndex || {})[group.id]
        && (!cfg.tasks || cfg.tasks.indexOf(group.task) !== -1)).map((group) => group.id);
      out.push(item(`${file}: every operator-run table is in the index or has a reason to be out`, !silent.length, "", silent, true));

      if (scope) {
        const scopeTasks = new Set();
        scope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) => scopeTasks.add(task.id))));
        const lost = Object.keys(cfg.boards).filter((id) => !scopeTasks.has(cfg.boards[id].scopeTask)).map((id) => `${id}: scopeTask "${cfg.boards[id].scopeTask}"`);
        out.push(item(`${file}: every index board sits under a Scope task`, !lost.length, "", lost));
      }
    });

    if (scope) {
      const broken = [];
      scope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) => task.benchmarks.forEach((board) => {
        if (board.ledger && !benchmarks.has(board.ledger)) broken.push(`${board.name}: ledger "${board.ledger}"`);
      }))));
      out.push(item("Scope boards marked as in the Ledger point at a Ledger benchmark", !broken.length, "", broken));
    }
    return out;
  }

  /* ==================================================================== formulas */
  function formulaChecks(db) {
    const out = [];
    const c = E.constants;

    /* Phi against published values of the normal curve */
    const table = [[0, 0.5], [1, 0.841345], [2, 0.977250], [-1, 0.158655], [3, 0.998650]];
    const phiBad = table.filter(([z, p]) => Math.abs(E.phi(z) - p) > 1e-6).map(([z, p]) => `Phi(${z}) = ${E.phi(z)}, table ${p}`);
    out.push(item("Phi matches the normal table (step 3)", !phiBad.length, "Phi(0) = 0.50, Phi(1) = 0.84, Phi(2) = 0.98", phiBad));

    const elo = [[0, 0.5], [100, 1 / (1 + Math.pow(10, -0.25))], [400, 10 / 11]];
    const eloBad = elo.filter(([gap, p]) => !near(E.eloPreferred(gap), p)).map(([gap]) => `gap ${gap}: ${E.eloPreferred(gap)}`);
    out.push(item("Elo preference = 1 / (1 + 10^(-gap/400)) (step 3)", !eloBad.length, "", eloBad));

    const tauCases = [
      [[[1, 1], [2, 2], [3, 3], [4, 4]], 1], [[[1, 4], [2, 3], [3, 2], [4, 1]], -1],
      [[[1, 1], [2, 3], [3, 2], [4, 4]], 4 / 6], [[[1, 1], [1, 2], [2, 3], [3, 3]], 4 / Math.sqrt(5 * 5)]
    ];
    const tauBad = tauCases.filter(([pairs, tau]) => !near(E.kendallTau(pairs), tau)).map(([pairs, tau]) => `${JSON.stringify(pairs)}: ${E.kendallTau(pairs)}, expected ${tau}`);
    out.push(item("Kendall tau-b on hand-worked cases (Board agreement)", !tauBad.length, "", tauBad));
    out.push(item("Chance level of tau = sqrt(2(2n+5) / (9n(n-1)))", near(E.chanceLevel(4), Math.sqrt(26 / 108)) && near(E.chanceLevel(10), Math.sqrt(50 / 810)), ""));

    indices().forEach(([key, cfg]) => {
      const label = key === "cad" ? "CAD" : "Robotics";
      const run = E.build(db, cfg, A.defaults);
      const boards = run.boards;

      /* step 3: noise of one score, as printed */
      const seOf = (item, board) => {
        if (board.scale === "elo") return typeof item.row.sd === "number" ? item.row.sd : board.eloSd || c.eloSd;
        if (typeof item.row.se === "number") return item.row.se;
        const p = clamp(item.value / 100, c.pMin, c.pMax);
        return 100 * Math.sqrt(p * (1 - p) / board.trials);
      };
      const seBad = [];
      let seCount = 0;
      boards.forEach((board) => board.rows.forEach((row) => {
        seCount += 1;
        if (!near(seOf(row, board), E.standardError(row.value, row.row, board))) seBad.push(`${board.id}: ${row.model}`);
      }));
      out.push(item(`${label}: SE = 100 sqrt(p(1-p)/n), a board's own interval or Elo sd (step 3)`, !seBad.length, `${seCount} scores`, seBad));

      /* step 3: win share */
      const shareBad = [];
      let pairCount = 0;
      boards.forEach((board) => {
        for (let i = 0; i < board.rows.length; i += 1) {
          for (let j = i + 1; j < board.rows.length; j += 1) {
            const a = board.rows[i];
            const b = board.rows[j];
            const sigma = Math.sqrt(Math.pow(seOf(a, board), 2) + Math.pow(seOf(b, board), 2));
            pairCount += 1;
            if (!near(E.phi((a.value - b.value) / sigma), E.winShare(a, b, board))) shareBad.push(`${board.id}: ${a.model} vs ${b.model}`);
            /* 1.5e-7: the documented accuracy of the erf approximation (A&S 7.1.26) */
            if (!near(E.winShare(a, b, board) + E.winShare(b, a, board), 1, 1.5e-7)) shareBad.push(`${board.id}: ${a.model} vs ${b.model} do not add to 1`);
          }
        }
      });
      out.push(item(`${label}: P(A beats B) = Phi(gap / sqrt(SE_A^2 + SE_B^2)) (step 3)`, !shareBad.length, `${pairCount.toLocaleString("en")} pairs`, shareBad));

      /* step 4: weights */
      const family = new Map();
      boards.forEach((board) => family.set(board.family, (family.get(board.family) || 0) + 1));
      let total = 0;
      const weightBad = [];
      boards.forEach((board) => {
        const only = (cfg.boards[board.id] || {}).difficultyHarness;
        const top = (only && board.rows.filter((entry) => only.indexOf(entry.row.harness) !== -1)[0]) || board.rows[0];
        const d = board.scale === "elo" ? cfg.neutralDifficulty : clamp(1 - top.value / 100, cfg.minDifficulty, 1);
        const f = 1 / family.get(board.family);
        const e = cfg.evidenceWeight[board.provenance];
        const w = d * f * e;
        total += w;
        if (!near(w, board.weight)) weightBad.push(`${board.id}: engine ${board.weight}, formula ${w}`);
      });
      boards.forEach((board) => { if (!near(board.weight / total, board.weightShare)) weightBad.push(`${board.id}: share`); });
      out.push(item(`${label}: w = d f e with d = 1 - best/100, share = w / sum w (step 4)`, !weightBad.length, `${boards.length} boards`, weightBad));

      /* steps 5-6: the fitted strengths satisfy the printed update, for every model */
      const s = run.strengths;
      const wins = new Map();
      const exposure = new Map();
      s.forEach((value, id) => { wins.set(id, cfg.prior / 2); exposure.set(id, cfg.prior / (value + 1)); });
      boards.forEach((board) => {
        const omega = board.weight / (board.rows.length - 1);
        board.rows.forEach((a) => board.rows.forEach((b) => {
          if (a === b) return;
          const sigma = Math.sqrt(Math.pow(seOf(a, board), 2) + Math.pow(seOf(b, board), 2));
          wins.set(a.model, wins.get(a.model) + omega * E.phi((a.value - b.value) / sigma));
          exposure.set(a.model, exposure.get(a.model) + omega / (s.get(a.model) + s.get(b.model)));
        }));
      });
      const btBad = [];
      s.forEach((value, id) => { if (!near(wins.get(id) / exposure.get(id), value, 1e-6)) btBad.push(`${id}: update ${wins.get(id) / exposure.get(id)}, strength ${value}`); });
      out.push(item(`${label}: every fitted strength is a fixed point of the printed update (step 6)`, !btBad.length, `${s.size} models, omega = w/(k-1), pi = ${cfg.prior}`, btBad));

      /* step 7: index */
      const ids = Array.from(s.keys());
      const indexBad = [];
      run.entries.forEach((entry) => {
        let sum = 0;
        ids.forEach((other) => { if (other !== entry.id) sum += s.get(entry.id) / (s.get(entry.id) + s.get(other)); });
        const printed = 100 * sum / (ids.length - 1);
        if (!near(printed, entry.index)) indexBad.push(`${entry.id}: engine ${entry.index}, formula ${printed}`);
      });
      const orderBad = run.entries.filter((entry, i) => i && s.get(run.entries[i - 1].id) < s.get(entry.id)).map((entry) => entry.id);
      out.push(item(`${label}: Index = 100/(N-1) sum s_i/(s_i+s_j), in strength order (step 7)`, !indexBad.length && !orderBad.length, `${run.entries.length} models`, indexBad.concat(orderBad)));

      /* step 8: drop one board = the whole index refitted without it */
      const dropBad = [];
      const heldBad = [];
      boards.forEach((left, b) => {
        const rest = {};
        Object.keys(cfg.boards).forEach((id) => { if (id !== left.id) rest[id] = cfg.boards[id]; });
        const refit = E.build(db, Object.assign({}, cfg, { boards: rest }), A.defaults);
        const index = new Map(refit.entries.map((entry) => [entry.id, entry.index]));
        run.entries.forEach((entry) => {
          const drop = entry.drops[b];
          const expected = index.has(entry.id) ? index.get(entry.id) : null;
          if ((drop.index === null) !== (expected === null) || (expected !== null && !near(drop.index, expected, 1e-9))) dropBad.push(`${entry.id} without ${left.id}`);
        });
        /* held-out: the refit orders the left-out board's clear pairs */
        let judged = 0;
        let correct = 0;
        for (let i = 0; i < left.rows.length; i += 1) {
          for (let j = i + 1; j < left.rows.length; j += 1) {
            const x = left.rows[i];
            const y = left.rows[j];
            if (!refit.strengths.has(x.model) || !refit.strengths.has(y.model)) continue;
            if (Math.abs(x.value - y.value) <= Math.sqrt(Math.pow(seOf(x, left), 2) + Math.pow(seOf(y, left), 2))) continue;
            judged += 1;
            if (refit.strengths.get(x.model) > refit.strengths.get(y.model)) correct += 1;
          }
        }
        const engine = left.heldOut || { pairs: 0, accuracy: 0 };
        if (engine.pairs !== judged || (judged && !near(engine.accuracy, correct / judged))) heldBad.push(`${left.id}: engine ${engine.pairs} pairs ${engine.accuracy}, recomputed ${judged} pairs ${judged ? correct / judged : "-"}`);
      });
      const rangeBad = run.entries.filter((entry) => {
        const values = [entry.index].concat(entry.drops.filter((drop) => drop.index !== null).map((drop) => drop.index));
        return !near(entry.range[0], Math.min.apply(null, values)) || !near(entry.range[1], Math.max.apply(null, values));
      }).map((entry) => entry.id);
      out.push(item(`${label}: each drop-one value equals a full refit without that board (step 8)`, !dropBad.length && !rangeBad.length, `${boards.length} refits`, dropBad.concat(rangeBad)));
      out.push(item(`${label}: held-out accuracy recomputed from each refit (Boards and weights)`, !heldBad.length, "", heldBad));

      /* Board agreement: tau-b from C, D and one-sided ties, as printed */
      const tauBad2 = [];
      run.agreement.forEach((rowCells, i) => rowCells.forEach((cell, j) => {
        if (i >= j || cell.tau === null) return;
        const other = new Map(boards[j].rows.map((row) => [row.model, row.value]));
        const shared = boards[i].rows.filter((row) => other.has(row.model)).map((row) => [row.value, other.get(row.model)]);
        let C = 0; let D = 0; let TA = 0; let TB = 0;
        for (let x = 0; x < shared.length; x += 1) {
          for (let y = x + 1; y < shared.length; y += 1) {
            const da = shared[x][0] - shared[y][0];
            const db2 = shared[x][1] - shared[y][1];
            if (da === 0 && db2 === 0) continue;
            if (da === 0) TA += 1; else if (db2 === 0) TB += 1; else if (da * db2 > 0) C += 1; else D += 1;
          }
        }
        const tau = (C - D) / Math.sqrt((C + D + TA) * (C + D + TB));
        if (!near(tau, cell.tau)) tauBad2.push(`${boards[i].id} x ${boards[j].id}: engine ${cell.tau}, formula ${tau}`);
      }));
      out.push(item(`${label}: tau-b = (C - D) / sqrt((C+D+T_A)(C+D+T_B)) for every board pair`, !tauBad2.length, "", tauBad2));
    });
    return out;
  }

  /* ================================================================ explanations */
  function explanationChecks(db) {
    const out = [];
    indices().forEach(([key, cfg]) => {
      const label = key === "cad" ? "CAD" : "Robotics";
      const x = A.explain(db, cfg, A.defaults);
      const base = x.base;
      if (x.index) out.push(item(`${label}: the pivot's index is the mean of its win chances (step 7 example)`, near(x.index.meanChance * 100, x.index.pivot.index, 1e-9), `${x.index.meanChance.toFixed(4)} x 100 vs ${x.index.pivot.index.toFixed(2)}`));
      if (x.balance) out.push(item(`${label}: the worked strength update returns the fitted strength (step 6 example)`, near(x.balance.update, x.balance.strength, 1e-6), `${x.balance.update.toFixed(6)} vs ${x.balance.strength.toFixed(6)}`));
      const tauBad = x.tau.filter((row) => {
        if (row.tau === null) return false;
        const i = base.boards.findIndex((board) => board.label === row.a);
        const j = base.boards.findIndex((board) => board.label === row.b);
        return !near(base.agreement[i][j].tau, row.tau);
      }).map((row) => `${row.a} x ${row.b}`);
      out.push(item(`${label}: the tau table matches the agreement matrix`, !tauBad.length, `${x.tau.length} board pairs`, tauBad));
      const heldBad = x.pooled.rows.filter((row) => row.pooled && row.pooled.judged !== row.board.heldOut.pairs).map((row) => row.board.id);
      out.push(item(`${label}: pooled-vs-single uses the engine's held-out pairs`, !heldBad.length, "", heldBad));
      const shareSum = base.boards.reduce((total, board) => total + board.weightShare, 0);
      out.push(item(`${label}: board weight shares add up to 100%`, near(shareSum, 1), `${(shareSum * 100).toFixed(6)}%`));
      const perModel = x.pairs.filter((row) => !near(row.perPair * (row.k - 1), row.weight)).map((row) => row.board.id);
      out.push(item(`${label}: each model receives a board's weight exactly once (step 5)`, !perModel.length, "", perModel));
    });
    return out;
  }

  /* ======================================================================== text */
  function textChecks() {
    const out = [];
    const keys = Object.keys(root.phailDiscussion || {}).filter((key) => Array.isArray(root.phailDiscussion[key]));
    const texts = L.dataTexts(keys.concat(["todo"]), null).concat(L.dataTexts([], "robotics"), L.dataTexts([], "cad"));
    const typed = L.scan(texts);
    out.push(item("Data text (discussion, TODO, index configs) types no number: each is a {token} or an {!intentional} literal", !typed.length,
      `${texts.length} texts`, typed.map((hit) => `${hit.where}: "${hit.number}" in ${hit.context}`)));

    const before = F.missing.length;
    texts.forEach((text) => F.fill(text.text, text.where));
    const missing = F.missing.slice(before);
    out.push(item("Every {token} in data text has a value", !missing.length, "", missing.map((miss) => `${miss.where}: {${miss.token}}`)));

    const literals = L.literals(texts);
    out.push({ name: "Numbers written on purpose ({!...} in data, data-fact in HTML) - review that each is not something the data could give",
      status: "warn", detail: `${literals.length} in data text`, list: literals.map((lit) => `${lit.where}: ${lit.text}`), review: true });
    return out;
  }

  /* pages are read over http: file:// does not let one page read another */
  function pageChecks(pages) {
    if (root.location.protocol.indexOf("http") !== 0) {
      return Promise.resolve([skip("HTML pages type no number (each page also checks itself on load)", "Open this page through bash tools/preview.sh or the published site to scan every page from here.")]);
    }
    return Promise.all(pages.map((page) => fetch(page, { cache: "no-store" }).then((response) => response.text()).then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const hits = L.scan(L.htmlTexts(doc.querySelector("main")));
      const facts = Array.prototype.map.call(doc.querySelectorAll("main [data-fact]"), (node) => node.textContent);
      return { page: page, hits: hits, facts: facts };
    }).catch((error) => ({ page: page, error: String(error) })))).then((results) => {
      const out = results.map((result) => {
        const id = "page-" + result.page.replace(".html", "");
        if (result.error) return Object.assign(item(`${result.page}: could not be read`, false, result.error), { anchor: id });
        const tab = (root.phailPages || []).filter((page) => page.file === result.page)[0];
        const note = !tab ? " (no tab, kept for old links: warning only)" : tab.ready === false ? " (tab marked Not ready: warning only)" : "";
        return Object.assign(item(`${result.page}: no number typed into the HTML${note}`, !result.hits.length,
          `${result.facts.length} marked data-fact`, result.hits.map((hit) => `${hit.where || "main"}: "${hit.number}" in ${hit.context}`), !!note), { anchor: id });
      });
      const facts = [].concat.apply([], results.filter((result) => result.facts).map((result) => result.facts.map((text) => `${result.page}: ${text}`)));
      out.push({ name: "Numbers marked data-fact in the HTML - review that each is a definition or a quoted fact, not something the data could give",
        status: "warn", detail: `${facts.length} on ${results.length} pages`, list: facts, review: true });
      return out;
    });
  }

  /* page scripts only format: a formula in one would be a second copy of the engine's */
  function scriptChecks(scripts) {
    if (root.location.protocol.indexOf("http") !== 0) return Promise.resolve([skip("Page scripts contain no formula", "Needs http, as above.")]);
    const pattern = /Math\.(?:sqrt|pow|exp)\(|Math\.log\(|\.phi\(|\.standardError\(|10,\s*-/;
    return Promise.all(scripts.map((path) => fetch(path, { cache: "no-store" }).then((response) => response.text()).then((text) =>
      text.split("\n").map((line, i) => (pattern.test(line) ? `${path}:${i + 1}: ${line.trim().slice(0, 140)}` : null)).filter(Boolean)))).then((lists) => {
      const hits = [].concat.apply([], lists);
      return [item("Page scripts contain no formula: every calculation is in js/engine/", !hits.length, `${scripts.length} files`, hits)];
    });
  }

  /* ===================================================================== changes */
  function snapshot(db) {
    const shot = { indices: {}, facts: {}, ledger: {} };
    /* every Ledger row's numbers, so a refresh of a raw source shows what moved */
    db.resultGroups.forEach((group) => {
      const rows = {};
      group.rows.forEach((row) => {
        let key = [row.model, row.variant || "", row.submitter || ""].join(" | ");
        while (rows[key]) key += " +";
        const values = {};
        Object.keys(row).forEach((field) => { if (typeof row[field] === "number") values[field] = Number(row[field].toFixed(4)); });
        rows[key] = values;
      });
      shot.ledger[group.id] = rows;
    });
    indices().forEach(([key, cfg]) => {
      const run = E.build(db, cfg, A.defaults);
      const models = {};
      run.entries.forEach((entry) => { models[entry.id] = [entry.rank, Number(entry.index.toFixed(2))]; });
      const boards = {};
      run.boards.forEach((board) => { boards[board.id] = [board.rows.length, Number((board.weightShare * 100).toFixed(2)), board.heldOut ? Number((board.heldOut.accuracy * 100).toFixed(1)) : null]; });
      shot.indices[key] = { models: models, boards: boards };
      const facts = F.namespace(key) || {};
      shot.facts[key] = {};
      Object.keys(facts).forEach((name) => { if (typeof facts[name] !== "function") shot.facts[key][name] = facts[name]; });
    });
    return shot;
  }

  function changeChecks(db, expected) {
    const now = snapshot(db);
    if (!expected) return { snapshot: now, items: [item("A baseline is saved (data/expected.js)", false, "Save one with the button above; later runs list what moved since.", [], true)] };
    const out = [];
    Object.keys(now.indices).forEach((key) => {
      const label = key === "cad" ? "CAD" : "Robotics";
      const was = (expected.indices || {})[key] || { models: {}, boards: {} };
      const is = now.indices[key];
      const moved = [];
      Object.keys(is.models).forEach((id) => {
        const before = was.models[id];
        const after = is.models[id];
        if (!before) moved.push(`new: ${id} at #${after[0]} (${after[1]})`);
        else if (before[0] !== after[0] || Math.abs(before[1] - after[1]) >= 0.05) moved.push(`${id}: #${before[0]} -> #${after[0]}, ${before[1]} -> ${after[1]}`);
      });
      Object.keys(was.models).forEach((id) => { if (!is.models[id]) moved.push(`gone: ${id} (was #${was.models[id][0]})`); });
      out.push(item(`${label}: models' rank and index since the baseline`, !moved.length, `${Object.keys(is.models).length} models`, moved, true));
      const boardMoves = [];
      Object.keys(is.boards).forEach((id) => {
        const before = was.boards[id];
        const after = is.boards[id];
        if (!before) boardMoves.push(`new board: ${id}`);
        else if (JSON.stringify(before) !== JSON.stringify(after)) boardMoves.push(`${id}: models ${before[0]} -> ${after[0]}, weight ${before[1]}% -> ${after[1]}%, held-out ${before[2]} -> ${after[2]}`);
      });
      Object.keys(was.boards).forEach((id) => { if (!is.boards[id]) boardMoves.push(`gone: ${id}`); });
      out.push(item(`${label}: boards' size, weight and held-out accuracy since the baseline`, !boardMoves.length, "", boardMoves, true));
      const factMoves = [];
      const beforeFacts = (expected.facts || {})[key] || {};
      Object.keys(now.facts[key]).forEach((name) => {
        if (JSON.stringify(beforeFacts[name]) !== JSON.stringify(now.facts[key][name])) factMoves.push(`${name}: ${beforeFacts[name]} -> ${now.facts[key][name]}`);
      });
      out.push(item(`${label}: numbers quoted in the text since the baseline`, !factMoves.length, "", factMoves, true));
    });
    const rowMoves = [];
    if (!expected.ledger) rowMoves.push("The baseline predates row tracking: save it again.");
    else Object.keys(now.ledger).forEach((id) => {
      const was = expected.ledger[id] || {};
      const is = now.ledger[id];
      Object.keys(is).forEach((key) => {
        if (!was[key]) { rowMoves.push(`${id}: new row ${key}`); return; }
        const changed = Object.keys(Object.assign({}, was[key], is[key])).filter((field) => was[key][field] !== is[key][field])
          .map((field) => `${field} ${was[key][field] === undefined ? "-" : was[key][field]} -> ${is[key][field] === undefined ? "-" : is[key][field]}`);
        if (changed.length) rowMoves.push(`${id}: ${key}: ${changed.join(", ")}`);
      });
      Object.keys(was).forEach((key) => { if (!is[key]) rowMoves.push(`${id}: row gone ${key}`); });
    });
    out.unshift(item("Ledger rows since the baseline (after a raw refresh, this is what the boards changed)", !rowMoves.length,
      `${Object.keys(now.ledger).length} tables`, rowMoves, true));
    return { snapshot: now, items: out };
  }

  root.phailChecks = {
    data: dataChecks,
    formulas: formulaChecks,
    explanations: explanationChecks,
    text: textChecks,
    pages: pageChecks,
    scripts: scriptChecks,
    changes: changeChecks,
    snapshot: snapshot
  };
})(typeof window !== "undefined" ? window : this);
