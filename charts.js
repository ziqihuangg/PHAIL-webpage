/* =============================================================================
   PhAIL - minimal SVG chart primitives
   -----------------------------------------------------------------------------
   No dependencies, no build step. Every chart measures its container, draws real
   pixels, and redraws on resize, so text stays at a readable size instead of
   being scaled by a viewBox.

   House rules baked in here:
     - one benchmark per chart, never a cross-benchmark average
     - columns are coloured by ORGANISATION, so one lab reads as one group; who
       produced the number stays on the record and appears in the hover panel
     - a reference row (human teleoperation) is drawn as a rule, not as a rival
   ========================================================================== */

(function () {
  const NS = "http://www.w3.org/2000/svg";

  const INK = "#14171b";
  const MUTED = "#66707a";
  const LINE = "#dfe3e6";
  const GRID = "#eceff1";

  function el(name, attrs, text) {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) {
      if (attrs[key] === null || attrs[key] === undefined) continue;
      node.setAttribute(key, String(attrs[key]));
    }
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgRoot(width, height) {
    const svg = el("svg", {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      role: "img",
      class: "phail-chart"
    });
    return svg;
  }

  function truncate(text, max) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  }

  function niceMax(value) {
    if (value <= 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const steps = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10];
    for (const step of steps) {
      if (value <= step * magnitude) return step * magnitude;
    }
    return 10 * magnitude;
  }

  function formatValue(value, unit) {
    if (value === null || value === undefined || Number.isNaN(value)) return "n/a";
    const digits = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2;
    const text = Number(value).toFixed(digits).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1");
    if (unit === "%") return text + "%";
    return text;
  }

  function readableInk(hex) {
    const value = parseInt(String(hex).replace("#", ""), 16);
    if (Number.isNaN(value)) return "#ffffff";
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.62 ? "#14171b" : "#ffffff";
  }

  function escapeHtml(text) {
    return String(text === undefined || text === null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* The badge under each column: the organisation's own logo on a white tile,
     falling back to a monogram in the organisation colour when we have no logo
     file for them. Logos live in logos/ and are referenced from the data file. */
  function orgBadge(org, cx, cy, size) {
    const group = el("g", { class: "chart-badge" });
    if (org && org.logo) {
      const inset = size * 0.14;
      group.appendChild(el("rect", {
        x: cx - size / 2, y: cy - size / 2, width: size, height: size, rx: 4,
        fill: "#ffffff", stroke: LINE, "stroke-width": 1
      }));
      group.appendChild(el("image", {
        href: org.logo,
        x: cx - size / 2 + inset, y: cy - size / 2 + inset,
        width: size - inset * 2, height: size - inset * 2,
        preserveAspectRatio: "xMidYMid meet"
      }));
      return group;
    }
    const color = (org && org.color) || MUTED;
    group.appendChild(el("rect", {
      x: cx - size / 2, y: cy - size / 2, width: size, height: size, rx: 4, fill: color
    }));
    const mark = (org && org.mark) || "?";
    group.appendChild(el("text", {
      x: cx, y: cy, "text-anchor": "middle", "dominant-baseline": "central",
      fill: readableInk(color),
      "font-size": mark.length > 2 ? size * 0.36 : size * 0.46,
      "font-weight": 700, class: "chart-badge-text"
    }, mark));
    return group;
  }

  /* --- vertical columns, the Artificial-Analysis shape ------------------------
     One column per model, organisation badge and model name underneath, a hover
     panel carrying the full record, and an optional click through to that model's
     rows in the ledger. Columns keep a minimum width and the surface scrolls
     sideways rather than squeezing a long leaderboard into an unreadable strip.
     --------------------------------------------------------------------------- */
  function verticalBars(container, options) {
    const rows = options.rows || [];
    if (!rows.length) return;

    const available = Math.max(container.clientWidth || 640, 300);
    const compact = available < 560;
    const top = 26;
    const plotHeight = options.plotHeight || (compact ? 200 : 290);
    const badgeSize = compact ? 18 : 22;
    const nameLimit = options.nameLimit || (compact ? 16 : 28);

    /* The model names sit at -48 degrees, so they spill left of and below their
       own column. Size the left gutter and the label strip from the longest name
       actually being drawn, instead of guessing a fixed inset and clipping. */
    const NAME_ANGLE = 48 * Math.PI / 180;
    const CHAR_WIDTH = 6.0;
    const textWidth = (text) => truncate(text, nameLimit).length * CHAR_WIDTH;
    const longest = Math.max(...rows.map((row) => textWidth(row.label)));
    const labelArea = options.labelArea || Math.ceil(badgeSize + 18 + longest * Math.sin(NAME_ANGLE) + 6);
    const right = 14;

    const firstSpill = textWidth(rows[0].label) * Math.cos(NAME_ANGLE);
    const naturalColGuess = (available - 46 - right) / rows.length;
    const left = Math.round(Math.min(Math.max(46, firstSpill - Math.max(options.minCol || 46, naturalColGuess) / 2 + 8), 132));

    const naturalCol = (available - left - right) / rows.length;
    const colWidth = Math.max(options.minCol || (compact ? 40 : 46), naturalCol);
    const plotWidth = colWidth * rows.length;
    const width = Math.round(left + right + plotWidth);
    const height = top + plotHeight + 10 + labelArea;
    const barWidth = Math.min(colWidth * 0.62, options.maxBar || 58);

    const values = rows.map((row) => (typeof row.value === "number" ? row.value : 0));
    const errors = rows.map((row) => row.error || 0);
    const max = options.max || niceMax(Math.max(...values.map((value, index) => value + errors[index]), 0.0001));
    const min = options.min !== undefined ? options.min : 0;
    const scale = (value) => top + plotHeight - ((value - min) / (max - min)) * plotHeight;

    /* Structure: surface > inner (svg + tooltip). The tooltip lives inside the
       scrolling content so it stays glued to its column. */
    container.style.position = "relative";
    const inner = document.createElement("div");
    inner.className = "chart-inner";
    inner.style.width = width + "px";
    container.appendChild(inner);

    const svg = svgRoot(width, height);
    inner.appendChild(svg);

    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    inner.appendChild(tooltip);

    const highlight = el("rect", {
      x: 0, y: top - 10, width: 0, height: plotHeight + 10,
      fill: INK, "fill-opacity": 0.05, "pointer-events": "none"
    });
    svg.appendChild(highlight);

    for (let i = 0; i <= 4; i += 1) {
      const value = min + ((max - min) / 4) * i;
      const y = scale(value);
      svg.appendChild(el("line", { x1: left, y1: y, x2: left + plotWidth, y2: y, stroke: i === 0 ? LINE : GRID }));
      svg.appendChild(el("text", { x: left - 8, y: y + 4, "text-anchor": "end", class: "chart-tick" }, formatValue(value, options.unit)));
    }

    const hoverLayer = el("g", {});

    rows.forEach((row, index) => {
      const columnX = left + index * colWidth;
      const centre = columnX + colWidth / 2;
      const value = typeof row.value === "number" ? row.value : min;
      const y = scale(value);
      const barHeight = Math.max(top + plotHeight - y, value > min ? 2 : 0);
      const color = row.color || (row.org && row.org.color) || INK;

      hoverLayer.appendChild(el("rect", {
        x: columnX, y: top - 10, width: colWidth, height: plotHeight + 10 + labelArea,
        fill: INK, "fill-opacity": 0, class: "chart-column-band"
      }));

      if (row.reference) {
        svg.appendChild(el("rect", {
          x: centre - barWidth / 2, y: y, width: barWidth, height: barHeight,
          fill: color, "fill-opacity": 0.25, stroke: color, "stroke-dasharray": "3 3"
        }));
      } else {
        svg.appendChild(el("rect", { x: centre - barWidth / 2, y: y, width: barWidth, height: barHeight, fill: color }));
      }

      let valueY = y - 7;
      if (row.error) {
        const high = scale(value + row.error);
        const low = scale(Math.max(value - row.error, min));
        svg.appendChild(el("line", { x1: centre, y1: high, x2: centre, y2: low, stroke: INK, "stroke-width": 1 }));
        svg.appendChild(el("line", { x1: centre - 4, y1: high, x2: centre + 4, y2: high, stroke: INK, "stroke-width": 1 }));
        svg.appendChild(el("line", { x1: centre - 4, y1: low, x2: centre + 4, y2: low, stroke: INK, "stroke-width": 1 }));
        valueY = high - 7;
      }

      svg.appendChild(el("text", {
        x: centre, y: Math.max(valueY, 11), "text-anchor": "middle", class: "chart-column-value"
      }, formatValue(row.value, options.unit)));

      const badgeY = top + plotHeight + 10 + badgeSize / 2 + 4;
      const badge = orgBadge(row.org, centre, badgeY, badgeSize);
      const badgeTitle = el("title", {});
      badgeTitle.textContent = (row.org && row.org.name) || "Affiliation not confirmed";
      badge.appendChild(badgeTitle);
      svg.appendChild(badge);

      const nameY = badgeY + badgeSize / 2 + 10;
      svg.appendChild(el("text", {
        x: centre, y: nameY,
        transform: "rotate(-48 " + centre + " " + nameY + ")",
        "text-anchor": "end", class: "chart-column-name"
      }, truncate(row.label, nameLimit)));
    });

    svg.appendChild(hoverLayer);

    function showTooltip(row, index) {
      const columnX = left + index * colWidth;
      highlight.setAttribute("x", columnX);
      highlight.setAttribute("width", colWidth);

      const org = row.org || {};
      const lines = (row.details || []).map(([label, text]) =>
        '<div class="chart-tooltip-row"><dt>' + escapeHtml(label) + '</dt><dd title="' + escapeHtml(text) + '">'
        + escapeHtml(String(text)) + "</dd></div>").join("");
      const badgeHtml = org.logo
        ? '<img class="chart-tooltip-logo" src="' + escapeHtml(org.logo) + '" alt="" />'
        : '<span class="chart-tooltip-swatch" style="background:' + escapeHtml(row.color || org.color || INK) + '"></span>';
      tooltip.innerHTML = '<div class="chart-tooltip-head">' + badgeHtml
        + "<strong>" + escapeHtml(row.label) + "</strong></div>"
        + '<p class="chart-tooltip-value">' + escapeHtml(formatValue(row.value, options.unit))
        + "<span>" + escapeHtml(options.valueLabel || "") + "</span></p>"
        + (lines ? '<dl class="chart-tooltip-list">' + lines + "</dl>" : "")
        + (row.href ? '<p class="chart-tooltip-foot">Click for every record from this model</p>' : "");

      tooltip.hidden = false;
      const tipWidth = tooltip.offsetWidth || 260;
      const tipHeight = tooltip.offsetHeight || 200;

      /* Sit beside the column rather than on top of it: to the right when there
         is room, otherwise to the left. The hovered bar always stays visible. */
      let x = columnX + colWidth + 10;
      if (x + tipWidth > width - 4) x = columnX - tipWidth - 10;
      x = Math.max(4, Math.min(x, width - tipWidth - 4));

      const barTop = scale(typeof row.value === "number" ? row.value : min);
      let y = barTop - tipHeight / 2;
      y = Math.max(2, Math.min(y, top + plotHeight - tipHeight));
      if (tipHeight > plotHeight) y = 2;

      tooltip.style.left = Math.round(x) + "px";
      tooltip.style.top = Math.round(y) + "px";
    }

    function hideTooltip() {
      tooltip.hidden = true;
      highlight.setAttribute("width", 0);
    }

    Array.prototype.forEach.call(hoverLayer.childNodes, (band, index) => {
      const row = rows[index];
      band.style.cursor = row.href ? "pointer" : "default";
      band.addEventListener("mouseenter", () => showTooltip(row, index));
      band.addEventListener("mouseleave", hideTooltip);
      if (row.href) band.addEventListener("click", () => { window.location.href = row.href; });
    });
    inner.addEventListener("mouseleave", hideTooltip);

    if (width > available + 2) {
      const hint = document.createElement("p");
      hint.className = "chart-scroll-hint";
      hint.textContent = "Scroll sideways for the rest of the board (" + rows.length + " entries).";
      container.appendChild(hint);
    }

    /* Colour legend: only organisations with more than one column, since those
       are the ones where a shared colour is actually saying something. */
    if (options.legend !== false) {
      const counts = new Map();
      rows.forEach((row) => {
        const key = (row.org && row.org.name) || "Affiliation not confirmed";
        const entry = counts.get(key) || {
          count: 0,
          color: row.color || (row.org && row.org.color) || INK,
          logo: row.org && row.org.logo
        };
        entry.count += 1;
        counts.set(key, entry);
      });
      const shared = Array.from(counts.entries())
        .filter((entry) => entry[1].count > 1)
        .sort((a, b) => b[1].count - a[1].count);
      if (shared.length) {
        const legend = document.createElement("ul");
        legend.className = "chart-legend";
        legend.innerHTML = shared.map((entry) =>
          '<li><span class="chart-legend-swatch" style="background:' + entry[1].color + '"></span>'
          + (entry[1].logo ? '<img class="chart-legend-logo" src="' + escapeHtml(entry[1].logo) + '" alt="" />' : "")
          + escapeHtml(entry[0]) + ' <span class="chart-legend-count">' + entry[1].count + "</span></li>").join("")
          + '<li class="chart-legend-note">' + escapeHtml(options.legendNote
            || "One colour per organisation; organisations with a single entry are named on their own badge.") + "</li>";
        container.appendChild(legend);
      }
    }
  }

  /* --- horizontal ranked bars ---------------------------------------------- */
  function horizontalBars(container, options) {
    const rows = options.rows || [];
    if (!rows.length) return;
    const width = Math.max(container.clientWidth || 640, 320);
    const compact = width < 560;
    const labelWidth = Math.min(Math.max(width * (compact ? 0.42 : 0.3), 118), 215);
    const valueWidth = compact ? 52 : 68;
    const rowHeight = compact ? 24 : 26;
    const gap = 6;
    const top = 26;
    const bottom = 26;
    const plotLeft = labelWidth + 10;
    const plotWidth = Math.max(width - plotLeft - valueWidth - 6, 60);
    const height = top + rows.length * (rowHeight + gap) + bottom;

    const svg = svgRoot(width, height);
    const values = rows.map((row) => row.value).filter((value) => typeof value === "number");
    const max = options.max || niceMax(Math.max(...values, 0.0001));

    /* axis */
    const ticks = 4;
    for (let i = 0; i <= ticks; i += 1) {
      const value = (max / ticks) * i;
      const x = plotLeft + (value / max) * plotWidth;
      svg.appendChild(el("line", { x1: x, y1: top - 8, x2: x, y2: height - bottom + 2, stroke: i === 0 ? LINE : GRID, "stroke-width": 1 }));
      if (!compact || i % 2 === 0) {
        svg.appendChild(el("text", { x: x, y: top - 13, "text-anchor": "middle", class: "chart-tick" }, formatValue(value, options.unit)));
      }
    }

    rows.forEach((row, index) => {
      const y = top + index * (rowHeight + gap);
      const value = typeof row.value === "number" ? row.value : 0;
      const barWidth = Math.max((value / max) * plotWidth, value > 0 ? 1.5 : 0);
      const color = row.color || INK;

      const label = el("text", { x: labelWidth, y: y + rowHeight * 0.66, "text-anchor": "end", class: row.reference ? "chart-label chart-label--ref" : "chart-label" });
      label.appendChild(el("tspan", {}, truncate(row.label, compact ? 20 : 30)));
      svg.appendChild(label);

      if (row.reference) {
        svg.appendChild(el("rect", { x: plotLeft, y: y, width: barWidth, height: rowHeight, fill: "none", stroke: color, "stroke-width": 1, "stroke-dasharray": "3 3" }));
      } else {
        svg.appendChild(el("rect", { x: plotLeft, y: y, width: barWidth, height: rowHeight, fill: color, "fill-opacity": row.dim ? 0.35 : 1 }));
      }

      svg.appendChild(el("text", {
        x: plotLeft + barWidth + 6,
        y: y + rowHeight * 0.66,
        class: "chart-value"
      }, formatValue(row.value, options.unit) + (row.suffix ? " " + row.suffix : "")));

      if (row.title) {
        const tip = el("title", {});
        tip.textContent = row.title;
        label.appendChild(tip);
      }
    });

    svg.appendChild(el("line", { x1: plotLeft, y1: height - bottom + 2, x2: plotLeft + plotWidth, y2: height - bottom + 2, stroke: LINE }));
    if (options.axisLabel) {
      svg.appendChild(el("text", { x: plotLeft, y: height - 8, class: "chart-axis" }, options.axisLabel));
    }
    container.appendChild(svg);
  }

  /* --- paired bars (e.g. clean scene vs randomised scene) ------------------- */
  function pairedBars(container, options) {
    const rows = options.rows || [];
    if (!rows.length) return;
    const width = Math.max(container.clientWidth || 640, 320);
    const compact = width < 560;
    const labelWidth = Math.min(Math.max(width * (compact ? 0.4 : 0.28), 112), 215);
    const valueWidth = compact ? 60 : 84;
    const barHeight = 11;
    const rowHeight = barHeight * 2 + 5;
    const gap = 9;
    const top = 26;
    const bottom = 26;
    const plotLeft = labelWidth + 10;
    const plotWidth = Math.max(width - plotLeft - valueWidth - 6, 60);
    const height = top + rows.length * (rowHeight + gap) + bottom;
    const max = options.max || 100;

    const svg = svgRoot(width, height);
    for (let i = 0; i <= 4; i += 1) {
      const value = (max / 4) * i;
      const x = plotLeft + (value / max) * plotWidth;
      svg.appendChild(el("line", { x1: x, y1: top - 8, x2: x, y2: height - bottom + 2, stroke: i === 0 ? LINE : GRID }));
      if (!compact || i % 2 === 0) {
        svg.appendChild(el("text", { x: x, y: top - 13, "text-anchor": "middle", class: "chart-tick" }, formatValue(value, options.unit)));
      }
    }

    rows.forEach((row, index) => {
      const y = top + index * (rowHeight + gap);
      const aWidth = Math.max((row.a / max) * plotWidth, row.a > 0 ? 1.5 : 0);
      const bWidth = Math.max((row.b / max) * plotWidth, row.b > 0 ? 1.5 : 0);
      svg.appendChild(el("text", { x: labelWidth, y: y + rowHeight * 0.62, "text-anchor": "end", class: "chart-label" }, truncate(row.label, compact ? 18 : 28)));
      svg.appendChild(el("rect", { x: plotLeft, y: y, width: aWidth, height: barHeight, fill: options.colorA }));
      svg.appendChild(el("rect", { x: plotLeft, y: y + barHeight + 5, width: bWidth, height: barHeight, fill: options.colorB }));
      svg.appendChild(el("text", {
        x: plotLeft + Math.max(aWidth, bWidth) + 6,
        y: y + rowHeight * 0.62,
        class: "chart-value"
      }, formatValue(row.a, options.unit) + " / " + formatValue(row.b, options.unit)));
    });

    if (options.axisLabel) {
      svg.appendChild(el("text", { x: plotLeft, y: height - 8, class: "chart-axis" }, options.axisLabel));
    }
    container.appendChild(svg);
  }

  /* --- scatter -------------------------------------------------------------- */
  function scatter(container, options) {
    const points = options.points || [];
    if (!points.length) return;
    const width = Math.max(container.clientWidth || 640, 320);
    const compact = width < 560;
    const height = options.height || (compact ? 320 : 400);
    const left = 54;
    const right = 16;
    const top = 18;
    const bottom = 46;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const xMax = options.xMax || niceMax(Math.max(...points.map((p) => p.x)));
    const xMin = options.xMin || 0;
    const yMax = options.yMax || niceMax(Math.max(...points.map((p) => p.y)));
    const yMin = options.yMin || 0;
    const scaleX = (value) => left + ((value - xMin) / (xMax - xMin)) * plotWidth;
    const scaleY = (value) => top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

    const svg = svgRoot(width, height);
    for (let i = 0; i <= 4; i += 1) {
      const yValue = yMin + ((yMax - yMin) / 4) * i;
      const y = scaleY(yValue);
      svg.appendChild(el("line", { x1: left, y1: y, x2: left + plotWidth, y2: y, stroke: i === 0 ? LINE : GRID }));
      svg.appendChild(el("text", { x: left - 8, y: y + 4, "text-anchor": "end", class: "chart-tick" }, formatValue(yValue, options.yUnit)));
      const xValue = xMin + ((xMax - xMin) / 4) * i;
      const x = scaleX(xValue);
      svg.appendChild(el("line", { x1: x, y1: top, x2: x, y2: top + plotHeight, stroke: i === 0 ? LINE : GRID }));
      svg.appendChild(el("text", { x: x, y: top + plotHeight + 18, "text-anchor": "middle", class: "chart-tick" }, formatValue(xValue, options.xUnit)));
    }

    if (options.diagonal) {
      const limit = Math.min(xMax, yMax);
      svg.appendChild(el("line", {
        x1: scaleX(xMin), y1: scaleY(yMin), x2: scaleX(limit), y2: scaleY(limit),
        stroke: MUTED, "stroke-dasharray": "4 4", "stroke-width": 1
      }));
      if (options.diagonalLabel) {
        svg.appendChild(el("text", { x: scaleX(limit) - 6, y: scaleY(limit) + 15, "text-anchor": "end", class: "chart-annotation" }, options.diagonalLabel));
      }
    }

    points.forEach((point) => {
      const x = scaleX(point.x);
      const y = scaleY(point.y);
      const node = el("circle", { cx: x, cy: y, r: point.reference ? 5 : 4.5, fill: point.color || INK, "fill-opacity": 0.85, stroke: "#fff", "stroke-width": 1 });
      const tip = el("title", {});
      tip.textContent = point.title || point.label;
      node.appendChild(tip);
      svg.appendChild(node);
      if (point.label && !point.hideLabel) {
        const text = truncate(point.label, compact ? 14 : 22);
        /* flip the label inside the frame when it would run off the right edge */
        const flip = x + 8 + text.length * 6.4 > width - 4;
        svg.appendChild(el("text", {
          x: flip ? x - 8 : x + 8,
          y: y + 3.5,
          "text-anchor": flip ? "end" : "start",
          class: "chart-point-label"
        }, text));
      }
    });

    if (options.xLabel) {
      svg.appendChild(el("text", { x: left + plotWidth / 2, y: height - 8, "text-anchor": "middle", class: "chart-axis" }, options.xLabel));
    }
    if (options.yLabel) {
      svg.appendChild(el("text", { x: 12, y: top + plotHeight / 2, "text-anchor": "middle", transform: `rotate(-90 12 ${top + plotHeight / 2})`, class: "chart-axis" }, options.yLabel));
    }
    container.appendChild(svg);
  }

  /* --- score with uncertainty whiskers (RoboArena) --------------------------- */
  function barsWithError(container, options) {
    const rows = options.rows || [];
    if (!rows.length) return;
    const width = Math.max(container.clientWidth || 640, 320);
    const compact = width < 560;
    const labelWidth = Math.min(Math.max(width * (compact ? 0.42 : 0.3), 120), 240);
    const valueWidth = compact ? 74 : 96;
    const rowHeight = compact ? 22 : 24;
    const gap = 8;
    const top = 26;
    const bottom = 26;
    const plotLeft = labelWidth + 10;
    const plotWidth = Math.max(width - plotLeft - valueWidth - 6, 60);
    const height = top + rows.length * (rowHeight + gap) + bottom;
    const min = options.min !== undefined ? options.min : 0;
    const max = options.max || niceMax(Math.max(...rows.map((row) => row.value + (row.error || 0))));
    const scale = (value) => plotLeft + ((value - min) / (max - min)) * plotWidth;

    const svg = svgRoot(width, height);
    for (let i = 0; i <= 4; i += 1) {
      const value = min + ((max - min) / 4) * i;
      const x = scale(value);
      svg.appendChild(el("line", { x1: x, y1: top - 8, x2: x, y2: height - bottom + 2, stroke: i === 0 ? LINE : GRID }));
      svg.appendChild(el("text", { x: x, y: top - 13, "text-anchor": "middle", class: "chart-tick" }, formatValue(value, options.unit)));
    }

    rows.forEach((row, index) => {
      const y = top + index * (rowHeight + gap);
      const barEnd = scale(row.value);
      svg.appendChild(el("text", { x: labelWidth, y: y + rowHeight * 0.68, "text-anchor": "end", class: "chart-label" }, truncate(row.label, compact ? 18 : 28)));
      svg.appendChild(el("rect", { x: plotLeft, y: y, width: Math.max(barEnd - plotLeft, 1), height: rowHeight, fill: row.color || INK }));
      if (row.error) {
        const low = scale(row.value - row.error);
        const high = scale(row.value + row.error);
        const mid = y + rowHeight / 2;
        svg.appendChild(el("line", { x1: low, y1: mid, x2: high, y2: mid, stroke: INK, "stroke-width": 1 }));
        svg.appendChild(el("line", { x1: low, y1: mid - 4, x2: low, y2: mid + 4, stroke: INK, "stroke-width": 1 }));
        svg.appendChild(el("line", { x1: high, y1: mid - 4, x2: high, y2: mid + 4, stroke: INK, "stroke-width": 1 }));
      }
      svg.appendChild(el("text", { x: Math.max(barEnd, scale(row.value + (row.error || 0))) + 6, y: y + rowHeight * 0.68, class: "chart-value" },
        formatValue(row.value, options.unit) + (row.error ? " ±" + formatValue(row.error, "") : "")));
    });

    if (options.axisLabel) {
      svg.appendChild(el("text", { x: plotLeft, y: height - 8, class: "chart-axis" }, options.axisLabel));
    }
    container.appendChild(svg);
  }

  /* --- small multiples: one mini bar row per capability dimension ------------ */
  function dimensionGrid(container, options) {
    const rows = options.rows || [];
    const dims = options.dims || [];
    if (!rows.length || !dims.length) return;
    const width = Math.max(container.clientWidth || 640, 320);
    const compact = width < 620;
    const labelWidth = Math.min(Math.max(width * (compact ? 0.34 : 0.24), 100), 200);
    const cellGap = 8;
    const cellWidth = Math.max((width - labelWidth - 10 - cellGap * (dims.length - 1)) / dims.length, 26);
    const rowHeight = compact ? 20 : 22;
    const gap = 5;
    const top = 44;
    const height = top + rows.length * (rowHeight + gap) + 18;
    const max = options.max || niceMax(Math.max(...rows.flatMap((row) => row.values)));

    const svg = svgRoot(width, height);
    dims.forEach((dim, index) => {
      const x = labelWidth + 10 + index * (cellWidth + cellGap);
      /* Budget the header to the cell it sits over, not to a fixed character
         count: on a narrow screen five columns leave ~40px each, and an 8-char
         header spills past the right edge of the last one. */
      const headLimit = Math.max(4, Math.floor(cellWidth / 6.8));
      svg.appendChild(el("text", { x: x, y: top - 24, class: "chart-tick chart-tick--head" }, truncate(dim, Math.min(headLimit, compact ? 8 : 16))));
      svg.appendChild(el("line", { x1: x, y1: top - 16, x2: x + cellWidth, y2: top - 16, stroke: LINE }));
    });

    rows.forEach((row, rowIndex) => {
      const y = top + rowIndex * (rowHeight + gap);
      svg.appendChild(el("text", { x: labelWidth, y: y + rowHeight * 0.72, "text-anchor": "end", class: row.reference ? "chart-label chart-label--ref" : "chart-label" }, truncate(row.label, compact ? 16 : 24)));
      row.values.forEach((value, index) => {
        const x = labelWidth + 10 + index * (cellWidth + cellGap);
        const barWidth = Math.max((value / max) * cellWidth, value > 0 ? 1 : 0);
        svg.appendChild(el("rect", { x: x, y: y + 2, width: cellWidth, height: rowHeight - 4, fill: GRID }));
        const bar = el("rect", { x: x, y: y + 2, width: barWidth, height: rowHeight - 4, fill: row.color || INK, "fill-opacity": row.reference ? 0.35 : 1 });
        const tip = el("title", {});
        tip.textContent = `${row.label} - ${dims[index]}: ${formatValue(value, options.unit)}`;
        bar.appendChild(tip);
        svg.appendChild(bar);
      });
    });

    svg.appendChild(el("text", { x: labelWidth + 10, y: height - 4, class: "chart-axis" }, options.axisLabel || `Bar length is relative to ${formatValue(max, options.unit)}`));
    container.appendChild(svg);
  }

  /* --- slope: the same model read off two different boards ------------------ */
  function slope(container, options) {
    const series = options.series || [];
    if (!series.length) return;
    const width = Math.max(container.clientWidth || 640, 320);
    const compact = width < 560;
    const height = options.height || 300;
    const top = 34;
    const bottom = 42;
    const left = compact ? 84 : 132;
    const right = compact ? 104 : 168;
    const plotHeight = height - top - bottom;
    const svg = svgRoot(width, height);
    const leftX = left;
    const rightX = width - right;
    const scale = (value) => top + plotHeight - (value / 100) * plotHeight;

    /* Slope charts bunch up wherever the field bunches up, which on these boards
       is near zero. Nudge overlapping labels apart and draw a leader line back to
       the point they belong to, rather than stacking unreadable text. */
    function declutter(entries, minGap) {
      const sorted = entries.slice().sort((a, b) => a.y - b.y);
      for (let i = 1; i < sorted.length; i += 1) {
        if (sorted[i].labelY - sorted[i - 1].labelY < minGap) {
          sorted[i].labelY = sorted[i - 1].labelY + minGap;
        }
      }
      const overflow = sorted.length ? sorted[sorted.length - 1].labelY - (top + plotHeight) : 0;
      if (overflow > 0) {
        sorted.forEach((entry) => { entry.labelY -= overflow; });
        for (let i = sorted.length - 2; i >= 0; i -= 1) {
          if (sorted[i + 1].labelY - sorted[i].labelY < minGap) {
            sorted[i].labelY = sorted[i + 1].labelY - minGap;
          }
        }
      }
      return sorted;
    }

    const entries = series.map((item) => ({
      item,
      y1: scale(item.left),
      y2: scale(item.right),
      leftLabelY: scale(item.left) + 4,
      rightLabelY: scale(item.right) + 4
    }));
    declutter(entries.map((entry) => ({ y: entry.y1, get labelY() { return entry.leftLabelY; }, set labelY(v) { entry.leftLabelY = v; } })), 13);
    declutter(entries.map((entry) => ({ y: entry.y2, get labelY() { return entry.rightLabelY; }, set labelY(v) { entry.rightLabelY = v; } })), 13);

    svg.appendChild(el("text", { x: leftX, y: top - 14, "text-anchor": "middle", class: "chart-tick chart-tick--head" }, options.leftLabel || ""));
    svg.appendChild(el("text", { x: rightX, y: top - 14, "text-anchor": "middle", class: "chart-tick chart-tick--head" }, options.rightLabel || ""));
    svg.appendChild(el("line", { x1: leftX, y1: top, x2: leftX, y2: top + plotHeight, stroke: LINE }));
    svg.appendChild(el("line", { x1: rightX, y1: top, x2: rightX, y2: top + plotHeight, stroke: LINE }));

    entries.forEach((entry) => {
      const { item, y1, y2 } = entry;
      const color = item.color || INK;
      svg.appendChild(el("line", { x1: leftX, y1: y1, x2: rightX, y2: y2, stroke: color, "stroke-width": 1.5, "stroke-opacity": 0.7 }));
      svg.appendChild(el("circle", { cx: leftX, cy: y1, r: 3.5, fill: color }));
      svg.appendChild(el("circle", { cx: rightX, cy: y2, r: 3.5, fill: color }));

      if (Math.abs(entry.leftLabelY - y1) > 1.5) {
        svg.appendChild(el("line", { x1: leftX - 5, y1: y1, x2: leftX - 11, y2: entry.leftLabelY - 3.5, stroke: color, "stroke-opacity": 0.4 }));
      }
      if (Math.abs(entry.rightLabelY - y2) > 1.5) {
        svg.appendChild(el("line", { x1: rightX + 5, y1: y2, x2: rightX + 11, y2: entry.rightLabelY - 3.5, stroke: color, "stroke-opacity": 0.4 }));
      }

      svg.appendChild(el("text", { x: leftX - 13, y: entry.leftLabelY, "text-anchor": "end", class: "chart-point-label" }, formatValue(item.left, "%")));
      svg.appendChild(el("text", { x: rightX + 13, y: entry.rightLabelY, class: "chart-point-label" },
        `${formatValue(item.right, "%")} ${truncate(item.label, compact ? 10 : 16)}`));
    });

    svg.appendChild(el("text", { x: width / 2, y: height - 10, "text-anchor": "middle", class: "chart-axis" }, options.axisLabel || ""));
    container.appendChild(svg);
  }

  /* --- mount helper: redraw when the container changes width ------------------
     A ResizeObserver rather than a window listener, because the container can
     change width without the window doing so (a sidebar, a zoom, a device
     emulator). The window listener stays as a fallback for older browsers.
     --------------------------------------------------------------------------- */
  let mounted = [];
  const observer = typeof ResizeObserver === "function"
    ? new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const record = mounted.find((item) => item.container === entry.target);
          if (!record) return;
          const width = Math.round(entry.contentRect.width);
          if (width === record.width || width === 0) return;
          record.width = width;
          record.render();
        });
      })
    : null;

  function mount(container, draw) {
    if (!container) return;
    const record = {
      container,
      width: Math.round(container.clientWidth),
      render: () => {
        container.innerHTML = "";
        draw(container);
      }
    };
    record.render();
    mounted.push(record);
    if (observer) observer.observe(container);
  }

  /* Pages that re-render a chart in place (the Tasks ledger) call this first so
     observers and handlers do not pile up one per filter change. */
  function resetMounts() {
    if (observer) mounted.forEach((record) => observer.unobserve(record.container));
    mounted = [];
  }

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => mounted.forEach((record) => {
      record.width = Math.round(record.container.clientWidth);
      record.render();
    }), 180);
  });

  window.phailCharts = {
    verticalBars,
    horizontalBars,
    pairedBars,
    scatter,
    barsWithError,
    dimensionGrid,
    slope,
    mount,
    resetMounts,
    formatValue,
    colors: { ink: INK, muted: MUTED, line: LINE, grid: GRID }
  };
})();
