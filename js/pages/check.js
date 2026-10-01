/* =============================================================================
   PhAIL - Checks tab: runs js/check/checks.js and lists the results
   -----------------------------------------------------------------------------
   Everything runs in the browser from the files the site already ships; no
   build and nothing to install. Under bash tools/preview.sh the page can also
   read every other page (for typed numbers), and save the baseline and
   refresh raw sources through tools/preview_server.py.
   ========================================================================== */

(function () {
  const checks = window.phailChecks;
  const db = window.phailDatabase;
  const mount = document.querySelector("[data-check-results]");
  if (!checks || !db || !mount) return;
  const escape = (text) => String(text === undefined || text === null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const live = window.location.protocol.indexOf("http") === 0;

  const groups = [];
  const time = (label, run) => {
    const start = performance.now();
    let items;
    try { items = run(); } catch (error) { items = [{ name: `${label}: the check itself failed`, status: "fail", detail: String(error && error.stack || error), list: [] }]; }
    groups.push({ id: label.toLowerCase().replace(/\W+/g, "-"), label: label, items: items, ms: performance.now() - start });
  };

  time("Data", () => checks.data(db, window.phailScope));
  time("Formulas", () => checks.formulas(db));
  time("Explanations", () => checks.explanations(db));
  if (window.phailRawSources) time("Sources", () => window.phailRawSources.checks(db));
  time("Text", () => checks.text());
  const changes = checks.changes(db, window.phailExpected);
  groups.push({ id: "changes", label: "Changes since the baseline", items: changes.items, ms: 0,
    note: window.phailExpected ? `Baseline saved ${escape(window.phailExpected.saved || "?")}.` : "" });

  const pages = (window.phailPages || []).map((page) => page.file).concat(["models.html"]);
  const scripts = ["js/pages/scope.js", "js/pages/ranking.js", "js/pages/ledger.js", "js/pages/charts.js", "js/pages/astra.js", "js/pages/related.js", "js/pages/todo.js", "js/pages/check.js",
    "js/common/site.js", "js/common/discussion.js", "js/common/notes.js"];

  const pill = (status) => `<span class="check-status check-status--${status}">${{ pass: "Pass", fail: "Fail", warn: "Look", skip: "Skipped" }[status]}</span>`;
  const row = (entry) => `<tr${entry.anchor ? ` id="${entry.anchor}"` : ""}><td>${pill(entry.status)}</td><td>${escape(entry.name)}`
    + (entry.detail ? `<small>${escape(entry.detail)}</small>` : "")
    + (entry.list.length ? `<details class="check-list"${entry.status === "fail" ? " open" : ""}><summary>${entry.list.length} item${entry.list.length === 1 ? "" : "s"}</summary><ul>${entry.list.map((line) => `<li>${escape(line)}</li>`).join("")}</ul></details>` : "")
    + `</td></tr>`;

  function draw() {
    const all = [].concat.apply([], groups.map((group) => group.items));
    const count = (status) => all.filter((entry) => entry.status === status).length;
    document.querySelector("[data-check-summary]").innerHTML =
      `<strong>${count("fail") ? `${count("fail")} failing` : "All checks pass"}</strong>`
      + `<span>${all.length} checks: ${count("pass")} pass, ${count("fail")} fail, ${count("warn")} to look at, ${count("skip")} skipped</span>`
      + `<span class="database-summary-note">run ${new Date().toLocaleString("en-GB")} &middot; ledger read ${escape(db.meta.updated)}</span>`;
    mount.innerHTML = groups.map((group) => `<section class="chart-block check-group" id="${group.id}"><h2>${escape(group.label)}</h2>`
      + (group.note ? `<p class="table-footnote">${group.note}</p>` : "")
      + `<div class="data-table-wrap"><table class="data-table check-table"><tbody>`
      + group.items.slice().sort((a, b) => ["fail", "warn", "skip", "pass"].indexOf(a.status) - ["fail", "warn", "skip", "pass"].indexOf(b.status)).map(row).join("")
      + `</tbody></table></div></section>`).join("");
    if (window.location.hash) { const target = document.getElementById(window.location.hash.slice(1)); if (target) target.scrollIntoView(); }
  }
  draw();

  /* pages and scripts are read over http, after the synchronous checks are on screen */
  Promise.all([checks.pages(pages), checks.scripts(scripts)]).then(([pageItems, scriptItems]) => {
    groups.splice(groups.length - 1, 0, { id: "pages", label: "Pages", items: pageItems.concat(scriptItems), ms: 0 });
    draw();
  });

  /* --- actions: save the baseline; refresh raw sources (local preview only) ----------------------- */
  const actions = document.querySelector("[data-check-actions]");
  const status = (text) => { actions.querySelector(".check-action-status").textContent = text; };
  const baselineFile = () => "/* Baseline for check.html: the index as it stood when saved. Written by the Checks tab - do not edit. */\n"
    + "window.phailExpected = " + JSON.stringify(Object.assign({ saved: new Date().toISOString().slice(0, 16).replace("T", " ") }, changes.snapshot)) + ";\n";
  actions.innerHTML = `<button type="button" class="filter-reset" data-save-baseline>Save the current numbers as the baseline</button>`
    + (window.phailRawSources ? `<button type="button" class="filter-reset" data-refresh-raw${live ? "" : " disabled title=\"Needs bash tools/preview.sh\""}>Download every raw source again</button>` : "")
    + `<span class="check-action-status" aria-live="polite"></span>`;
  actions.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-save-baseline")) {
      const text = baselineFile();
      if (!live) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
        link.download = "expected.js";
        link.click();
        status("Downloaded expected.js - move it into data/.");
        return;
      }
      fetch("/api/expected", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text }) })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error("HTTP " + response.status))))
        .then(() => status("Saved to data/expected.js. Reload to compare against it."))
        .catch((error) => status(`Not saved (${error.message}). Is bash tools/preview.sh running?`));
    }
    if (button.hasAttribute("data-refresh-raw")) {
      button.disabled = true;
      status("Downloading...");
      fetch("/api/raw/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error("HTTP " + response.status))))
        .then((data) => status(data.results.map((result) => `${result.id}: ${result.ok ? "saved" : "failed - " + result.error}`).join(" · ") + ". Reload to recompute."))
        .catch((error) => status(`Failed (${error.message}).`))
        .then(() => { button.disabled = false; });
    }
  });
})();
