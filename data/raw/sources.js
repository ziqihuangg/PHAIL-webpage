/* =============================================================================
   PhAIL - raw sources: the files the Ledger's live-board tables are read from
   -----------------------------------------------------------------------------
   Each source is one file, saved exactly as its operator serves it, in
   data/raw/<id>.js. js/engine/raw-sources.js parses it into the Ledger table
   named by `group` when a page loads, so no number from these boards is typed.
   The table in data/ledger.js keeps only the citation and the entrants map.

   Refresh: the Checks tab's "Download every raw source again" button (under
   bash tools/preview.sh), or python3 tools/fetch_raw.py [id ...].
   `frozen`: a closed competition - downloaded once, not refreshed.
   One source per line: tools/fetch_raw.py reads this file line by line.
   ========================================================================== */

window.phailRaw = window.phailRaw || { files: {} };
window.phailRaw.sources = [
  { id: "robochallenge-t30", group: "robochallenge-t30", parser: "robochallenge", url: "https://robochallenge.ai/api/v1/leaderboard/leaderboard_all.json" },
  { id: "robochallenge-t30v2", group: "robochallenge-t30v2", parser: "robochallenge", url: "https://robochallenge.ai/api/v2/leaderboard/leaderboard_table30_v2.json" },
  { id: "robochallenge-cvpr26", group: "robochallenge-cvpr26", parser: "robochallenge", url: "https://robochallenge.ai/api/v1/leaderboard/leaderboard_table_cv.json", frozen: true },
  { id: "robochallenge-icra26", group: "robochallenge-icra26", parser: "robochallenge", url: "https://robochallenge.ai/api/v1/leaderboard/leaderboard_icra.json", frozen: true },
  { id: "paw-gen-10", group: "paw-gen-10", parser: "paw", url: "https://pokeandwiggle.com/leaderboard" }
];
