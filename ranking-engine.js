/* =============================================================================
   PhAIL - ranking engine (no data, no markup)
   -----------------------------------------------------------------------------
   Turns the ledger (tasks-data-new.js) into one cross-board index, using the
   knobs in ranking-data.js. ranking-app.js draws whatever this returns.

   The one rule it keeps from the rest of the site: raw numbers from different
   boards are NEVER added or averaged together (except in the "naive" method,
   which exists to show why not). A board only ever says "on this board, A did
   better than B, by this much relative to its own noise". Those within-board
   comparisons are pooled with a Bradley-Terry model - the same maths behind
   Chatbot Arena and RoboArena's own leaderboard - which copes with the real
   problem: no two models were run on the same set of boards.

   Steps, in the order build() runs them:
     1. boards    one per benchmark-run table; paper tables pooled per benchmark
     2. outcomes  every pair on a board -> P(A beats B) = Phi(delta / noise),
                  so a gap inside the board's sampling noise counts as ~a tie
     3. weights   board weight = difficulty x family share x evidence, split
                  evenly over each model's opponents on that board, so a
                  48-model board does not outvote a 9-model one by sheer size
     4. fit       Bradley-Terry strengths by minorise-maximise, with a weak tie
                  against a fixed reference so single-board models stay finite
     5. index     expected win rate against the rest of the field, 0-100
     6. checks    leave-one-board-out ranges, held-out pair accuracy, and
                  Kendall tau between every two boards

   Written to run in the browser and in Node 10 (for checking the numbers), so
   no optional chaining, no flatMap.
   ========================================================================== */

(function (root) {
  /* Abramowitz & Stegun 7.1.26 - plenty for turning a z-score into a win share. */
  function erf(x) {
    const sign = x < 0 ? -1 : 1;
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return sign * y;
  }
  function phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

  function clamp(value, low, high) { return Math.min(high, Math.max(low, value)); }

  /* Standard error of one published value. Percent-style boards: a binomial
     error at the board's trial count, with p held away from 0 and 1 so a flat
     zero still carries some doubt. Elo-style boards publish their own sd. */
  function standardError(value, row, board) {
    if (board.scale === "elo") return typeof row.sd === "number" ? row.sd : board.eloSd || 30;
    if (typeof row.se === "number") return row.se;  /* a board's own published interval, when it gives one */
    const p = clamp(value / 100, 0.02, 0.98);
    return 100 * Math.sqrt(p * (1 - p) / board.trials);
  }

  /* A board may set `minTasks`: an entry that ran fewer of its tasks stays in
     the ledger but not in the index (RoboChallenge counts unrun tasks as 0). */
  function eligible(row, setup) {
    return !(setup && setup.minTasks && typeof row.tasks === "number" && row.tasks < setup.minTasks);
  }

  function primaryValue(row, key) {
    const value = row[key];
    return typeof value === "number" ? value : null;
  }

  /* --- 1. boards ------------------------------------------------------------
     Returns [{ id, label, track, provenance, family, scale, trials, rows }]
     where rows holds ONE entry per model: the best entry that model has on the
     board, which is what a leaderboard shows anyway.                          */
  function collectBoards(db, config, opts) {
    const agentSet = new Set(config.agents || []);
    const keepModel = (id) => opts.agents !== false || !agentSet.has(id);
    const boards = [];

    const bestRows = (rows, valueOf, setup) => {
      const best = new Map();
      rows.forEach((row) => {
        if (!keepModel(row.model) || !eligible(row, setup)) return;
        const value = valueOf(row);
        if (value === null || Number.isNaN(value)) return;
        const current = best.get(row.model);
        if (!current || value > current.value) best.set(row.model, { model: row.model, value: value, row: row });
      });
      return Array.from(best.values()).sort((a, b) => b.value - a.value);
    };

    db.resultGroups.forEach((group) => {
      if (group.provenance !== "benchmark") return;
      const setup = config.boards[group.id];
      if (!setup) return;
      boards.push({
        id: group.id,
        label: setup.label,
        group: group,
        track: group.track,
        provenance: "benchmark",
        family: setup.family || group.id,
        scale: setup.scale || "percent",
        trials: setup.trials,
        eloSd: setup.eloSd,
        metric: setup.metric || group.primary,
        rows: bestRows(group.rows, (row) => primaryValue(row, setup.metric || group.primary), setup),
        leftOut: setup.minTasks ? group.rows.filter((row) => keepModel(row.model) && !eligible(row, setup)).length : 0,
        minTasks: setup.minTasks
      });
    });

    /* Paper tables (self-reported and third-party) are pooled per benchmark:
       LIBERO is reported in six places, each with one or a handful of rows. */
    if (opts.evidence === "all") {
      const pooled = new Map();
      db.resultGroups.forEach((group) => {
        if (group.provenance !== "model" && group.provenance !== "thirdParty") return;
        if (!group.primary || (config.paper.exclude || []).indexOf(group.benchmark) !== -1) return;
        if (config.tasks && config.tasks.indexOf(group.task) === -1) return;  /* this index's domain only */
        if (!pooled.has(group.benchmark)) pooled.set(group.benchmark, []);
        pooled.get(group.benchmark).push(group);
      });
      pooled.forEach((groups, benchmark) => {
        const allRows = [];
        groups.forEach((group) => group.rows.forEach((row) => allRows.push(Object.assign({ provenanceOfRow: group.provenance, groupOfRow: group }, row))));
        const meta = (db.benchmarks || []).filter((item) => item.id === benchmark)[0] || {};
        const thirdPartyOnly = groups.every((group) => group.provenance === "thirdParty");
        boards.push({
          id: "paper:" + benchmark,
          label: (meta.name || benchmark) + " (papers)",
          group: groups[0],
          groups: groups,
          track: groups[0].track,
          provenance: thirdPartyOnly ? "thirdParty" : "model",
          family: "paper:" + benchmark,
          scale: "percent",
          trials: config.paper.trials,
          assumedTrials: true,
          metric: groups[0].primary,
          rows: bestRows(allRows, (row) => primaryValue(row, groups[0].primary))
        });
      });
    }

    return boards.filter((board) => {
      if (opts.track && opts.track !== "all" && board.track !== opts.track) return false;
      if (opts.exclude && opts.exclude === board.id) return false;
      return board.rows.length >= 2;
    });
  }

  /* --- 3. weights ----------------------------------------------------------- */
  function weighBoards(boards, config, opts) {
    const familyCount = new Map();
    boards.forEach((board) => familyCount.set(board.family, (familyCount.get(board.family) || 0) + 1));
    boards.forEach((board) => {
      const best = board.rows[0].value;
      board.best = best;
      board.difficulty = board.scale === "elo"
        ? config.neutralDifficulty
        : clamp(1 - best / 100, config.minDifficulty, 1);
      board.share = 1 / familyCount.get(board.family);
      board.evidence = config.evidenceWeight[board.provenance] || 0.5;
      board.weight = (opts.weighting === "equal" ? 1 : board.difficulty) * board.share * board.evidence;
    });
    const total = boards.reduce((sum, board) => sum + board.weight, 0) || 1;
    boards.forEach((board) => { board.weightShare = board.weight / total; });
    return boards;
  }

  /* --- 2. outcomes ----------------------------------------------------------- */
  function winShare(a, b, board) {
    const noise = Math.sqrt(Math.pow(standardError(a.value, a.row, board), 2) + Math.pow(standardError(b.value, b.row, board), 2));
    return phi((a.value - b.value) / (noise || 1));
  }

  function clearOrder(a, b, board) {
    const noise = Math.sqrt(Math.pow(standardError(a.value, a.row, board), 2) + Math.pow(standardError(b.value, b.row, board), 2));
    return Math.abs(a.value - b.value) > noise;
  }

  /* --- 4. Bradley-Terry fit ----------------------------------------------------
     Hunter (2004) minorise-maximise updates, with fractional wins. The weak tie
     against a reference player of strength 1 (weight `prior`) is what keeps a
     model that lost every comparison it was in at a finite, low strength.     */
  function fitStrengths(models, boards, prior) {
    const index = new Map();
    models.forEach((id, i) => index.set(id, i));
    const n = models.length;
    const wins = new Float64Array(n).fill(prior / 2);
    const pairs = [];
    boards.forEach((board) => {
      const k = board.rows.length;
      const perPair = board.weight / (k - 1);
      for (let x = 0; x < k; x += 1) {
        for (let y = x + 1; y < k; y += 1) {
          const a = board.rows[x];
          const b = board.rows[y];
          const share = winShare(a, b, board);
          const i = index.get(a.model);
          const j = index.get(b.model);
          wins[i] += perPair * share;
          wins[j] += perPair * (1 - share);
          pairs.push([i, j, perPair]);
        }
      }
    });

    let strength = new Float64Array(n).fill(1);
    for (let iteration = 0; iteration < 4000; iteration += 1) {
      const denominator = new Float64Array(n);
      for (let i = 0; i < n; i += 1) denominator[i] = prior / (strength[i] + 1);
      for (let p = 0; p < pairs.length; p += 1) {
        const pair = pairs[p];
        const d = pair[2] / (strength[pair[0]] + strength[pair[1]]);
        denominator[pair[0]] += d;
        denominator[pair[1]] += d;
      }
      let change = 0;
      const next = new Float64Array(n);
      for (let i = 0; i < n; i += 1) {
        next[i] = wins[i] / denominator[i];
        change = Math.max(change, Math.abs(Math.log(next[i] / strength[i])));
      }
      strength = next;
      if (change < 1e-9) break;
    }
    const result = new Map();
    models.forEach((id, i) => result.set(id, strength[i]));
    return result;
  }

  /* --- 5. index --------------------------------------------------------------- */
  function winRateIndex(strengths) {
    const ids = Array.from(strengths.keys());
    const out = new Map();
    ids.forEach((id) => {
      const s = strengths.get(id);
      let sum = 0;
      ids.forEach((other) => { if (other !== id) sum += s / (s + strengths.get(other)); });
      out.set(id, ids.length > 1 ? 100 * sum / (ids.length - 1) : 50);
    });
    return out;
  }

  /* The two methods the index is compared against in the meeting. Neither is
     used for the headline number; both are here to be argued with. */
  function percentileIndex(models, boards) {
    const totals = new Map();
    models.forEach((id) => totals.set(id, { sum: 0, weight: 0 }));
    boards.forEach((board) => {
      const k = board.rows.length;
      board.rows.forEach((a) => {
        let share = 0;
        board.rows.forEach((b) => { if (a !== b) share += winShare(a, b, board); });
        const entry = totals.get(a.model);
        entry.sum += board.weight * share / (k - 1);
        entry.weight += board.weight;
      });
    });
    const out = new Map();
    totals.forEach((entry, id) => out.set(id, entry.weight ? 100 * entry.sum / entry.weight : null));
    return out;
  }

  function naiveIndex(models, boards) {
    const totals = new Map();
    models.forEach((id) => totals.set(id, { sum: 0, weight: 0 }));
    boards.forEach((board) => {
      if (board.scale === "elo") return;
      board.rows.forEach((row) => {
        const entry = totals.get(row.model);
        entry.sum += board.weight * row.value;
        entry.weight += board.weight;
      });
    });
    const out = new Map();
    totals.forEach((entry, id) => out.set(id, entry.weight ? entry.sum / entry.weight : null));
    return out;
  }

  function modelsOn(boards) {
    const seen = new Set();
    boards.forEach((board) => board.rows.forEach((row) => seen.add(row.model)));
    return Array.from(seen);
  }

  function scoreBoards(boards, config, method) {
    const models = modelsOn(boards);
    if (method === "percentile") return { models: models, index: percentileIndex(models, boards), strengths: null };
    if (method === "naive") return { models: models, index: naiveIndex(models, boards), strengths: null };
    const strengths = fitStrengths(models, boards, config.prior);
    return { models: models, index: winRateIndex(strengths), strengths: strengths };
  }

  /* --- 6. checks ---------------------------------------------------------------- */
  function kendallTau(pairs) {
    let concordant = 0;
    let discordant = 0;
    let tiesA = 0;
    let tiesB = 0;
    for (let i = 0; i < pairs.length; i += 1) {
      for (let j = i + 1; j < pairs.length; j += 1) {
        const da = pairs[i][0] - pairs[j][0];
        const db = pairs[i][1] - pairs[j][1];
        if (da === 0 && db === 0) continue;
        if (da === 0) { tiesA += 1; continue; }
        if (db === 0) { tiesB += 1; continue; }
        if (da * db > 0) concordant += 1; else discordant += 1;
      }
    }
    const denominator = Math.sqrt((concordant + discordant + tiesA) * (concordant + discordant + tiesB));
    return denominator ? (concordant - discordant) / denominator : null;
  }

  function boardAgreement(boards, minShared) {
    const matrix = boards.map((a) => boards.map((b) => {
      if (a === b) return { tau: 1, shared: a.rows.length };
      const values = new Map(b.rows.map((row) => [row.model, row.value]));
      const shared = a.rows.filter((row) => values.has(row.model)).map((row) => [row.value, values.get(row.model)]);
      return { tau: shared.length >= minShared ? kendallTau(shared) : null, shared: shared.length };
    }));
    return matrix;
  }

  /* --- capabilities ------------------------------------------------------------
     The same fit, run once per capability axis over the sub-scores that measure
     it. Only RoboDojo publishes per-capability scores for every model, so most
     axes are one board wide - the table says so rather than hiding it.        */
  function capabilityBoards(db, config, opts, capability) {
    const agentSet = new Set(config.agents || []);
    const boards = [];
    capability.sources.forEach((source) => {
      const group = db.resultGroups.filter((item) => item.id === source.board)[0];
      if (!group) return;
      const valueOf = (row) => {
        if (typeof source.dim === "number") return row.d ? row.d[source.dim] : null;
        if (source.min) {
          const values = source.min.map((key) => row[key]).filter((value) => typeof value === "number");
          return values.length === source.min.length ? Math.min.apply(null, values) : null;
        }
        const key = source.field || (config.boards[group.id] && config.boards[group.id].metric) || group.primary;
        return typeof row[key] === "number" ? row[key] : null;
      };
      const best = new Map();
      group.rows.forEach((row) => {
        if (opts.agents === false && agentSet.has(row.model)) return;
        if (!eligible(row, config.boards[group.id])) return;
        const value = valueOf(row);
        if (value === null || value === undefined) return;
        const current = best.get(row.model);
        if (!current || value > current.value) best.set(row.model, { model: row.model, value: value, row: row });
      });
      const setup = config.boards[group.id] || {};
      const rows = Array.from(best.values()).sort((a, b) => b.value - a.value);
      if (rows.length < 2) return;
      boards.push({
        id: capability.id + ":" + group.id,
        label: setup.label || group.id,
        track: group.track,
        provenance: group.provenance,
        family: setup.family || group.id,
        scale: setup.scale || "percent",
        trials: source.trials || setup.trials,
        eloSd: setup.eloSd,
        rows: rows
      });
    });
    return weighBoards(boards, config, opts);
  }

  /* --- entry point ------------------------------------------------------------- */
  function build(db, config, options) {
    const opts = Object.assign({ track: "all", evidence: "benchmark", weighting: "difficulty", agents: true, method: "bt" }, options || {});
    const boards = weighBoards(collectBoards(db, config, opts), config, opts);
    const main = scoreBoards(boards, config, opts.method);

    /* leave one board out: range of index and rank for every model, and - for
       the pairwise method - how well the other boards predict the one left out */
    const loo = boards.map((left) => {
      const rest = weighBoards(collectBoards(db, config, Object.assign({}, opts, { exclude: left.id })), config, opts);
      const scored = scoreBoards(rest, config, opts.method);
      let correct = 0;
      let total = 0;
      if (scored.strengths) {
        for (let x = 0; x < left.rows.length; x += 1) {
          for (let y = x + 1; y < left.rows.length; y += 1) {
            const a = left.rows[x];
            const b = left.rows[y];
            if (!scored.strengths.has(a.model) || !scored.strengths.has(b.model)) continue;
            if (!clearOrder(a, b, left)) continue;
            total += 1;
            if (scored.strengths.get(a.model) > scored.strengths.get(b.model)) correct += 1;
          }
        }
      }
      left.heldOut = total ? { accuracy: correct / total, pairs: total } : null;
      return scored;
    });

    const ranked = main.models
      .filter((id) => main.index.get(id) !== null)
      .sort((a, b) => main.index.get(b) - main.index.get(a));
    const rankOf = new Map(ranked.map((id, i) => [id, i + 1]));

    const looRanks = loo.map((scored) => {
      const order = scored.models.filter((id) => scored.index.get(id) !== null)
        .sort((a, b) => scored.index.get(b) - scored.index.get(a));
      return new Map(order.map((id, i) => [id, i + 1]));
    });

    const entries = ranked.map((id) => {
      const onBoards = boards.filter((board) => board.rows.some((row) => row.model === id)).map((board) => {
        const position = board.rows.findIndex((row) => row.model === id);
        return { board: board, row: board.rows[position], rank: position + 1, of: board.rows.length };
      });
      const values = [main.index.get(id)];
      const ranks = [rankOf.get(id)];
      loo.forEach((scored, i) => {
        if (scored.index.has(id) && scored.index.get(id) !== null) {
          values.push(scored.index.get(id));
          ranks.push(looRanks[i].get(id));
        }
      });
      /* the model's index and rank with each board removed; null where the
         model is no longer ranked (it was only on that board) */
      const drops = boards.map((board, i) => {
        const has = loo[i].index.has(id) && loo[i].index.get(id) !== null;
        return { board: board.label, index: has ? loo[i].index.get(id) : null, rank: has ? looRanks[i].get(id) : null };
      });
      return {
        id: id,
        index: main.index.get(id),
        rank: rankOf.get(id),
        range: [Math.min.apply(null, values), Math.max.apply(null, values)],
        rankRange: [Math.min.apply(null, ranks), Math.max.apply(null, ranks)],
        drops: drops,
        boards: onBoards,
        coverage: onBoards.length,
        agent: (config.agents || []).indexOf(id) !== -1
      };
    });

    const capabilities = (config.capabilities || []).map((capability) => {
      const capBoards = capabilityBoards(db, config, opts, capability);
      const scored = capBoards.length ? scoreBoards(capBoards, config, opts.method === "naive" ? "percentile" : opts.method) : { index: new Map() };
      return { capability: capability, boards: capBoards, index: scored.index };
    });

    return {
      options: opts,
      boards: boards,
      entries: entries,
      strengths: main.strengths,
      agreement: boardAgreement(boards, config.minSharedForTau || 4),
      capabilities: capabilities
    };
  }

  const api = { build: build, kendallTau: kendallTau, phi: phi };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.phailRankingEngine = api;
})(typeof window !== "undefined" ? window : this);
