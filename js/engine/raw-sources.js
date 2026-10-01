/* =============================================================================
   PhAIL - raw sources -> Ledger rows (no markup)
   -----------------------------------------------------------------------------
   Live boards are not transcribed. Each is saved as the file its operator
   serves (data/raw/<id>.js, listed in data/raw/sources.js), and this file
   parses it into the rows of its Ledger table when a page loads - before any
   page script reads the Ledger. Updating a board = saving its file again.

   What a Ledger table still holds by hand is identity, not numbers:
     entrants    board entry -> our model id, plus a variant or note where one
                 is needed ("<display name> | <submitter>" for RoboChallenge,
                 the board's model slug for PAW)
     submitters  a board's account name -> the name we print
   An entrant the table does not know yet still gets a row, under a new model
   marked `unmapped`; the Checks tab lists it so it can be mapped.

   Load order on a page: data/ledger.js, data/raw/sources.js, data/raw/*.js,
   then this file.
   ========================================================================== */

(function (root) {
  const round = (value, digits) => Number(value.toFixed(digits === undefined ? 4 : digits));
  const pct = (share) => (typeof share === "number" ? round(100 * share) : null);

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
    }
  };

  /* --- one table's rows from its file ---------------------------------------------------------- */
  function rowsFor(group, source, file) {
    const entries = parsers[source.parser](file.text);
    const entrants = group.entrants || {};
    const submitters = group.submitters || {};
    const unmapped = [];
    const rows = entries.map((entry) => {
      let who = entrants[entry.key];
      if (!who) {
        who = { model: `${source.id}:${entry.key}`.toLowerCase().replace(/[^a-z0-9]+/g, "_") };
        unmapped.push({ key: entry.key, name: entry.name, account: entry.account, model: who.model });
      }
      const row = { model: who.model };
      Object.keys(entry.values).forEach((field) => { if (entry.values[field] !== null) row[field] = entry.values[field]; });
      if (entry.account !== undefined) row.submitter = submitters[entry.account] || entry.account;
      const variant = who.variant !== undefined ? who.variant : entry.multiTask ? "generalist" : undefined;
      if (variant) row.variant = variant;
      if (who.note) row.note = who.note;
      return row;
    });
    return { rows: rows, unmapped: unmapped, entries: entries.length };
  }

  const report = [];

  /* Fill every raw-fed Ledger table. Safe to call once per page load. */
  function apply(db) {
    const raw = root.phailRaw;
    if (!db || !raw || !raw.sources) return;
    raw.sources.forEach((source) => {
      const group = db.resultGroups.filter((item) => item.id === source.group)[0];
      const file = raw.files && raw.files[source.id];
      const entry = { source: source, group: group, file: file, unmapped: [], rows: 0, typedRows: group ? group.rows.length : 0, error: null };
      report.push(entry);
      if (!group) { entry.error = `no Ledger table "${source.group}"`; return; }
      if (!file) { entry.error = `data/raw/${source.id}.js is not loaded`; return; }
      try {
        const result = rowsFor(group, source, file);
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
      report.filter((entry) => entry.error).map((entry) => `${entry.source.id}: ${entry.error}`)));

    const sizes = sources.filter((source) => raw.files[source.id]).filter((source) => {
      const file = raw.files[source.id];
      const bytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(file.text).length : file.text.length;
      return bytes !== file.bytes;
    }).map((source) => source.id);
    out.push(item("Raw files are as downloaded (byte count unchanged since saving)", !sizes.length, "", sizes));

    const unmapped = [].concat.apply([], report.map((entry) => entry.unmapped.map((u) => `${entry.source.id}: "${u.key}" -> shown as ${u.model}`)));
    out.push(item("Every board entry is mapped to a model (entrants in data/ledger.js)", !unmapped.length, "", unmapped, true));

    const typed = report.filter((entry) => entry.typedRows).map((entry) => `${entry.source.group}: ${entry.typedRows} rows typed in data/ledger.js`);
    out.push(item("Raw-fed tables carry no typed rows (rows: [] in data/ledger.js)", !typed.length, `${report.reduce((total, entry) => total + entry.rows, 0)} rows from ${report.filter((entry) => entry.rows).length} files`, typed));

    const today = new Date();
    const old = sources.filter((source) => !source.frozen && raw.files[source.id]).map((source) => ({ id: source.id, days: Math.floor((today - new Date(raw.files[source.id].fetched.replace(" ", "T"))) / 86400000) }))
      .filter((entry) => entry.days > 14).map((entry) => `${entry.id}: downloaded ${entry.days} days ago`);
    out.push(item("Live boards were downloaded in the last 14 days", !old.length, sources.filter((source) => raw.files[source.id]).map((source) => `${source.id} ${raw.files[source.id].fetched}`).join(" · "), old, true));
    return out;
  }

  root.phailRawSources = { parsers: parsers, rowsFor: rowsFor, apply: apply, checks: checks, report: report };
  if (root.phailDatabase) apply(root.phailDatabase);
})(typeof window !== "undefined" ? window : this);
