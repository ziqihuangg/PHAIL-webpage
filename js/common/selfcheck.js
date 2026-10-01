/* =============================================================================
   PhAIL - self-check on every page
   -----------------------------------------------------------------------------
   Loaded FIRST in <body>, before any script changes the page, so it can read
   the text the HTML itself carries. When the page has loaded it looks for:
     - numbers typed into the HTML: not bound with data-m, not marked data-fact
     - numbers typed into this page's data text (discussion, TODO, index
       config prose) instead of a {token} or an {!intentional} literal
     - {tokens} that resolved to nothing (js/common/facts.js)
     - script errors
   Nothing shows when all is well. Otherwise a small red line at the foot of
   the page links to check.html, which runs every check on every page.

   phailLint (the number finder and the text collectors) is shared with
   check.html, so both apply exactly the same rule.
   ========================================================================== */

(function (root) {
  /* --- the rule: which numbers count as typed by hand ---------------------------------- */
  const MONTHS = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December";
  /* dates, citation years and step references are structure, not data */
  const IGNORE = [
    new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS})\\b(?:\\s+\\d{4})?`, "g"),
    new RegExp(`\\b(?:${MONTHS})\\s+\\d{1,2}(?:,\\s*\\d{4})?\\b`, "g"),
    new RegExp(`\\b(?:${MONTHS})\\s+\\d{4}\\b`, "g"),
    /\b\d{4}-\d{2}(?:-\d{2})?\b/g,
    /\b(?:19|20)\d{2}\b/g,
    /\bsteps?\s+\d+(?:\s*(?:-|–|and|to)\s*\d+)?/gi,
    /\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g,           /* TeX: formula parameters are KaTeX macros */
    /\{!?[^{}]+\}/g                                  /* {token} and {!literal} */
  ];
  const NUMBER = /\d+(?:[.,]\d+)*/g;

  let nameCache = null;
  /* every name that contains a digit (GPT-6 Astra, RoboTwin 2.0, T30-v2 ...),
     from whatever data this page loaded; blanked out before numbers are sought */
  function names() {
    if (nameCache) return nameCache;
    const list = [];
    const add = (name) => { if (name && /\d/.test(name)) list.push(String(name)); };
    const db = root.phailDatabase;
    if (db) {
      db.models.forEach((model) => { add(model.name); add(model.size); add(model.maker); });
      Object.keys(db.organisations).forEach((key) => add(db.organisations[key].name));
      (db.benchmarks || []).forEach((item) => add(item.name));
      db.resultGroups.forEach((group) => (group.envs || []).forEach(add));
    }
    const scope = root.phailScope;
    if (scope) scope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) => {
      add(task.name);
      task.benchmarks.forEach((benchmark) => add(benchmark.name));
    })));
    [root.phailRanking, root.phailCadRanking].forEach((cfg) => {
      if (!cfg) return;
      Object.keys(cfg.boards).forEach((id) => { add(cfg.boards[id].label); add(id); });
      Object.keys(cfg.outOfIndex || {}).forEach((id) => { add(id); add((cfg.outOfIndex[id] || {}).label); });
      (cfg.gaps || []).forEach((gap) => (gap.labels || []).forEach(add));
    });
    nameCache = Array.from(new Set(list)).sort((a, b) => b.length - a.length);
    return nameCache;
  }

  /* Numbers in `text` that nothing computes: [{ number, context }] */
  function find(text) {
    const original = String(text);
    let s = original;
    const blank = (match) => " ".repeat(match.length);
    IGNORE.forEach((pattern) => { s = s.replace(pattern, blank); });
    names().forEach((name) => { if (s.indexOf(name) !== -1) s = s.split(name).join(blank(name)); });
    const found = [];
    let m;
    NUMBER.lastIndex = 0;
    while ((m = NUMBER.exec(s))) {
      const before = s[m.index - 1] || " ";
      const before2 = s[m.index - 2] || " ";
      const after = s[m.index + m[0].length] || " ";
      if (/[A-Za-z0-9_.]/.test(before)) continue;                          /* inside a word: T30, v2, N1.7 */
      if ((before === "-" || before === "/") && /[A-Za-z]/.test(before2)) continue;  /* pi-0.5, GPT-6 */
      if (/[A-Za-z]/.test(after) && after !== "x") continue;                 /* 3D, 4th */
      const start = Math.max(0, m.index - 45);
      found.push({ number: m[0], context: (start ? "…" : "") + original.slice(start, m.index + m[0].length + 45).replace(/\s+/g, " ").trim() + "…" });
    }
    return found;
  }

  /* --- where text comes from -------------------------------------------------------------- */
  /* The HTML's own text under `container`, skipping what is bound or marked:
     [{ text, where }] with `where` the nearest section id. */
  function htmlTexts(container) {
    const out = [];
    const skip = "script, style, [data-m], [data-fact], .step-math, .eq, [data-lint-skip]";
    const walk = (node, where) => {
      if (node.nodeType === 3) { if (/\d/.test(node.nodeValue)) out.push({ text: node.nodeValue, where: where }); return; }
      if (node.nodeType !== 1 || node.matches(skip)) return;
      const here = node.id ? "#" + node.id : where;
      Array.prototype.forEach.call(node.childNodes, (child) => walk(child, here));
    };
    if (container) walk(container, "");
    return out;
  }

  /* Text the page draws from data files. `keys` = the discussion lists shown. */
  function dataTexts(keys, rankingKey) {
    const out = [];
    const push = (text, where) => { if (text) out.push({ text: String(text), where: where }); };
    const discussion = root.phailDiscussion || {};
    (keys || []).forEach((key) => (discussion[key] || []).forEach((item, i) => {
      const where = `data/discussion.js ${key} #${i + 1}`;
      push(item.title, where); push(item.detail, where); push(item.decide, where);
      (item.points || []).forEach((point) => { push(point[0], where); push(point[1], where); });
    }));
    if (keys && keys.indexOf("todo") !== -1 && root.phailTodo) root.phailTodo.groups.forEach((group) => group.items.forEach((item) => {
      push(item.title, `data/todo.js ${group.name}`); push(item.detail, `data/todo.js ${group.name}`);
    }));
    const cfg = { robotics: root.phailRanking, cad: root.phailCadRanking }[rankingKey];
    if (cfg) {
      const file = rankingKey === "cad" ? "data/ranking-cad.js" : "data/ranking-robotics.js";
      (cfg.factors || []).forEach((factor) => { push(factor.why, `${file} factors ${factor.name}`); push(factor.data, `${file} factors ${factor.name}`); });
      (cfg.gaps || []).forEach((gap) => push(gap.asks, `${file} gaps ${gap.name}`));
      (cfg.capabilities || []).forEach((cap) => { push(cap.definedBy, `${file} capabilities ${cap.name}`); cap.sources.forEach((source) => push(source.what, `${file} capabilities ${cap.name}`)); });
      Object.keys(cfg.outOfIndex || {}).forEach((id) => { const entry = cfg.outOfIndex[id]; push(entry.reason || entry, `${file} outOfIndex ${id}`); });
    }
    return out;
  }

  /* numbers written on purpose, for review: {!...} in data, [data-fact] in HTML */
  function literals(texts, container) {
    const out = [];
    texts.forEach((item) => { let m; const re = /\{!([^{}]+)\}/g; while ((m = re.exec(item.text))) out.push({ text: m[1], where: item.where }); });
    if (container) container.querySelectorAll("[data-fact]").forEach((node) => out.push({ text: node.textContent, where: "HTML" }));
    return out;
  }

  function scan(texts) {
    const out = [];
    texts.forEach((item) => find(item.text).forEach((hit) => out.push({ number: hit.number, context: hit.context, where: item.where })));
    return out;
  }

  root.phailLint = { find: find, names: names, htmlTexts: htmlTexts, dataTexts: dataTexts, literals: literals, scan: scan };

  /* --- this page ------------------------------------------------------------------------------ */
  if (typeof document === "undefined" || !document.body) return;
  const main = document.querySelector("main");
  const staticTexts = htmlTexts(main);   /* read now, before any script has run */
  const errors = [];
  root.addEventListener("error", (event) => errors.push(event.message || String(event.error)));

  root.addEventListener("load", () => {
    const keys = Array.prototype.map.call(document.querySelectorAll("[data-discussion]"), (node) => node.dataset.discussion);
    if (document.querySelector("[data-todo]")) keys.push("todo");
    const typedHtml = scan(staticTexts);
    const typedData = scan(dataTexts(keys, document.body.dataset.ranking));
    const missing = (root.phailFacts && root.phailFacts.missing) || [];
    const problems = typedHtml.length + typedData.length + missing.length + errors.length;
    root.phailSelfCheck = { typedHtml: typedHtml, typedData: typedData, missing: missing, errors: errors };
    if (!problems) return;
    if (root.console) root.console.warn("PhAIL self-check", root.phailSelfCheck);
    const page = (root.location.pathname.split("/").pop() || "index.html").replace(".html", "");
    const parts = [];
    if (typedHtml.length + typedData.length) parts.push(`${typedHtml.length + typedData.length} typed number${typedHtml.length + typedData.length === 1 ? "" : "s"}`);
    if (missing.length) parts.push(`${missing.length} missing value${missing.length === 1 ? "" : "s"}`);
    if (errors.length) parts.push(`${errors.length} script error${errors.length === 1 ? "" : "s"}`);
    const note = document.createElement("p");
    note.className = "selfcheck-note";
    note.innerHTML = `Self-check: ${parts.join(", ")} on this page. <a href="check.html#page-${page}">Details</a>`;
    (document.querySelector("footer") || document.body).appendChild(note);
  });
})(typeof window !== "undefined" ? window : this);
