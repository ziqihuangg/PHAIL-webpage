/* =============================================================================
   PhAIL - GPT-6-Astra spotlight: rendering
   -----------------------------------------------------------------------------
   Reads data/astra.js, writes into the placeholders in gpt-6-astra.html. Charts
   go through window.phailCharts, the same dependency-free SVG primitives the
   Charts page uses, so this page cannot drift from the site's chart language.

   Nothing here invents a number. If a block of data is missing the section says
   so rather than rendering an empty frame.
   ========================================================================== */

(function () {
  "use strict";

  const data = window.astraData;
  const charts = window.phailCharts;
  if (!data) return;

  const cls = (id) => data.classes[id] || data.classes.demo;
  const src = (id) => data.sources[id];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* --- source key ---------------------------------------------------------- */
  function renderClassKey() {
    const host = $("[data-class-key]");
    if (!host) return;
    host.innerHTML = Object.keys(data.classes).map((id) => {
      const item = data.classes[id];
      return `<li><span class="provenance-swatch" style="background:${item.color}"></span>` +
        `<span class="provenance-copy"><strong>${escapeHtml(item.label)}</strong> &mdash; ${escapeHtml(item.detail)}</span></li>`;
    }).join("");
  }

  /* --- tables --------------------------------------------------------------
     Every table in data.tables is [ ...cells, flag ]: the last item is a row
     flag ("hi" to highlight, "ref" for a reference row), never a cell.        */
  function renderTables() {
    $$("[data-table]").forEach((host) => {
      const table = data.tables[host.getAttribute("data-table")];
      if (!table) { host.innerHTML = '<p class="chart-missing">No data for this table.</p>'; return; }
      const head = "<thead><tr>" + table.head.map((h) => `<th>${escapeHtml(h)}</th>`).join("") + "</tr></thead>";
      const body = "<tbody>" + table.rows.map((row) => {
        const flag = row.length > table.head.length ? row[row.length - 1] : "";
        const cells = row.slice(0, table.head.length);
        const rowClass = flag === "hi" ? ' class="row-highlight"' : (flag === "ref" ? ' class="row-reference"' : "");
        return `<tr${rowClass}>` + cells.map((cell, index) =>
          `<td>${index === 0 || flag === "hi" ? "<strong>" + escapeHtml(cell) + "</strong>" : escapeHtml(cell)}</td>`
        ).join("") + "</tr>";
      }).join("") + "</tbody>";
      host.innerHTML = `<table class="data-table">${head}${body}</table>`;
    });
  }

  /* --- videos --------------------------------------------------------------
     preload="none" on every clip: a poster frame is all that loads until
     someone presses play, so a page with a dozen robot videos still opens in
     one request each.                                                         */
  function renderVideos() {
    $$("[data-videos]").forEach((host) => {
      const clips = data.videos[host.getAttribute("data-videos")];
      if (!clips || !clips.length) { host.innerHTML = ""; return; }
      host.innerHTML = clips.map((clip) => {
        const source = src(clip.src_id);
        const poster = clip.poster ? ` poster="${escapeHtml(clip.poster)}"` : "";
        return `<figure>
          <video controls preload="none" playsinline${poster}>
            <source src="${escapeHtml(clip.src)}" type="video/mp4" />
          </video>
          <figcaption>${escapeHtml(clip.caption)}
            <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a>
          </figcaption>
        </figure>`;
      }).join("");
    });
  }

  /* --- chart 1: the same model, eight published numbers -------------------- */
  function renderSpread() {
    const host = $('[data-chart="spread"]');
    if (!host) return;
    charts.mount(host, (container) => {
      charts.horizontalBars(container, {
        unit: "%",
        max: 100,
        axisLabel: "Success rate (%)",
        rows: data.spread.map((row) => ({
          label: row.label,
          value: row.value,
          color: cls(src(row.src).cls).color,
          title: `${src(row.src).name} - ${row.note}`
        }))
      });
    });
  }

  /* --- chart 2: capability axes -------------------------------------------- */
  function renderDimensions() {
    const host = $('[data-chart="dimensions"]');
    if (!host) return;
    charts.mount(host, (container) => {
      charts.dimensionGrid(container, {
        dims: data.dimensions.dims,
        rows: data.dimensions.rows,
        unit: "%",
        max: 50,
        axisLabel: "Bar length is relative to 50%"
      });
    });
  }

  /* --- chart 3: the in-context-learning disagreement ----------------------- */
  function renderIcl() {
    const host = $('[data-chart="icl"]');
    if (!host) return;
    charts.mount(host, (container) => {
      charts.horizontalBars(container, {
        unit: "%",
        max: 100,
        axisLabel: "Success rate (%)",
        rows: data.icl.rows.map((row) => ({
          label: row.label,
          value: row.value,
          color: cls(src(row.src).cls).color,
          title: `${src(row.src).name} - ${row.note}`
        }))
      });
    });
  }

  /* --- chart 4: robustness to unannounced changes -------------------------- */
  function renderRobustness() {
    const host = $('[data-chart="robustness"]');
    if (!host) return;
    charts.mount(host, (container) => {
      charts.horizontalBars(container, {
        unit: "%",
        max: 120,
        axisLabel: "Layouts solved (%)",
        rows: data.robustness.rows.map((row) => ({
          label: row.label,
          value: row.value,
          color: cls("benchmark").color,
          suffix: `(${row.n})`,
          title: `${row.n} layouts. ${row.cost}`
        }))
      });
    });
  }

  /* --- chart 5: hybrid vs direct on a shared subset ------------------------ */
  function renderHybridBoard() {
    const host = $('[data-chart="hybridBoard"]');
    if (!host) return;
    charts.mount(host, (container) => {
      charts.horizontalBars(container, {
        unit: "",
        max: 70,
        axisLabel: "Mean RoboDojo Score",
        rows: data.hybridBoard.rows.map((row) => ({
          label: row.label,
          value: row.value,
          color: row.highlight ? cls("report").color : "#aeb7bd",
          dim: !row.highlight,
          title: `Score ${row.value}, success rate ${row.sr}%`
        }))
      });
    });
  }

  /* --- disagreements -------------------------------------------------------
     The one section on this page that no single source could supply.         */
  function renderDisagreements() {
    const host = $("[data-disagreements]");
    if (!host) return;
    host.innerHTML = data.disagreements.map((item, index) => {
      const rows = item.rows.map((row) => {
        const klass = cls(src(row.src).cls);
        return `<li>
            <span class="claim-who" style="border-color:${klass.color};color:${klass.color}">${escapeHtml(row.who)}</span>
            <p>${escapeHtml(row.says)}</p>
          </li>`;
      }).join("");
      return `<article class="disagreement">
        <p class="disagreement-index">${String(index + 1).padStart(2, "0")}</p>
        <h3>${escapeHtml(item.q)}</h3>
        <p class="disagreement-verdict">${escapeHtml(item.verdict)}</p>
        <ul class="claim-list">${rows}</ul>
        <p class="disagreement-reading"><strong>Reading it:</strong> ${item.reading}</p>
      </article>`;
    }).join("");
  }

  /* --- source cards and the closing list ----------------------------------- */
  function renderSourceCards() {
    const host = $("[data-source-cards]");
    if (!host) return;
    host.innerHTML = Object.keys(data.sources).map((id) => {
      const source = data.sources[id];
      const klass = cls(source.cls);
      return `<li>
        <span class="source-tag" style="border-color:${klass.color};color:${klass.color}">${escapeHtml(klass.label)}</span>
        <p><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a></p>
        <p class="source-meta">${escapeHtml(source.authors)} &middot; read ${escapeHtml(source.retrieved)}</p>
        <p class="source-meta"><strong>Harness:</strong> ${escapeHtml(source.harness)}</p>
        <p class="source-meta"><strong>Scope:</strong> ${escapeHtml(source.scope)}</p>
      </li>`;
    }).join("");
  }

  function renderGaps() {
    const host = $("[data-gaps]");
    if (!host) return;
    host.innerHTML = data.gaps.map((gap) => `<li>${escapeHtml(gap)}</li>`).join("");
  }

  function renderStamp() {
    $$("[data-retrieved]").forEach((node) => {
      node.textContent = `All figures read off the sources themselves on ${data.meta.retrieved}.`;
    });
  }

  renderClassKey();
  renderTables();
  renderVideos();
  renderSpread();
  renderDimensions();
  renderIcl();
  renderRobustness();
  renderHybridBoard();
  renderDisagreements();
  renderSourceCards();
  renderGaps();
  renderStamp();
})();
