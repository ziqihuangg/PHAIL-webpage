/* =============================================================================
   PhAIL - Scope tab: the left-to-right tree, the counts, and the directory
   -----------------------------------------------------------------------------
   Reads window.phailScope (scope-data.js) and window.phailIcon (icons.js).
   The tree is plain nested flex boxes; the connector lines are CSS, so there is
   nothing to measure or redraw on resize. Below ~980px it folds into an
   indented list.
   ========================================================================== */

(function () {
  const scope = window.phailScope;
  const icon = window.phailIcon || (() => "");
  if (!scope) return;

  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const all = [];
  scope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) =>
    task.benchmarks.forEach((benchmark) => all.push({ layer, domain, task, benchmark })))));

  const countIn = (node) => {
    if (node.benchmarks) return node.benchmarks.length;
    if (node.tasks) return node.tasks.reduce((sum, task) => sum + countIn(task), 0);
    if (node.domains) return node.domains.reduce((sum, domain) => sum + countIn(domain), 0);
    return 0;
  };

  const modeShort = { "Sim": "Sim", "Real": "Real", "Sim + real": "Sim+Real", "Offline": "Offline" };
  const boardLabel = { live: "Live leaderboard", challenge: "Challenge board", paper: "Results in papers" };
  const testsLabel = { policy: "Trained policies", agent: "General models via a harness", both: "Policies and harnessed models" };

  /* --- counts ---------------------------------------------------------------- */
  const statsMount = document.querySelector("[data-scope-stats]");
  if (statsMount) {
    const ranked = scope.layers.filter((layer) => !layer.boundary);
    const inScope = all.filter((entry) => !entry.layer.boundary);
    const stats = [
      [inScope.length, "benchmarks in scope", `${all.length - inScope.length} more on the boundary`],
      [ranked.reduce((sum, layer) => sum + layer.domains.length, 0), "domains", ranked.map((layer) => layer.domains.map((d) => d.name).join(", ")).join(" · ")],
      [all.filter((entry) => entry.benchmark.board === "live").length, "live leaderboards", "take new entries; the rest publish through papers or challenges"],
      [all.filter((entry) => entry.benchmark.tests !== "policy").length, "accept general models", "a frontier model driving a harness, not a trained policy"],
      [all.filter((entry) => entry.benchmark.ledger).length, "transcribed in the ledger", "with every number cited"]
    ];
    statsMount.innerHTML = stats.map(([value, label, note]) =>
      `<div class="scope-stat"><span class="scope-stat-value">${value}</span><span class="scope-stat-label">${escape(label)}</span><span class="scope-stat-note">${escape(note)}</span></div>`).join("");
  }

  /* --- tree ---------------------------------------------------------------------- */
  const chip = (benchmark) => {
    const title = [benchmark.note, `${benchmark.mode} · ${boardLabel[benchmark.board]} · ${testsLabel[benchmark.tests]}`]
      .concat(benchmark.flag === "saturated" ? ["Saturated: best reported result above 95%"] : [])
      .concat(benchmark.ledger ? ["Numbers transcribed in the PhAIL ledger"] : []).join("\n");
    const classes = ["st-chip"];
    if (benchmark.flag === "saturated") classes.push("st-chip--saturated");
    return `<a class="${classes.join(" ")}" href="${escape(benchmark.url)}" target="_blank" rel="noreferrer" title="${escape(title)}">`
      + (benchmark.board === "live" ? '<span class="st-live" aria-label="live leaderboard"></span>' : "")
      + `<span class="st-chip-name">${escape(benchmark.name)}</span>`
      + `<span class="st-chip-mode">${escape(modeShort[benchmark.mode] || benchmark.mode)}</span>`
      + (benchmark.ledger ? '<span class="st-chip-ledger" title="In the PhAIL ledger">L</span>' : "")
      + "</a>";
  };

  const node = (kind, item, extra) => `<div class="st-node st-node--${kind}${extra || ""}">`
    + `<span class="st-icon">${icon(item.icon, kind === "layer" ? 18 : 15)}</span>`
    + `<span class="st-text"><span class="st-name">${escape(item.name)}</span>`
    + (kind === "layer" ? `<span class="st-gloss">${escape(item.gloss)}</span>` : "")
    + (kind === "task" && item.kind === "capability" ? '<span class="st-kind">capability board</span>' : "")
    + `</span><span class="st-count">${countIn(item)}</span></div>`;

  const branch = (head, kids) => `<div class="st-branch">${head}${kids.length ? `<div class="st-kids">${kids.join("")}</div>` : ""}</div>`;

  const treeMount = document.querySelector("[data-scope-tree]");
  if (treeMount) {
    const layers = scope.layers.map((layer) => branch(
      node("layer", layer, ` st-layer-${layer.id}${layer.boundary ? " st-node--boundary" : ""}`),
      layer.domains.map((domain) => branch(
        node("domain", domain, layer.boundary ? " st-node--boundary" : ""),
        domain.tasks.map((task) => branch(
          node("task", task, `${task.kind === "capability" ? " st-node--capability" : ""}${layer.boundary ? " st-node--boundary" : ""}`),
          [`<div class="st-branch"><div class="st-chips" title="${escape(task.gloss)}">${task.benchmarks.map(chip).join("")}</div></div>`]
        ))
      ))
    ));
    const root = `<div class="st-node st-node--root"><img class="st-root-mark" src="physical-ai-mark.svg" alt="" /><span class="st-text"><span class="st-name">Physical AI</span></span><span class="st-count">${all.length}</span></div>`;
    treeMount.innerHTML = `<div class="st-tree">${branch(root, layers)}</div>`;
  }

  /* --- directory ------------------------------------------------------------------ */
  const directoryMount = document.querySelector("[data-scope-directory]");
  if (directoryMount) {
    const summary = document.querySelector("[data-scope-directory-summary]");
    if (summary) summary.textContent = `All ${all.length} benchmarks, with what each one measures`;
    directoryMount.innerHTML = `<div class="data-table-wrap"><table class="data-table scope-directory-table">`
      + `<thead><tr><th>Benchmark</th><th>Where it sits</th><th>Mode</th><th>Board</th><th>Tests</th><th>What it measures</th></tr></thead><tbody>`
      + all.map(({ layer, domain, task, benchmark }) => `<tr${layer.boundary ? ' class="row-reference"' : ""}>`
        + `<td><a href="${escape(benchmark.url)}" target="_blank" rel="noreferrer">${escape(benchmark.name)}</a>`
        + (benchmark.added ? ' <span class="scope-new" title="Added to the first team list on 27 Sep 2026">new</span>' : "")
        + (benchmark.flag === "saturated" ? ' <span class="scope-flag">saturated</span>' : "")
        + (benchmark.ledger ? ' <a class="scope-ledger" href="tasks.html">in ledger</a>' : "") + "</td>"
        + `<td>${escape(layer.name.replace(" layer", ""))} &rsaquo; ${escape(domain.name)} &rsaquo; ${escape(task.name)}</td>`
        + `<td>${escape(benchmark.mode)}</td><td>${escape(boardLabel[benchmark.board])}</td>`
        + `<td>${escape({ policy: "Policy", agent: "Agent", both: "Both" }[benchmark.tests])}</td>`
        + `<td>${escape(benchmark.note)}</td></tr>`).join("")
      + `</tbody></table></div>`;
  }
})();
