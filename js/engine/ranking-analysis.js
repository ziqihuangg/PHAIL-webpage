/* =============================================================================
   PhAIL - ranking analysis (no data, no markup)
   -----------------------------------------------------------------------------
   Every number the Robotics and CAD Index pages use to EXPLAIN the index:
   worked examples, counts, agreement, pooled-vs-single checks, gaps. It calls
   only js/engine/ranking-engine.js for the maths, so an explanation can never
   use a different formula from the index it explains. js/pages/ranking.js
   formats what this returns; check.html tests it.

   explain(db, config, defaults) runs once per page load at the default
   settings, so the explanations do not move when a reader flips a switch.
   ========================================================================== */

(function (root) {
  const E = root.phailRankingEngine || (typeof require === "function" ? require("./ranking-engine.js") : null);

  /* How the page reads a result. The HTML quotes these through [data-m], so
     "red is below 60%" changes when this does. */
  const reading = {
    weakHeldOut: 0.6,      /* held-out accuracy below this is shown in red */
    sameAccuracy: 0.03,    /* pooled and single within this = "about the same accuracy" */
    morePairs: 1.1,        /* pooled judges at least this many times the pairs = "more pairs" */
    beyondChance: 2,       /* |tau| at least this many chance levels = "beyond chance" */
    topForSpread: 15,      /* widest error bar is looked for in the top N */
    saturated: 0.1         /* a paper board with difficulty under this "barely counts" */
  };

  const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

  /* the model on most boards, best-ranked among those: every worked example uses it */
  function pivotOf(entries) {
    return entries.slice().sort((a, b) => b.coverage - a.coverage || a.rank - b.rank)[0];
  }

  /* --- step 3: noise --------------------------------------------------------- */
  function noiseRows(boards) {
    return boards.filter((board) => board.scale !== "elo").map((board) => {
      const middle = board.rows[Math.floor(board.rows.length / 2)];
      const se = E.standardError(middle.value, middle.row, board);
      const sigma = Math.SQRT2 * se;
      return {
        board: board,
        published: typeof middle.row.se === "number",   /* the board's own interval, not the trial count */
        median: middle.value,
        sigma: sigma,
        pOnePoint: E.phi(1 / sigma),
        gapFor98: 2 * sigma
      };
    });
  }

  function noiseExample(boards) {
    const board = boards.filter((item) => item.track === "Real" && item.scale !== "elo")[0];
    if (!board || board.rows.length < 2) return null;
    const a = board.rows[0];
    const b = board.rows[1];
    const sigma = E.pairNoise(a, b, board);
    return { board: board, a: a, b: b, sigma: sigma, z: (a.value - b.value) / sigma, p: E.winShare(a, b, board) };
  }

  function eloExample(boards) {
    const board = boards.filter((item) => item.scale === "elo")[0];
    if (!board || board.rows.length < 2) return null;
    const a = board.rows[0];
    const b = board.rows[1];
    const gap = a.value - b.value;
    const z = gap / E.pairNoise(a, b, board);
    return {
      board: board, a: a, b: b, gap: gap,
      sdA: E.standardError(a.value, a.row, board),
      sdB: E.standardError(b.value, b.row, board),
      preferred: E.eloPreferred(gap), z: z, p: E.phi(z),
      /* the rules of thumb printed under the Elo formula */
      thumb: [0, 100, 400].map((points) => ({ gap: points, p: E.eloPreferred(points) }))
    };
  }

  /* --- step 5: pairs --------------------------------------------------------- */
  function pairRows(boards) {
    return boards.map((board) => {
      const k = board.rows.length;
      return { board: board, k: k, pairs: k * (k - 1) / 2, perPair: board.weight / (k - 1), weight: board.weight };
    });
  }

  /* --- step 6: one chain of comparisons between two models that never met ---- */
  function chainExample(entries) {
    const boardsOf = new Map(entries.map((entry) => [entry.id, new Set(entry.boards.map((item) => item.board.id))]));
    const shares = (a, c) => Array.from(boardsOf.get(a)).some((id) => boardsOf.get(c).has(id));
    const first = entries.filter((entry) => entry.coverage === 1)[0];
    const other = first && entries.filter((entry) => entry.id !== first.id && !shares(first.id, entry.id))[0];
    const bridge = other && entries.filter((entry) => shares(first.id, entry.id) && shares(other.id, entry.id) && entry.id !== first.id && entry.id !== other.id)
      .sort((a, b) => b.coverage - a.coverage)[0];
    if (!bridge) return null;
    const on = (entry, peer) => entry.boards.filter((item) => boardsOf.get(peer.id).has(item.board.id))[0];
    const valueOn = (entry, item) => entry.boards.filter((own) => own.board.id === item.board.id)[0].row.value;
    const firstBoard = on(first, bridge);
    const otherBoard = on(other, bridge);
    return {
      first: first, other: other, bridge: bridge, firstBoard: firstBoard, otherBoard: otherBoard,
      bridgeOnFirst: valueOn(bridge, firstBoard), bridgeOnOther: valueOn(bridge, otherBoard)
    };
  }

  /* --- step 7: the index as win chances ---------------------------------------- */
  function indexExample(entries, strengths, pivot) {
    if (!pivot || !strengths) return null;
    const chance = (a, b) => strengths.get(a) / (strengths.get(a) + strengths.get(b));
    const others = entries.filter((entry) => entry.id !== pivot.id);
    const above = others.filter((entry) => entry.index < pivot.index).length;
    const pick = (list) => list.map((entry) => ({ entry: entry, chance: chance(pivot.id, entry.id) }));
    return {
      pivot: pivot,
      opponents: others.length,
      above: above,
      /* check: the index is the mean of these chances, times 100 */
      meanChance: others.length ? sum(others, (entry) => chance(pivot.id, entry.id)) / others.length : null,
      picks: pick([others[0], others[Math.floor(others.length / 2)], others[others.length - 1]]),
      spread: pick([0, 0.25, 0.5, 0.75, 1].map((q) => others[Math.min(others.length - 1, Math.round(q * (others.length - 1)))])),
      top: entries[0],
      last: entries[entries.length - 1]
    };
  }

  /* --- step 8: error bars -------------------------------------------------------- */
  function doubtExample(entries) {
    const widest = entries.slice(0, reading.topForSpread).map((entry) => ({ entry: entry, width: entry.range[1] - entry.range[0] }))
      .sort((a, b) => b.width - a.width)[0];
    const meanWidth = (list) => sum(list, (item) => item.range[1] - item.range[0]) / (list.length || 1);
    const oneBoard = entries.filter((item) => item.coverage === 1);
    const several = entries.filter((item) => item.coverage >= 2);
    return {
      widest: widest ? widest.entry : null,
      oneBoard: oneBoard.length, oneBoardWidth: meanWidth(oneBoard),
      several: several.length, severalWidth: meanWidth(several)
    };
  }

  /* --- board agreement: tau, pair by pair ------------------------------------------
     C, D and one-sided ties are counted here for the table; tau itself comes
     from the engine, so the table reproduces the matrix. */
  function tauPairs(boards, minShared) {
    const rows = [];
    boards.forEach((a, i) => boards.forEach((b, j) => {
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
      const tau = n >= minShared ? E.kendallTau(shared) : null;
      const chance = n >= minShared ? E.chanceLevel(n) : null;
      rows.push({ a: a.label, b: b.label, trackA: a.track, trackB: b.track, n: n, pairs: n * (n - 1) / 2, same: same, opposite: opposite, ties: ties,
        tau: tau, chance: chance, beyond: tau !== null && Math.abs(tau) >= reading.beyondChance * chance });
    }));
    rows.sort((x, y) => (y.tau === null ? -2 : y.tau) - (x.tau === null ? -2 : x.tau) || y.n - x.n);
    return rows;
  }

  /* --- why an index: coverage, noise, pooled vs single ------------------------------ */
  function coverage(entries) {
    const onBoards = new Map(entries.map((entry) => [entry.id, new Set(entry.boards.map((item) => item.board.id))]));
    const ids = entries.map((entry) => entry.id);
    let pairs = 0;
    let met = 0;
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        pairs += 1;
        const other = onBoards.get(ids[j]);
        if (Array.from(onBoards.get(ids[i])).some((id) => other.has(id))) met += 1;
      }
    }
    return { models: ids.length, pairs: pairs, met: met, never: pairs - met, single: entries.filter((entry) => entry.coverage === 1).length,
      multi: entries.filter((entry) => entry.coverage >= 2).length };
  }

  /* going down each board's own order, how many steps are smaller than the noise */
  function neighbourTies(boards) {
    let steps = 0;
    let ties = 0;
    boards.forEach((board) => {
      for (let i = 0; i + 1 < board.rows.length; i += 1) {
        steps += 1;
        if (!E.clearOrder(board.rows[i], board.rows[i + 1], board)) ties += 1;
      }
    });
    return { steps: steps, ties: ties };
  }

  /* pooled index (the engine's held-out check) against the single other board
     that shares most models with the left-out one, on the same clear pairs */
  function pooledVsSingle(boards) {
    const rows = boards.map((board) => {
      const clear = [];
      for (let i = 0; i < board.rows.length; i += 1) {
        for (let j = i + 1; j < board.rows.length; j += 1) {
          if (E.clearOrder(board.rows[i], board.rows[j], board)) clear.push([board.rows[i], board.rows[j]]);
        }
      }
      const singles = boards.filter((other) => other !== board).map((other) => {
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
      const row = { board: board, clear: clear.length, pooled: pooled, single: singles[0] || null, verdict: null };
      if (!pooled) row.verdict = "unchecked";
      else if (!row.single) row.verdict = "nosingle";
      else {
        row.pooledAcc = pooled.correct / pooled.judged;
        row.singleAcc = row.single.correct / row.single.judged;
        row.more = pooled.judged / row.single.judged;
        row.verdict = row.pooledAcc < reading.weakHeldOut && row.singleAcc < reading.weakHeldOut ? "poor"
          : row.pooledAcc - row.singleAcc >= reading.sameAccuracy ? "higher"
          : row.singleAcc - row.pooledAcc >= reading.sameAccuracy ? "lower" : "same";
      }
      return row;
    });
    const both = rows.filter((row) => row.pooled && row.single);
    const total = {
      boards: both.length,
      pooledJudged: sum(both, (row) => row.pooled.judged), pooledCorrect: sum(both, (row) => row.pooled.correct),
      singleJudged: sum(both, (row) => row.single.judged), singleCorrect: sum(both, (row) => row.single.correct)
    };
    total.pooledAcc = total.pooledJudged ? total.pooledCorrect / total.pooledJudged : null;
    total.singleAcc = total.singleJudged ? total.singleCorrect / total.singleJudged : null;
    total.agreePoorly = total.pooledAcc !== null && total.pooledAcc < total.singleAcc - reading.sameAccuracy;
    return { rows: rows, total: total };
  }

  /* --- sim boards against real boards --------------------------------------------- */
  function simReal(db, config, defaults, tauRows, minShared) {
    const kinds = [["Sim", "Sim"], ["Sim", "Real"], ["Real", "Real"]];
    const kindOf = (row) => [row.trackA, row.trackB].sort().join("-");
    const groups = kinds.map(([x, y]) => {
      const rows = tauRows.filter((row) => kindOf(row) === [x, y].sort().join("-"));
      return { x: x, y: y, measured: rows.filter((row) => row.tau !== null), unmeasured: rows.filter((row) => row.tau === null).length };
    });
    const sim = E.build(db, config, Object.assign({}, defaults, { track: "Sim" }));
    const real = E.build(db, config, Object.assign({}, defaults, { track: "Real" }));
    const simIndex = new Map(sim.entries.map((entry) => [entry.id, entry.index]));
    const realEntry = new Map(real.entries.map((entry) => [entry.id, entry]));
    const shared = Array.from(simIndex.keys()).filter((id) => realEntry.has(id));
    const tau = shared.length >= minShared ? E.kendallTau(shared.map((id) => [simIndex.get(id), realEntry.get(id).index])) : null;
    const chance = shared.length >= minShared ? E.chanceLevel(shared.length) : null;
    const gaps = shared.map((id) => ({ id: id, sim: simIndex.get(id), real: realEntry.get(id).index, boards: realEntry.get(id).boards.map((item) => item.board.label) }))
      .sort((x, y) => Math.abs(y.real - y.sim) - Math.abs(x.real - x.sim)).slice(0, 3);
    return { groups: groups, shared: shared.length, tau: tau, chance: chance,
      beyond: tau !== null && Math.abs(tau) >= reading.beyondChance * chance, gaps: gaps,
      negatives: tauRows.filter((row) => row.tau !== null && row.tau < 0) };
  }

  /* --- strengths --------------------------------------------------------------------- */
  function strengthStats(entries, strengths) {
    const values = entries.map((entry) => strengths.get(entry.id));
    const high = Math.max.apply(null, values);
    const low = Math.min.apply(null, values);
    return { high: high, low: low, ratio: high / low, belowOne: values.filter((value) => value < 1).length, n: values.length };
  }

  /* The fitted strength of one model balances its own update rule: recompute
     the update from the board rows and it returns the same strength. */
  function strengthBalance(boards, strengths, config, pivot) {
    const prior = config.prior;
    const si = strengths.get(pivot.id);
    let wins = 0;
    let exposure = 0;
    const perBoard = [];
    boards.forEach((board) => {
      const mine = board.rows.filter((item) => item.model === pivot.id)[0];
      if (!mine) return;
      const perPair = board.weight / (board.rows.length - 1);
      let boardWins = 0;
      let boardExposure = 0;
      board.rows.forEach((other) => {
        if (other === mine) return;
        boardWins += perPair * E.winShare(mine, other, board);
        boardExposure += perPair / (si + strengths.get(other.model));
      });
      wins += boardWins;
      exposure += boardExposure;
      perBoard.push({ board: board, opponents: board.rows.length - 1, wins: boardWins, exposure: boardExposure });
    });
    const top = prior / 2 + wins;
    const bottom = prior / (si + 1) + exposure;
    return { pivot: pivot, prior: prior, strength: si, wins: wins, exposure: exposure, top: top, bottom: bottom, update: top / bottom, perBoard: perBoard };
  }

  /* --- model gaps: raw published scores, not the index ------------------------------- */
  function gapRows(db, config) {
    const agentSet = new Set(config.agents || []);
    const groupOf = (id) => db.resultGroups.filter((group) => group.id === id)[0];
    const best = (id, valueOf) => { const group = groupOf(id); return E.bestPerModel(group ? group.rows : [], valueOf, group ? config.boards[group.id] : null); };
    const axisMedian = new Map();
    (config.gaps || []).forEach((gap) => {
      if (gap.kind !== "axis") return;
      const values = best(gap.board, (row) => (row.d ? row.d[gap.dim] : null)).filter((entry) => !agentSet.has(entry.model)).map((entry) => entry.value);
      if (values.length) axisMedian.set(gap, E.median(values));
    });
    const medians = Array.from(axisMedian.values());
    return (config.gaps || []).map((gap) => {
      if (gap.kind === "level") {
        const fieldOf = (id) => (gap.fields ? gap.fields[id] : gap.field);
        const cells = gap.boards.map((id) => {
          const rows = best(id, (row) => row[fieldOf(id)]);
          return rows.length ? { id: id, rows: rows.length, best: rows[0], median: E.median(rows.map((entry) => entry.value)), field: fieldOf(id), fails: Math.round(100 - rows[0].value) } : null;
        }).filter(Boolean);
        return cells.length ? { gap: gap, cells: cells, successLike: gap.boards.every((id) => fieldOf(id) === "success") } : null;
      }
      if (gap.kind === "axis") {
        const rows = best(gap.board, (row) => (row.d ? row.d[gap.dim] : null));
        const policies = rows.filter((entry) => !agentSet.has(entry.model));
        if (!policies.length) return null;
        const agent = rows.filter((entry) => agentSet.has(entry.model))[0];
        const median = axisMedian.get(gap);
        return { gap: gap, top: policies[0], policies: policies.length, below: policies.filter((entry) => entry.value < gap.low).length,
          agent: agent && agent.value > policies[0].value ? agent : null, median: median,
          strongest: median === Math.max.apply(null, medians), weakest: median === Math.min.apply(null, medians) };
      }
      if (gap.kind === "drop") {
        const isNum = (value) => typeof value === "number" && !Number.isNaN(value);
        const rows = best(gap.board, (row) => (isNum(row[gap.from]) && isNum(row[gap.to]) ? row[gap.to] : null))
          .map((entry) => ({ model: entry.model, from: entry.row[gap.from], to: entry.row[gap.to] }));
        if (!rows.length) return null;
        return { gap: gap, rows: rows.length, top: rows[0], halved: rows.filter((entry) => entry.to < entry.from / 2).length,
          worst: rows.reduce((a, b) => (b.from - b.to > a.from - a.to ? b : a)),
          medianFrom: E.median(rows.map((entry) => entry.from)), medianTo: E.median(rows.map((entry) => entry.to)) };
      }
      if (gap.kind === "arms") {
        const isNum = (value) => typeof value === "number" && !Number.isNaN(value);
        const rows = best(gap.board, (row) => (gap.fields.every((key) => isNum(row[key])) ? Math.min.apply(null, gap.fields.map((key) => row[key])) : null))
          .map((entry) => ({ model: entry.model, min: entry.value, max: Math.max.apply(null, gap.fields.map((key) => entry.row[key])), row: entry.row }));
        if (!rows.length) return null;
        const weakCount = gap.fields.map((key) => rows.filter((entry) => entry.max > 0 && entry.row[key] === entry.min).length);
        const weakIndex = weakCount.indexOf(Math.max.apply(null, weakCount));
        return { gap: gap, rows: rows.length, top: rows[0], zero: rows.filter((entry) => entry.min === 0).length,
          weakLabel: gap.labels[weakIndex], weakCount: weakCount[weakIndex],
          medianMin: E.median(rows.map((entry) => entry.min)), medianMax: E.median(rows.map((entry) => entry.max)) };
      }
      return null;
    });
  }

  /* --- capabilities: how many columns rest on one board ------------------------------- */
  function capabilitySummary(config) {
    const caps = config.capabilities || [];
    const boardsOf = (cap) => Array.from(new Set(cap.sources.map((source) => source.board)));
    const single = caps.filter((cap) => boardsOf(cap).length === 1);
    const byBoard = new Map();
    single.forEach((cap) => {
      const id = boardsOf(cap)[0];
      byBoard.set(id, (byBoard.get(id) || []).concat(cap.short));
    });
    return { total: caps.length, single: single.length, combined: caps.length - single.length, byBoard: byBoard };
  }

  /* --- entry point ---------------------------------------------------------------------- */
  function explain(db, config, defaults) {
    const base = E.build(db, config, defaults);
    const minShared = config.minSharedForTau || 4;
    const entries = base.entries;
    const pivot = pivotOf(entries);
    const withPapers = E.build(db, config, Object.assign({}, defaults, { evidence: "all" }));
    const saturated = withPapers.boards.filter((board) => board.provenance !== "benchmark" && board.scale !== "elo")
      .sort((a, b) => a.difficulty - b.difficulty)[0] || null;
    const tau = tauPairs(base.boards, minShared);
    const hasSimAndReal = base.boards.some((board) => board.track === "Sim") && base.boards.some((board) => board.track === "Real");
    return {
      base: base,
      minShared: minShared,
      pivot: pivot,
      results: sum(base.boards, (board) => board.rows.length),
      noise: noiseRows(base.boards),
      noiseExample: noiseExample(base.boards),
      elo: eloExample(base.boards),
      saturated: saturated,
      pairs: pairRows(base.boards),
      pairCount: sum(base.boards, (board) => board.rows.length * (board.rows.length - 1) / 2),
      chain: chainExample(entries),
      index: indexExample(entries, base.strengths, pivot),
      doubt: doubtExample(entries),
      tau: tau,
      coverage: coverage(entries),
      neighbours: neighbourTies(base.boards),
      pooled: pooledVsSingle(base.boards),
      simReal: hasSimAndReal ? simReal(db, config, defaults, tau, minShared) : null,
      strengths: base.strengths ? strengthStats(entries, base.strengths) : null,
      balance: base.strengths && pivot ? strengthBalance(base.boards, base.strengths, config, pivot) : null,
      gaps: gapRows(db, config),
      capabilities: capabilitySummary(config)
    };
  }

  /* --- facts: the numbers prose quotes, by name (js/common/facts.js) ------------------------
     Plain keys for the counts the pages use; `$` answers parametric keys
     such as heldOutPct:robochallenge-t30 or tau:robochallenge-t30/robodojo-real.
     Values are formatted the way the text prints them. */
  const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const word = (n) => WORDS[n] || n.toLocaleString("en");
  const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);
  const pct = (share) => `${Math.round(100 * share)}%`;
  const signed = (value) => (value >= 0 ? "+" : "−") + Math.abs(value).toFixed(2);
  const fixed = (value, digits) => Number(value).toFixed(digits === undefined ? 1 : digits);
  const trim = (value) => String(Number(Number(value).toFixed(3)));   /* 0.50 -> "0.5", 0.02 -> "0.02" */
  const ratioWord = (ratio) => ({ 0.5: "half", 1: "the same", 2: "twice", 3: "three times" })[ratio] || `${trim(ratio)} times`;

  function facts(result, db, config) {
    const base = result.base;
    const boards = base.boards;
    const entries = base.entries;
    const byId = new Map(boards.map((board) => [board.id, board]));
    const percent = boards.filter((board) => board.scale !== "elo");
    const hardest = percent.slice().sort((a, b) => b.difficulty - a.difficulty)[0];
    const heaviest = boards.slice().sort((a, b) => b.weightShare - a.weightShare)[0];
    const measured = result.tau.filter((row) => row.tau !== null);
    const positive = measured.filter((row) => row.tau > 0).map((row) => row.tau);
    const realPercent = result.noise.filter((item) => item.board.track === "Real")[0];
    const elo = boards.filter((board) => board.scale === "elo")[0];
    const models = new Map(db.models.map((model) => [model.id, model]));
    const evidence = config.evidenceWeight || {};
    const minShared = result.minShared;
    const flip = minShared > 1 ? 2 / (minShared * (minShared - 1) / 2) : null;
    const labelOf = (board) => board.label;
    const out = {
      models: entries.length,
      boards: boards.length,
      boardsWord: capital(word(boards.length)),
      results: result.results,
      multi: result.coverage.multi,
      single: result.coverage.single,
      pivotName: result.pivot ? (models.get(result.pivot.id) || { name: result.pivot.id }).name : "-",
      pivotCoverage: result.pivot ? result.pivot.coverage : 0,
      topIndexRound: entries.length ? Math.round(entries[0].index) : 0,
      weakHeldOutPct: pct(reading.weakHeldOut),
      minShared: minShared,
      minSharedWord: word(minShared),
      minSharedPairs: minShared * (minShared - 1) / 2,
      flipStep: flip === null ? "-" : fixed(flip, 2),
      tauSharing: result.tau.length,
      tauUnmeasured: result.tau.length - measured.length,
      tauPositiveMin: positive.length ? signed(Math.min.apply(null, positive)) : "-",
      tauPositiveMax: positive.length ? signed(Math.max.apply(null, positive)) : "-",
      paperTrials: config.paper ? config.paper.trials : "-",
      paperWeightWord: ratioWord(evidence.model / evidence.benchmark),
      evidenceRatioWord: ratioWord(evidence.benchmark / evidence.model),
      neutralDifficulty: trim(config.neutralDifficulty),
      minDifficulty: trim(config.minDifficulty),
      pMin: trim(E.constants.pMin),
      pMax: trim(E.constants.pMax),
      prior: trim(config.prior),
      agents: (config.agents || []).length,
      agentsWord: capital(word((config.agents || []).length)),
      sizeStated: entries.filter((entry) => typeof (models.get(entry.id) || {}).sizeB === "number").length,
      hardestName: hardest ? labelOf(hardest) : "-",
      hardestBestPct: hardest ? `${Math.round(hardest.best)}%` : "-",
      hardestD: hardest ? fixed(hardest.difficulty, 2) : "-",
      heaviestName: heaviest ? labelOf(heaviest) : "-",
      heaviestModels: heaviest ? heaviest.rows.length : 0,
      heaviestBestPct: heaviest ? `${fixed(heaviest.best)}%` : "-",
      heaviestSharePct: heaviest ? pct(heaviest.weightShare) : "-",
      saturatedName: result.saturated ? result.saturated.label.replace(/\s*\(papers\)$/, "") : "-",
      saturatedBestPct: result.saturated ? `${Math.round(result.saturated.best)}%` : "-",
      saturatedD: result.saturated ? fixed(result.saturated.difficulty, 2) : "-",
      onePointTrials: realPercent ? realPercent.board.trials.toLocaleString("en") : "-",
      onePointOdds: realPercent ? `${Math.round(100 * realPercent.pOnePoint)}/${100 - Math.round(100 * realPercent.pOnePoint)}` : "-",
      eloLevel: elo ? (Math.round(E.median(elo.rows.map((row) => row.value)) / 100) * 100).toLocaleString("en") : "-",
      pooledPct: result.pooled.total.pooledAcc === null ? "-" : pct(result.pooled.total.pooledAcc),
      singlePct: result.pooled.total.singleAcc === null ? "-" : pct(result.pooled.total.singleAcc),
      neverMetPct: result.coverage.pairs ? pct(result.coverage.never / result.coverage.pairs) : "-",
      modelPairs: result.coverage.pairs,
      neighbourTies: result.neighbours.ties,
      neighbourSteps: result.neighbours.steps,
      boardList: boards.map(labelOf).join(", "),
      /* quoted inside the printed formulas, as KaTeX macros (js/pages/ranking.js) */
      evidenceBenchmark: trim(evidence.benchmark),
      evidencePaper: trim(evidence.model),
      toleranceExponent: Math.round(Math.log10(E.constants.tolerance)),
      maxRounds: E.constants.maxRounds,
      phiOne: E.phi(1).toFixed(2),
      phiTwo: E.phi(2).toFixed(2),
      eloHundred: E.eloPreferred(100).toFixed(2),
      eloFourHundred: E.eloPreferred(400).toFixed(2)
    };
    /* parametric: name:board-id, or name:board-a/board-b for a pair of boards */
    out.$ = (key) => {
      const colon = key.indexOf(":");
      if (colon < 0) return undefined;
      const name = key.slice(0, colon);
      const arg = key.slice(colon + 1);
      const board = byId.get(arg);
      if (board) {
        if (name === "best") return fixed(board.best, board.scale === "elo" ? 0 : 1);
        if (name === "bestPct") return `${fixed(board.best)}%`;
        if (name === "bestRound") return Math.round(board.best);
        if (name === "rows") return board.rows.length;
        if (name === "trials") return board.trials ? board.trials.toLocaleString("en") : undefined;
        if (name === "d") return fixed(board.difficulty, 2);
        if (name === "weightPct") return pct(board.weightShare);
        if (name === "heldOutPct") return board.heldOut ? pct(board.heldOut.accuracy) : undefined;
        if (name === "minTasks") return board.minTasks;
        if (name === "taskTotal") return board.group.taskTotal;
      }
      const pair = arg.split("/");
      if (pair.length === 2 && byId.has(pair[0]) && byId.has(pair[1])) {
        const a = byId.get(pair[0]).label;
        const b = byId.get(pair[1]).label;
        const row = result.tau.filter((item) => (item.a === a && item.b === b) || (item.a === b && item.b === a))[0];
        if (!row) return undefined;
        if (name === "tau") return row.tau === null ? undefined : signed(row.tau);
        if (name === "tauN") return row.n;
        if (name === "tauPairs") return row.pairs;
        if (name === "tauSame") return row.same;
        if (name === "tauOpposite") return row.opposite;
      }
      return undefined;
    };
    return out;
  }

  /* the settings every explanation uses: the page's switches in their default positions */
  const defaults = { track: "all", agents: "true", coverage: "1", weighting: "difficulty", evidence: "benchmark", method: "bt" };

  const api = { explain: explain, facts: facts, defaults: defaults, reading: reading, pivotOf: pivotOf, tauPairs: tauPairs, noiseRows: noiseRows, pooledVsSingle: pooledVsSingle, gapRows: gapRows };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.phailRankingAnalysis = api;
})(typeof window !== "undefined" ? window : this);
