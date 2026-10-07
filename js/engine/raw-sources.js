/* =============================================================================
   PhAIL - raw sources -> Ledger rows (no markup)
   -----------------------------------------------------------------------------
   Live boards are not transcribed. Each is saved as the file its operator
   serves (data/raw/<id>.js, listed in data/raw/sources.js), and this file
   parses it into the rows of its Ledger table when a page loads - before any
   page script reads the Ledger. Updating a board = saving its file again.

   A source normally feeds one table (`group`); a page holding several
   tables lists them in `groups`, and its parser is told which one to read.

   What a Ledger table still holds by hand is identity, not numbers:
     entrants    board entry -> our model id, plus a variant or note where one
                 is needed ("<display name> | <submitter>" for RoboChallenge,
                 the board's model slug for PAW, "<team> | <affiliation>"
                 for the RSS 2026 challenge)
     variant     optional, on the table: a label every row of it carries
                 (e.g. the challenge's multi-task track = "generalist")
     entrantPatterns  optional: [regex, { model }] pairs for boards with too
                 many free-text entries to list (CADGenBench submissions);
                 a name matching two models is skipped
     dropUnmapped     optional: entries no entrant or pattern names are left
                 out instead of shown as `unmapped`
     bestPerModel     optional: one row per model, its best (`entries` says
                 how many it was chosen from)
   An entrant may carry `harness` ("baseline" | "custom" | "product"); an
   index board can then admit only some harnesses (data/ranking-cad.js).
     submitters  a board's account name -> the name we print
   An entrant the table does not know yet still gets a row, under a new model
   marked `unmapped`; the Checks tab lists it so it can be mapped.

   Load order on a page: data/ledger.js, data/raw/sources.js, data/raw/*.js,
   then this file.
   ========================================================================== */

(function (root) {
  const round = (value, digits) => Number(value.toFixed(digits === undefined ? 4 : digits));
  const pct = (share) => (typeof share === "number" ? round(100 * share) : null);
  const decodeHtml = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  /* a table cell as text: tags and React's <!-- --> markers dropped, spaces collapsed */
  const plainText = (cell) => decodeHtml(cell.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const numberIn = (text) => { const m = /-?\d[\d,]*\.?\d*/.exec(String(text)); return m ? Number(m[0].replace(/,/g, "")) : null; };

  /* --- parsers: file text -> [{ key, name, values }] -------------------------------------- */
  const parsers = {
    /* RoboChallenge API: a list, or { leaderboard_all: list } for competitions */
    robochallenge: (text) => {
      const data = JSON.parse(text);
      const list = Array.isArray(data) ? data : data.leaderboard_all;
      return list.map((entry) => {
        const tasks = typeof entry.task_count === "number" ? entry.task_count : entry.total_completed_task_count;
        const values = { success: pct(entry.success_ratio), score: round(entry.score) };
        if (typeof tasks === "number") values.tasks = tasks;
        return { key: `${entry.display_name} | ${entry.user_name}`, name: entry.display_name, account: entry.user_name, multiTask: entry.is_multi_task_model === true, values: values };
      });
    },

    /* Poke & Wiggle: each score cell carries data-readings JSON; columns
       avg, d10/d100/d300, nominal, interpolation and task-0..9 */
    paw: (text) => {
      const decode = (value) => value.replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
      const rows = [];
      const table = (text.match(/<table[\s\S]*?<\/table>/) || [""])[0];
      const rowPattern = /<tr[^>]*data-model="([^"]+)"[\s\S]*?<\/tr>/g;
      let m;
      while ((m = rowPattern.exec(table))) {
        const html = m[0];
        const cells = {};
        const cellPattern = /data-score-column="([^"]+)"[^>]*?data-readings="([^"]*)"/g;
        let c;
        while ((c = cellPattern.exec(html))) {
          try { cells[c[1]] = JSON.parse(decode(c[2])); } catch (error) { cells[c[1]] = {}; }
        }
        const read = (column, metric, scale, sign) => {
          const cell = cells[column] && cells[column][metric];
          return cell && typeof cell.key === "number" ? round((sign || 1) * cell.key * (scale || 1)) : null;
        };
        const env = [];
        for (let i = 0; cells["task-" + i]; i += 1) env.push(read("task-" + i, "success", 100));
        const evals = html.match(/data-evaluation-count[^>]*>\s*([\d,]+)/);
        const name = html.match(/<a href="[^"]*">([^<]+)<\/a>/);
        rows.push({
          key: m[1],
          name: name ? name[1] : m[1],
          values: {
            success: read("avg", "success", 100), progress: read("avg", "progress", 100),
            d10: read("d10", "success", 100), d100: read("d100", "success", 100), d300: read("d300", "success", 100),
            nominal: read("nominal", "success", 100), interp: read("interpolation", "success", 100),
            env: env,
            quality: read("avg", "execution-quality", 100), timeS: read("avg", "execution-time", 1, -1),
            stepsPerMin: read("avg", "execution-speed"), sparc: read("avg", "smoothness"), jerk: read("avg", "jerk", 1, -1),
            safeFail: read("avg", "safe-failure", 100), forceN: read("avg", "contact-force", 1, -1),
            evals: evals ? Number(evals[1].replace(/,/g, "")) : null
          }
        });
      }
      return rows;
    },

    /* RSS 2026 Post-Training challenge page: four static tables, picked by
       select = "<phase>:<track>" (p1 = data-lb-pane, p2 = data-lb2-pane;
       single | multi). Cells after the team (and, in Phase 2, run) cell:
       score / SR for each task, then the average score / SR; "—" = not run. */
    rss26: (text, select) => {
      const decode = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").trim();
      const [phase, track] = (select || "p1:single").split(":");
      const pane = new RegExp(`data-${phase === "p2" ? "lb2" : "lb"}-pane="${track}"[\\s\\S]*?<tbody>([\\s\\S]*?)</tbody>`).exec(text);
      if (!pane) throw new Error(`no table for "${select}"`);
      const number = (cell) => { const m = /-?[\d.]+/.exec(cell.replace(/<[^>]+>/g, "")); return m ? Number(m[0]) : null; };
      const tasks = ["battery", "hanoi", "cap"];
      const rows = [];
      const rowPattern = /<tr class="lb-row[^"]*">([\s\S]*?)<\/tr>/g;
      let m;
      while ((m = rowPattern.exec(pane[1]))) {
        const html = m[1];
        const team = decode((html.match(/lb-team-name">([^<]+)</) || ["", ""])[1]);
        const affiliation = decode((html.match(/lb-model-name">([^<]+)</) || ["", ""])[1]);
        const trials = ((html.match(/lb-trials">trials:([^<]+)</) || ["", ""])[1]).split("/").map((part) => number(part));
        const run = (html.match(/lb-run-badge[^>]*>([^<]+)</) || [])[1];
        const cells = (html.match(/<td[^>]*>[\s\S]*?<\/td>/g) || [])
          .filter((cell) => !/class="lb-(rank|team|run)-cell"/.test(cell)).map(number);
        const values = { success: cells[7], score: cells[6], rollouts: trials.reduce((total, n) => total + (n || 0), 0) };
        tasks.forEach((task, index) => { values[task] = cells[2 * index + 1]; values[task + "Score"] = cells[2 * index]; });
        rows.push({ key: affiliation ? `${team} | ${affiliation}` : team, name: team, account: affiliation || undefined,
          variant: run && phase === "p2" ? decode(run) : undefined, values: values });
      }
      return rows;
    },

    /* Parametric CAD Bench: one server-rendered table. Columns: rank, model,
       agent (+ version), effort, Create, Create + Edit, Image-to-CAD,
       "Overall% ± 95% half-width", scored n/N, perfect n/N, run cost (USD). */
    paramcad: (text) => {
      const body = (text.match(/<tbody[\s\S]*?<\/tbody>/) || [""])[0];
      return (body.match(/<tr[\s\S]*?<\/tr>/g) || []).map((tr) => (tr.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []).map(plainText))
        .filter((cells) => cells.length >= 11).map((cells) => {
          const overall = /([\d.]+)%\s*±\s*([\d.]+)/.exec(cells[7]);
          const scored = /(\d+)\s*\/\s*(\d+)/.exec(cells[8]);
          const perfect = /(\d+)\s*\/\s*(\d+)/.exec(cells[9]);
          const cost = numberIn(cells[10]);
          return { key: cells[1], name: cells[1], variant: `${cells[2]}, ${cells[3]} effort`, values: {
            overall: overall ? Number(overall[1]) : null, se: overall ? round(Number(overall[2]) / 1.96) : null,
            create: numberIn(cells[4]), createEdit: numberIn(cells[5]), image: numberIn(cells[6]),
            scored: scored ? Number(scored[1]) : null, perfect: perfect ? Number(perfect[1]) : null,
            costPerTask: cost !== null && scored ? round(cost / Number(scored[2]), 2) : null } };
        });
    },

    /* CAD Arena: each row's bar carries "CAD Arena score s, 95 percent
       interval lo to hi, geometry g, editability e" (0-1). Columns after the
       bar: harness, cost per trial, tokens, turns, "n of 90" scored. */
    cadarena: (text) => {
      const body = (text.match(/<tbody[\s\S]*?<\/tbody>/) || [""])[0];
      return (body.match(/<tr[\s\S]*?<\/tr>/g) || []).map((tr) => {
        const label = /aria-label="CAD Arena score ([\d.]+), 95 percent interval ([\d.]+) to ([\d.]+)(?:, geometry ([\d.]+))?(?:, editability ([\d.]+))?"/.exec(tr);
        const who = /<span><span>([^<]+)<\/span><span>([^<]+)<\/span><\/span>/.exec(tr.replace(/ (class|style|title)="[^"]*"/g, ""));
        if (!label || !who) return null;
        const cells = (tr.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []).map(plainText);
        const scored = /(\d+)\s*of\s*(\d+)/.exec(cells[8] || "");
        const share = (value) => (value === undefined ? null : pct(Number(value)));
        return { key: `${decodeHtml(who[1])} | ${decodeHtml(who[2])}`, name: decodeHtml(who[1]), variant: cells[4] || undefined, values: {
          score: share(label[1]), se: round(100 * (Number(label[3]) - Number(label[2])) / 2 / 1.96),
          geometry: share(label[4]), editability: share(label[5]),
          costPerTrial: numberIn(cells[5]), turns: numberIn(cells[7]), scored: scored ? Number(scored[1]) : null } };
      }).filter(Boolean);
    },

    /* BenchCAD: the board's own JSON. select = "vision2code:regraded" (rows
       BenchCAD scored), "vision2code:vendor" (rows marked * - vendor-reported)
       or "codeedit". Shares become x100; control rows are labelled. */
    benchcad: (text, select) => {
      const data = JSON.parse(text);
      const [task, part] = (select || "vision2code:regraded").split(":");
      const table = data.tasks && data.tasks[task];
      if (!table) throw new Error(`no BenchCAD task "${task}"`);
      const effort = (think) => (!think ? undefined : /^(low|medium|high|xhigh|max|thinking)$/.test(think) ? `${think} effort` : think);
      if (task === "codeedit") {
        return table.rows.filter((row) => row.class !== "control").map((row) => ({ key: row.model,
          name: row.model, variant: row.thinking ? "thinking" : "no thinking", values: { accuracy: pct(row.accuracy) } }));
      }
      return table.rows.filter((row) => (part === "vendor") === (row.star === true)).map((row) => ({ key: row.model,
        name: row.model, variant: row.class === "control" ? `control: ${row.think}` : effort(row.think),
        values: { iou: pct(row.iou_score), iouTools: pct(row.iou_tools), exec: typeof row.exec === "number" ? row.exec : null } }));
    },

    /* CADBench (MIT): the board's leaderboard-data.json; select = "image" or
       "mesh" (the board's own split). IoU, SIoU and VSR are shares (x100);
       CD is Chamfer distance, lower is better. */
    cadbenchmit: (text, select) => {
      const data = JSON.parse(text);
      const entries = (metric) => ((data.metrics || {})[metric] || {})[`${select}_entries`] || [];
      const valueOf = (metric) => new Map(entries(metric).map((entry) => [entry.name, entry.value]));
      const siou = valueOf("siou");
      const vsr = valueOf("vsr");
      const cd = valueOf("cd");
      return entries("iou").map((entry) => ({ key: entry.name, name: entry.name, values: {
        iou: pct(entry.value), siou: pct(siou.get(entry.name)), vsr: pct(vsr.get(entry.name)),
        cd: typeof cd.get(entry.name) === "number" ? round(cd.get(entry.name)) : null } }));
    },

    /* CADGenBench: results.jsonl from the board's submissions dataset, one
       submission per line. select = "validated" (the organisers checked it by
       hand) or "submitted" (not validated; complete runs only - every one of
       the fixtures answered). Scores are shares (x100). A name with "Baseline
       with Build123d" is the board's own baseline harness. */
    cadgenbench: (text, select) => {
      const rows = [];
      text.split("\n").forEach((line) => {
        if (!line.trim()) return;
        const entry = JSON.parse(line);
        if ((entry.status || "completed") !== "completed" || typeof entry.aggregate_score !== "number") return;
        if ((select === "validated") !== (entry.validation_status === "validated")) return;
        const parts = entry.per_task_scores || {};
        const missing = Object.keys(parts).reduce((total, key) => total + (parts[key].n_missing || 0), 0);
        if (select === "submitted" && missing) return;
        const byType = entry.score_by_task_type || {};
        rows.push({ key: entry.submission_name, name: entry.submission_name, account: entry.submitter_name || undefined, variant: entry.submission_name,
          harness: /baseline with build123d/i.test(entry.submission_name) ? "baseline" : undefined,
          values: { score: pct(entry.aggregate_score), generation: pct(byType.generation), editing: pct(byType.editing),
            validity: pct(entry.validity_rate), submitted: (entry.submitted_at || "").slice(0, 10) || null } });
      });
      return rows;
    }
  };

  /* --- one table's rows from its file ---------------------------------------------------------- */
  function rowsFor(group, source, file, select) {
    const entries = parsers[source.parser](file.text, select);
    const entrants = group.entrants || {};
    const submitters = group.submitters || {};
    const unmapped = [];
    /* an entry no exact key names may match `entrantPatterns`; one that
       matches patterns for two different models is ambiguous and skipped */
    const patterns = (group.entrantPatterns || []).map(([pattern, who]) => [new RegExp(pattern, "i"), who]);
    const byPattern = (key) => {
      const hits = patterns.filter(([pattern]) => pattern.test(key)).map(([, who]) => who);
      return new Set(hits.map((who) => who.model)).size === 1 ? hits[0] : hits.length ? { skip: true } : null;
    };
    let rows = entries.map((entry) => {
      let who = entrants[entry.key] || byPattern(entry.key);
      if (who && who.skip) return null;
      if (!who) {
        if (group.dropUnmapped) return null;
        who = { model: `${source.id}:${entry.key}`.toLowerCase().replace(/[^a-z0-9]+/g, "_") };
        unmapped.push({ key: entry.key, name: entry.name, account: entry.account, model: who.model });
      }
      const row = { model: who.model };
      Object.keys(entry.values).forEach((field) => { if (entry.values[field] !== null) row[field] = entry.values[field]; });
      if (entry.account !== undefined) row.submitter = submitters[entry.account] || entry.account;
      const variant = who.variant !== undefined ? who.variant : entry.variant !== undefined ? entry.variant
        : group.variant !== undefined ? group.variant : entry.multiTask ? "generalist" : undefined;
      if (variant) row.variant = variant;
      const harness = who.harness || entry.harness;
      if (harness) row.harness = harness;
      if (who.note) row.note = who.note;
      return row;
    }).filter(Boolean);
    /* `bestPerModel`: keep each model's best row on the table's primary
       column, and count how many rows it was chosen from */
    if (group.bestPerModel) {
      const best = new Map();
      const count = new Map();
      rows.forEach((row) => {
        count.set(row.model, (count.get(row.model) || 0) + 1);
        const current = best.get(row.model);
        if (!current || row[group.primary] > current[group.primary]) best.set(row.model, row);
      });
      rows = Array.from(best.values()).map((row) => Object.assign(row, { entries: count.get(row.model) }));
    }
    return { rows: rows, unmapped: unmapped, entries: entries.length };
  }

  const report = [];

  /* Fill every raw-fed Ledger table. Safe to call once per page load. */
  function apply(db) {
    const raw = root.phailRaw;
    if (!db || !raw || !raw.sources) return;
    /* one pass per Ledger table: a source with `groups` feeds several */
    const targets = [].concat.apply([], raw.sources.map((source) => (source.groups
      ? Object.keys(source.groups).map((id) => ({ source: source, groupId: id, select: source.groups[id] }))
      : [{ source: source, groupId: source.group }])));
    targets.forEach(({ source, groupId, select }) => {
      const group = db.resultGroups.filter((item) => item.id === groupId)[0];
      const file = raw.files && raw.files[source.id];
      const entry = { source: source, groupId: groupId, group: group, file: file, unmapped: [], rows: 0, typedRows: group ? group.rows.length : 0, error: null };
      report.push(entry);
      if (!group) { entry.error = `no Ledger table "${groupId}"`; return; }
      if (!file) { entry.error = `data/raw/${source.id}.js is not loaded`; return; }
      try {
        const result = rowsFor(group, source, file, select);
        group.rows = result.rows;
        group.retrieved = file.fetched.slice(0, 10);
        group.rawSource = { id: source.id, url: source.url, fetched: file.fetched };
        entry.rows = result.rows.length;
        entry.unmapped = result.unmapped;
        result.unmapped.forEach((item) => {
          if (db.models.some((model) => model.id === item.model)) return;
          db.models.push({ id: item.model, name: item.name, maker: item.account ? `Submitted by ${item.account}` : "Not confirmed", org: "unconfirmed", unmapped: true,
            note: `New on ${source.id} since its entrants were last mapped; not yet matched to a known model.` });
        });
      } catch (error) {
        entry.error = String(error && error.message || error);
      }
    });
  }

  /* --- for the Checks tab ------------------------------------------------------------------------ */
  function checks(db) {
    const item = (name, ok, detail, list, softly) => ({ name: name, status: ok ? "pass" : softly ? "warn" : "fail", detail: detail || "", list: list || [] });
    const out = [];
    const raw = root.phailRaw || {};
    const sources = raw.sources || [];
    out.push(item("Every raw source file is loaded and parses", report.every((entry) => !entry.error), `${sources.length} sources`,
      report.filter((entry) => entry.error).map((entry) => `${entry.source.id} -> ${entry.groupId}: ${entry.error}`)));

    const sizes = sources.filter((source) => raw.files[source.id]).filter((source) => {
      const file = raw.files[source.id];
      const bytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(file.text).length : file.text.length;
      return bytes !== file.bytes;
    }).map((source) => source.id);
    out.push(item("Raw files are as downloaded (byte count unchanged since saving)", !sizes.length, "", sizes));

    const unmapped = [].concat.apply([], report.map((entry) => entry.unmapped.map((u) => `${entry.source.id}: "${u.key}" -> shown as ${u.model}`)));
    out.push(item("Every board entry is mapped to a model (entrants in data/ledger.js)", !unmapped.length, "", unmapped, true));

    const typed = report.filter((entry) => entry.typedRows).map((entry) => `${entry.groupId}: ${entry.typedRows} rows typed in data/ledger.js`);
    out.push(item("Raw-fed tables carry no typed rows (rows: [] in data/ledger.js)", !typed.length, `${report.reduce((total, entry) => total + entry.rows, 0)} rows in ${report.filter((entry) => entry.rows).length} tables`, typed));

    const today = new Date();
    const old = sources.filter((source) => !source.frozen && raw.files[source.id]).map((source) => ({ id: source.id, days: Math.floor((today - new Date(raw.files[source.id].fetched.replace(" ", "T"))) / 86400000) }))
      .filter((entry) => entry.days > 14).map((entry) => `${entry.id}: downloaded ${entry.days} days ago`);
    out.push(item("Live boards were downloaded in the last 14 days", !old.length, sources.filter((source) => raw.files[source.id]).map((source) => `${source.id} ${raw.files[source.id].fetched}`).join(" · "), old, true));
    return out;
  }

  root.phailRawSources = { parsers: parsers, rowsFor: rowsFor, apply: apply, checks: checks, report: report };
  if (root.phailDatabase) apply(root.phailDatabase);
})(typeof window !== "undefined" ? window : this);
