/* =============================================================================
   PhAIL - Scope tab: the tree, the counts, the directory and the metric glossary
   -----------------------------------------------------------------------------
   Reads window.phailScope (scope-data.js) and window.phailIcon (icons.js).
   The tree is plain nested flex boxes; the connector lines are CSS, so there is
   nothing to measure or redraw on resize. Below ~1000px it folds into an
   indented list. Every node with children opens and closes on click; the
   depth switch above the tree opens or closes a whole level at once. It opens
   at domain level so the first screen stays short.

   A domain may group its task nodes (task.group -> domain.groups); a group
   is drawn as one more column between the domain and its tasks. A board split
   into sub-benchmarks appears once per part (benchmark.part) and is counted
   once everywhere.

   Hover explanations: resting on a layer, domain, group or task shows its
   definition; resting on a board shows what it is in plain words, its size,
   and what its Sim / Real / Offline and board labels mean. The switch in the
   toolbar turns this off; the choice is remembered in this browser only.
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

  /* boards under a node, each board once even when split into parts */
  const boardsIn = (node) => {
    if (node.benchmarks) return node.benchmarks;
    if (node.tasks) return [].concat(...node.tasks.map(boardsIn));
    if (node.domains) return [].concat(...node.domains.map(boardsIn));
    if (node.layers) return [].concat(...node.layers.map(boardsIn));
    return [];
  };
  const unique = (benchmarks) => new Set(benchmarks.map((benchmark) => benchmark.name)).size;
  const countIn = (node) => unique(boardsIn(node));
  const fullName = (benchmark) => benchmark.part ? `${benchmark.name}: ${benchmark.part}` : benchmark.name;

  const modeShort = { "Sim": "Sim", "Real": "Real", "Sim + real": "Sim+Real", "Offline": "Offline" };
  const boardLabel = { live: "Live leaderboard", challenge: "Challenge", paper: "Results in papers", archived: "Archived board" };

  /* What each label means, in the words shown on hover. */
  const modeMeaning = {
    "Sim": "Run in a physics simulator: cheap and repeatable, but contact and sensing are approximations.",
    "Real": "Run on physical robots or vehicles: the real test, but slow and hard to reproduce elsewhere.",
    "Sim + real": "Has a simulated track and a real-hardware track.",
    "Offline": "No closed loop: fixed inputs, and the output (an answer, a design, a video) is scored against references."
  };
  const boardMeaning = {
    live: "Live leaderboard: takes new submissions and updates the ranking.",
    challenge: "Challenge: a competition with a deadline and its own board.",
    paper: "Results in papers: no central board; each paper reports its own numbers.",
    archived: "Archived board: no longer takes submissions; its last results stay up."
  };
  const testsMeaning = {
    policy: "Tests trained, task-specific models: robot policies (VLAs, imitation or RL controllers), or trained generators and optimizers.",
    agent: "Tests general models (LLMs, VLMs) driving a harness or writing code.",
    both: "Tests both trained policies and general models through a harness."
  };

  /* --- counts: one line, counted from scope-data.js on every load --------------
     The same set as the tree's root node and the directory: every board in
     every layer, so the page never shows two different totals. */
  const statsMount = document.querySelector("[data-scope-stats]");
  if (statsMount) {
    const live = unique(all.filter((entry) => entry.benchmark.board === "live").map((entry) => entry.benchmark));
    const domains = [].concat(...scope.layers.map((layer) => layer.domains.map((domain) => domain.name)));
    statsMount.innerHTML = `<span><b>${unique(all.map((entry) => entry.benchmark))}</b> benchmarks (${live} live leaderboards)</span>`
      + `<span><b>${domains.length}</b> domains: ${escape(domains.join(", "))}</span>`;
  }

  /* --- hover cards ------------------------------------------------------------- */
  const explainNode = [];   // index -> { kind, item, path }
  const explainBoard = [];  // index -> { benchmark, path }

  const nodeCard = ({ kind, item, path }) => `<p class="explain-kicker">${escape(path)}</p>`
    + `<h4>${escape(item.name)} <span class="explain-count">${countIn(item)} board${countIn(item) === 1 ? "" : "s"}</span></h4>`
    + `<p>${escape(item.define || item.gloss || "")}</p>`
    + (item.kind === "capability" ? '<p class="explain-note">Dashed: a capability board tests one capability, with tasks drawn from any task category.</p>' : "");

  const boardCard = ({ benchmark, path }) => {
    const facts = [["Tasks", benchmark.tasks], ["Models", benchmark.models], ["Used for", benchmark.usage], ["Placed here", benchmark.placed]]
      .filter((pair) => pair[1]);
    return `<p class="explain-kicker">${escape(path)}</p>`
      + `<h4>${escape(fullName(benchmark))}</h4>`
      + `<p class="explain-plain">${escape(benchmark.plain)}</p>`
      + (facts.length ? `<dl class="explain-facts">${facts.map(([key, value]) => `<div><dt>${key}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>` : "")
      + `<ul class="explain-labels">`
      + `<li><b>${escape(benchmark.mode)}</b> ${escape(modeMeaning[benchmark.mode] || "")}</li>`
      + `<li><b>${escape(boardLabel[benchmark.board])}</b> ${escape((boardMeaning[benchmark.board] || "").replace(/^[^:]+: /, ""))}</li>`
      + `<li><b>${{ policy: "Policies", agent: "Agents", both: "Both" }[benchmark.tests]}</b> ${escape(testsMeaning[benchmark.tests] || "")}</li>`
      + (benchmark.flag === "saturated" ? "<li><b>Saturated</b> Best published result above 95%: it no longer separates models.</li>" : "")
      + (benchmark.ledger ? "<li><b>L</b> Its numbers are transcribed in the PhAIL Ledger.</li>" : "")
      + "</ul>";
  };

  /* --- tree ---------------------------------------------------------------------- */
  const chip = (benchmark, path) => {
    explainBoard.push({ benchmark, path });
    const classes = ["st-chip"];
    if (benchmark.flag === "saturated") classes.push("st-chip--saturated");
    return `<a class="${classes.join(" ")}" href="${escape(benchmark.url)}" target="_blank" rel="noreferrer" data-explain-board="${explainBoard.length - 1}">`
      + (benchmark.board === "live" ? '<span class="st-live" aria-label="live leaderboard"></span>' : "")
      + `<span class="st-chip-name">${escape(benchmark.name)}</span>`
      + (benchmark.part ? `<span class="st-chip-part">${escape(benchmark.part)}</span>` : "")
      + `<span class="st-chip-mode">${escape(modeShort[benchmark.mode] || benchmark.mode)}</span>`
      + (benchmark.ledger ? '<span class="st-chip-ledger">L</span>' : "")
      + "</a>";
  };

  const node = (kind, item, extra, path) => {
    explainNode.push({ kind, item, path });
    return `<div class="st-node st-node--${kind}${extra || ""}" role="button" tabindex="0" aria-expanded="true" data-toggle data-explain-node="${explainNode.length - 1}">`
      + (item.icon ? `<span class="st-icon">${icon(item.icon, kind === "layer" ? 18 : 15)}</span>` : "")
      + `<span class="st-text"><span class="st-name">${escape(item.name)}</span>`
      + (kind === "layer" ? `<span class="st-gloss">${escape(item.gloss)}</span>` : "")
      + (kind === "task" && item.kind === "capability" && !item.group ? '<span class="st-kind">capability board</span>' : "")
      + `</span><span class="st-count">${countIn(item)}</span><span class="st-caret" aria-hidden="true"></span></div>`;
  };

  const branch = (head, kids, depth) => `<div class="st-branch"${depth !== undefined ? ` data-depth="${depth}"` : ""}>${head}${kids.length ? `<div class="st-kids">${kids.join("")}</div>` : ""}</div>`;

  /* a domain's tasks in order, consecutive tasks of one group gathered */
  const groupedTasks = (domain) => {
    const out = [];
    domain.tasks.forEach((task) => {
      const group = task.group && (domain.groups || []).filter((item) => item.id === task.group)[0];
      const last = out[out.length - 1];
      if (group && last && last.group === group) last.tasks.push(task);
      else out.push({ group, tasks: [task] });
    });
    return out;
  };
  const groupName = (domain, task) => {
    const group = task.group && (domain.groups || []).filter((item) => item.id === task.group)[0];
    return group ? ` &rsaquo; ${escape(group.name)}` : "";
  };

  const treeMount = document.querySelector("[data-scope-tree]");
  if (treeMount) {
    const layers = scope.layers.map((layer) => branch(
      node("layer", layer, ` st-layer-${layer.id}${layer.boundary ? " st-node--boundary" : ""}`, "Layer"),
      layer.domains.map((domain) => branch(
        node("domain", domain, layer.boundary ? " st-node--boundary" : "", layer.name),
        groupedTasks(domain).map(({ group, tasks }) => {
          const where = group ? ` › ${group.name}` : "";
          const taskBranch = (task) => branch(
            node("task", task, `${task.kind === "capability" ? " st-node--capability" : ""}${layer.boundary ? " st-node--boundary" : ""}`, `${layer.name.replace(" layer", "")} › ${domain.name}${where}`),
            [`<div class="st-branch"><div class="st-chips">${task.benchmarks.map((benchmark) => chip(benchmark, `${domain.name}${where} › ${task.name}`)).join("")}</div></div>`],
            3
          );
          if (!group) return taskBranch(tasks[0]);
          /* depth 2.5: opens with the tasks level of the depth switch */
          return branch(node("group", Object.assign({}, group, { tasks }), group.kind === "capability" ? " st-node--capability" : "", `${layer.name.replace(" layer", "")} › ${domain.name}`), tasks.map(taskBranch), 2.5);
        }),
        2
      )),
      1
    ));
    const root = `<div class="st-node st-node--root"><img class="st-root-mark" src="physical-ai-mark.svg" alt="" /><span class="st-text"><span class="st-name">Physical AI</span></span><span class="st-count">${countIn(scope)}</span></div>`;
    treeMount.innerHTML = `<div class="st-tree">${branch(root, layers, 0)}</div>`;

    const setOpen = (branchEl, open) => {
      branchEl.classList.toggle("is-collapsed", !open);
      const head = branchEl.querySelector(":scope > [data-toggle]");
      if (head) head.setAttribute("aria-expanded", String(open));
    };
    /* depth: 1 layers, 2 domains, 3 tasks, 4 every board */
    const openTo = (depth) => {
      treeMount.querySelectorAll(".st-branch[data-depth]").forEach((el) => setOpen(el, Number(el.dataset.depth) < depth));
      document.querySelectorAll("[data-scope-depth] button").forEach((button) =>
        button.setAttribute("aria-selected", String(Number(button.dataset.depth) === depth)));
    };
    treeMount.addEventListener("click", (event) => {
      const head = event.target.closest("[data-toggle]");
      if (!head || event.target.closest("a")) return;
      const branchEl = head.parentElement;
      setOpen(branchEl, branchEl.classList.contains("is-collapsed"));
      document.querySelectorAll("[data-scope-depth] button").forEach((button) => button.setAttribute("aria-selected", "false"));
    });
    treeMount.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-toggle]")) {
        event.preventDefault();
        event.target.click();
      }
    });
    const depthMount = document.querySelector("[data-scope-depth]");
    if (depthMount) {
      depthMount.innerHTML = [[1, "Layers"], [2, "Domains"], [3, "Tasks"], [4, "All boards"]]
        .map(([depth, label]) => `<button type="button" role="tab" data-depth="${depth}">${label}</button>`).join("");
      depthMount.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (button) openTo(Number(button.dataset.depth));
      });
    }
    openTo(2);

    /* --- hover explanations, with an on/off switch -------------------------------- */
    const STORE = "phail-scope-explain";
    let explainOn = true;
    try { explainOn = window.localStorage.getItem(STORE) !== "off"; } catch (error) { /* storage blocked: default on */ }

    const pop = document.createElement("div");
    pop.className = "explain-pop";
    pop.setAttribute("role", "tooltip");
    pop.hidden = true;
    document.body.appendChild(pop);
    let current = null;

    const hide = () => { pop.hidden = true; current = null; };
    const show = (target) => {
      if (!explainOn) return;
      const nodeIndex = target.getAttribute("data-explain-node");
      const boardIndex = target.getAttribute("data-explain-board");
      pop.innerHTML = nodeIndex !== null ? nodeCard(explainNode[Number(nodeIndex)]) : boardCard(explainBoard[Number(boardIndex)]);
      pop.hidden = false;
      current = target;
      /* beside the element: right if there is room, else left; kept on screen */
      const rect = target.getBoundingClientRect();
      const width = pop.offsetWidth;
      const height = pop.offsetHeight;
      let left = rect.right + 12;
      let top = rect.top + rect.height / 2 - height / 2;
      if (left + width > window.innerWidth - 8) {
        if (rect.left - width - 12 >= 8) {
          left = rect.left - width - 12;
        } else {
          left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left));
          top = rect.bottom + 8;
        }
      }
      top = Math.max(8, Math.min(top, window.innerHeight - height - 8));
      pop.style.left = Math.round(left) + "px";
      pop.style.top = Math.round(top) + "px";
    };
    const explainTarget = (element) => element && element.closest && element.closest("[data-explain-node], [data-explain-board]");

    treeMount.addEventListener("mouseover", (event) => {
      const target = explainTarget(event.target);
      if (target && target !== current) show(target);
    });
    treeMount.addEventListener("mouseout", (event) => {
      const target = explainTarget(event.target);
      if (target && !target.contains(event.relatedTarget)) hide();
    });
    treeMount.addEventListener("focusin", (event) => { const target = explainTarget(event.target); if (target) show(target); });
    treeMount.addEventListener("focusout", hide);
    window.addEventListener("scroll", hide, { passive: true });

    const toggle = document.querySelector("[data-explain-toggle]");
    if (toggle) {
      toggle.checked = explainOn;
      toggle.addEventListener("change", () => {
        explainOn = toggle.checked;
        if (!explainOn) hide();
        try { window.localStorage.setItem(STORE, explainOn ? "on" : "off"); } catch (error) { /* not remembered */ }
      });
    }
  }

  /* --- directory ------------------------------------------------------------------ */
  const directoryMount = document.querySelector("[data-scope-directory]");
  if (directoryMount) {
    const summary = document.querySelector("[data-scope-directory-summary]");
    if (summary) summary.textContent = `All ${countIn(scope)} benchmarks, in plain words`;
    directoryMount.innerHTML = `<div class="data-table-wrap"><table class="data-table scope-directory-table">`
      + `<thead><tr><th>Benchmark</th><th>Where it sits</th><th>What it is</th><th>Tasks</th><th>Models</th><th>Mode</th><th>Board</th><th>Tests</th></tr></thead><tbody>`
      + all.map(({ layer, domain, task, benchmark }) => `<tr${layer.boundary ? ' class="row-reference"' : ""}>`
        + `<td><a href="${escape(benchmark.url)}" target="_blank" rel="noreferrer">${escape(fullName(benchmark))}</a>`
        + (benchmark.added ? ` <span class="scope-new" title="Added ${escape(benchmark.added)}">new</span>` : "")
        + (benchmark.flag === "saturated" ? ' <span class="scope-flag">saturated</span>' : "")
        + (benchmark.ledger ? ' <a class="scope-ledger" href="tasks.html">in ledger</a>' : "") + "</td>"
        + `<td>${escape(layer.name.replace(" layer", ""))} &rsaquo; ${escape(domain.name)}${groupName(domain, task)} &rsaquo; ${escape(task.name)}`
        + (benchmark.placed ? `<small class="scope-placed">${escape(benchmark.placed)}</small>` : "") + "</td>"
        + `<td>${escape(benchmark.plain)}</td><td>${escape(benchmark.tasks || "")}</td><td>${escape(benchmark.models || "")}</td>`
        + `<td>${escape(benchmark.mode)}</td><td>${escape(boardLabel[benchmark.board])}</td>`
        + `<td>${escape({ policy: "Policy", agent: "Agent", both: "Both" }[benchmark.tests])}</td></tr>`).join("")
      + `</tbody></table></div>`;
  }

  /* --- metric glossary: how boards score --------------------------------------------
     A board name that is not in the tree is flagged, so a rename cannot leave a
     stale name behind unnoticed. metrics.html redirects to #metrics: open it. */
  const metricsMount = document.querySelector("[data-scope-metrics]");
  if (metricsMount && scope.metrics) {
    const names = new Set(all.map((entry) => entry.benchmark.name));
    const boardName = (name) => escape(name) + (names.has(name) ? "" : ' <span class="scope-flag">not in Scope</span>');
    metricsMount.innerHTML = `<div class="data-table-wrap"><table class="data-table metrics-table">`
      + `<thead><tr><th>Metric</th><th>Used in</th><th>Measures</th><th>Limitation</th></tr></thead><tbody>`
      + scope.metrics.map((metric) => `<tr><td>${escape(metric.name)}</td><td>${metric.usedIn.map(boardName).join(", ")}</td>`
        + `<td>${escape(metric.measures)}${metric.link ? ` (<a href="${escape(metric.link[1])}">${escape(metric.link[0])}</a>)` : ""}</td>`
        + `<td>${escape(metric.limit)}</td></tr>`).join("")
      + `</tbody></table></div>`
      + (scope.metricsMissing ? `<p class="table-footnote">${escape(scope.metricsMissing)}</p>` : "");
    const metricsBox = metricsMount.closest("details");
    if (metricsBox && window.location.hash === "#metrics") {
      metricsBox.open = true;
      metricsBox.scrollIntoView();
    }
  }
})();
