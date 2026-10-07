/* =============================================================================
   PhAIL - named numbers for text
   -----------------------------------------------------------------------------
   Prose never types a number the data can give. Where one belongs:
     data files   write {namespace.key}, e.g. {robotics.models}
     HTML         write <b data-m="key">, key in the page's own namespace
                  (body data-ranking="robotics" -> robotics.key)
   The value is computed on load and filled in, so the text follows the data.

   {!text} marks a number written on purpose - a definition, a proposal, a
   quoted protocol fact - and is shown as is. In HTML the same is
   <span data-fact>. check.html lists every one of them for review.

   Namespaces (each computed the first time a token asks for it):
     scope      counts from data/scope.js
     ledger     counts from data/ledger.js, plus per table:
                  best:<group or benchmark>, rows:<group>, models:<group>, taskTotal:<group>,
                  value:<group>:<model>, rank:<group>:<model> ("4th of 48")
     robotics   js/engine/ranking-analysis.js facts() for each index, at the
     cad        default settings (js/pages/ranking.js sets its own at load),
                plus rank:<model id> ("2nd") for a model's place in that index
   A token that resolves to nothing is shown as a red "?" and reported by
   js/common/selfcheck.js on the page and by check.html.
   ========================================================================== */

(function (root) {
  const values = {};
  const missing = [];

  const providers = {
    scope: () => {
      const scope = root.phailScope;
      if (!scope) return null;
      const all = [];
      scope.layers.forEach((layer) => layer.domains.forEach((domain) => domain.tasks.forEach((task) =>
        task.benchmarks.forEach((benchmark) => all.push(benchmark)))));
      /* a board split into sub-benchmarks is listed once per part; count it once */
      const unique = (list) => new Set(list.map((benchmark) => benchmark.name)).size;
      return {
        boards: unique(all),
        ledger: unique(all.filter((benchmark) => benchmark.ledger)),
        live: unique(all.filter((benchmark) => benchmark.board === "live"))
      };
    },
    ledger: () => {
      const db = root.phailDatabase;
      if (!db) return null;
      const groupOf = (id) => db.resultGroups.filter((group) => group.id === id)[0];
      const valueOf = (group, row) => (typeof row[group.primary] === "number" ? row[group.primary] : null);
      const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
      const fixed = (value) => String(Number(value.toFixed(2)));
      return {
        groups: db.resultGroups.length,
        rows: db.resultGroups.reduce((total, group) => total + group.rows.length, 0),
        models: db.models.length,
        $: (key) => {
          const parts = key.split(":");
          const group = groupOf(parts[1]);
          if (parts[0] === "best") {
            /* one table, or every table of a benchmark */
            const groups = group ? [group] : db.resultGroups.filter((item) => item.benchmark === parts[1] && item.primary);
            const values = [];
            groups.forEach((item) => item.rows.forEach((row) => { const value = valueOf(item, row); if (value !== null) values.push(value); }));
            return values.length ? fixed(Math.max.apply(null, values)) : undefined;
          }
          if (!group) return undefined;
          if (parts[0] === "rows") return group.rows.length;
          if (parts[0] === "taskTotal") return group.taskTotal;
          if (parts[0] === "models") return new Set(group.rows.map((row) => row.model)).size;
          const ranked = group.rows.filter((row) => valueOf(group, row) !== null).sort((a, b) => valueOf(group, b) - valueOf(group, a));
          const position = ranked.findIndex((row) => row.model === parts[2]);
          if (position < 0) return undefined;
          if (parts[0] === "value") return fixed(valueOf(group, ranked[position]));
          if (parts[0] === "rank") return `${ordinal(position + 1)} of ${ranked.length}`;
          return undefined;
        }
      };
    },
    robotics: () => indexFacts(root.phailRanking),
    cad: () => indexFacts(root.phailCadRanking)
  };

  function indexFacts(config) {
    const analysis = root.phailRankingAnalysis;
    if (!analysis || !config || !root.phailDatabase) return null;
    return analysis.facts(analysis.explain(root.phailDatabase, config, analysis.defaults), root.phailDatabase, config);
  }

  function namespace(ns) {
    if (!values[ns] && providers[ns]) {
      const computed = providers[ns]();
      if (computed) values[ns] = computed;
    }
    return values[ns];
  }

  function set(ns, facts) { values[ns] = Object.assign(values[ns] || {}, facts); }

  /* "robotics.models" -> its value, or undefined */
  function lookup(token) {
    const dot = token.indexOf(".");
    if (dot < 1) return undefined;
    const facts = namespace(token.slice(0, dot));
    const key = token.slice(dot + 1);
    if (!facts) return undefined;
    if (key !== "$" && Object.prototype.hasOwnProperty.call(facts, key)) return facts[key];
    return typeof facts.$ === "function" ? facts.$(key) : undefined;
  }

  const show = (value) => (typeof value === "number" ? value.toLocaleString("en") : String(value));
  const escapeHtml = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const TOKEN = /\{(!?)([^{}]+)\}/g;

  /* Text (already escaped) with its tokens filled. `where` names the text for
     the missing-token report. */
  function fill(text, where) {
    return String(text === undefined || text === null ? "" : text).replace(TOKEN, (whole, literal, body) => {
      if (literal) return `<span data-fact>${body}</span>`;
      const value = lookup(body);
      if (value === undefined) {
        missing.push({ token: body, where: where || "" });
        return `<span class="fact-missing" title="No value for {${escapeHtml(body)}}">?</span>`;
      }
      return escapeHtml(show(value));
    });
  }

  /* the same, for plain text (tokens only, no markup) */
  function fillText(text) {
    return String(text).replace(TOKEN, (whole, literal, body) => (literal ? body : (lookup(body) === undefined ? "?" : show(lookup(body)))));
  }

  /* [data-m="key"] elements: key is looked up in `ns` unless it names its own */
  function applyTo(container, ns) {
    (container || document).querySelectorAll("[data-m]").forEach((node) => {
      const key = node.dataset.m;
      const token = key.indexOf(".") > 0 ? key : ns + "." + key;
      const value = lookup(token);
      if (value === undefined) {
        missing.push({ token: token, where: "HTML data-m" });
        node.classList.add("fact-missing");
        node.textContent = "?";
      } else {
        node.textContent = show(value);
      }
    });
  }

  root.phailFacts = { set: set, namespace: namespace, lookup: lookup, fill: fill, fillText: fillText, applyTo: applyTo, missing: missing, TOKEN: TOKEN };
})(typeof window !== "undefined" ? window : this);
