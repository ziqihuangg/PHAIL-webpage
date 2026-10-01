/* =============================================================================
   PhAIL - ranking configuration (data only)
   -----------------------------------------------------------------------------
   Every knob the cross-board index depends on, in one place. The engine
   (js/engine/ranking-engine.js) reads this; the page (robotics-index.html) lets a reader flip
   the ones marked "toggle" live. Nothing here is a result.

   Board entries are keyed by resultGroups id in data/ledger.js.

     trials   rollouts behind one model's number on that board. Drives the noise
              band, and so how big a gap has to be before it counts as a win.
     family   boards from the same operator measuring the same thing share one
              weight (RoboChallenge v1 and v2 are one family, halves each).
     scale    "percent" (0-100, has a ceiling) or "elo" (no ceiling, publishes
              its own sd per model).
     metric   which column the board ranks by, when it is not the group's
              primary.
     minTasks entries that ran fewer of the board's tasks stay in the ledger
              but not in the index. RoboChallenge v2 averages over all 30 tasks
              with unrun tasks as zero, so a 3-task entry did not lose - it did
              not compete; without the rule ~35 such entries hand every model
              that sits only on v2 free wins. Half the tasks (15) for now.
   ========================================================================== */

window.phailRanking = {
  version: "v0 draft",
  indexName: "PhAIL Robotics Index (draft)",
  /* Ledger tasks this index draws on: paper tables pooled with Evidence =
     "+ paper tables", and the "left out of the index" list, stay inside it. */
  tasks: ["tabletop", "bimanual", "mobile", "loco", "household", "generalist", "industrial", "locomotion"],
  scopeDomains: ["robotics"],
  controls: ["track", "agents", "coverage", "weighting", "evidence", "method"],
  updated: "2026-09-30",

  boards: {
    "robodojo-sim":        { label: "RoboDojo Sim", trials: 2100, family: "robodojo-sim", metric: "score", scopeTask: "tabletop" },
    "robodojo-real":       { label: "RoboDojo Real", trials: 180, family: "robodojo-real", metric: "score", scopeTask: "tabletop" },
    "robochallenge-t30":   { label: "RoboChallenge T30", trials: 300, family: "robochallenge", metric: "success", scopeTask: "tabletop" },
    "robochallenge-t30v2": { label: "RoboChallenge T30-v2", trials: 300, family: "robochallenge", metric: "success", minTasks: 15, scopeTask: "tabletop" },
    "robotwin-2":          { label: "RoboTwin 2.0", trials: 10000, family: "robotwin", metric: "success", scopeTask: "tabletop" },
    "roboarena":           { label: "RoboArena", family: "roboarena", scale: "elo", metric: "elo", scopeTask: "tabletop" },
    /* The board says 3,600 evaluations per model, but its rates are multiples
       of 1/1,800 (1/180 per environment), so 1,800 is the conservative count. */
    "paw-gen-10":          { label: "PAW-GEN-10", trials: 1800, family: "paw", metric: "success", scopeTask: "tabletop" }
  },

  /* Operator-run tables that stay in the Ledger but not in the index, and
     why. Keyed by resultGroups id; js/pages/ranking.js prints each reason under
     "Boards and weights", with entry counts and overlaps computed from the
     ledger. A benchmark-run table in neither `boards` nor here is listed
     there too, as "no reason recorded". */
  outOfIndex: {
    "robochallenge-cvpr26": "A closed competition on RoboChallenge's own \u201cTable30 CVPR version\u201d. Its entrants are the Table30-v2 teams, scored under a different rule, so ranking both would count the same teams twice.",
    "robochallenge-icra26": "A closed competition with only {ledger.taskTotal:robochallenge-icra26} tasks, in a different category (mobile manipulation in a shop, not table-top). Apart from the organiser's baseline its entrants are on no other board, so it adds no comparison between models."
  },

  /* Paper tables (self-reported / third-party), used only when the reader
     switches evidence to "all tables". Trial counts are rarely stated, so one
     conservative number stands in for all of them. */
  paper: {
    trials: 500,
    exclude: ["openvla_oft_efficiency", "er_suite"]
  },

  /* toggle: evidence. A benchmark operator running every model on one harness
     is worth more than a paper's baseline column. */
  evidenceWeight: { benchmark: 1, thirdParty: 0.5, model: 0.5 },

  /* toggle: weighting. Difficulty = headroom = 1 - best score / 100, so a board
     the field has saturated (LIBERO: best 97%) barely moves the index. Elo
     boards have no ceiling and get the neutral value. */
  neutralDifficulty: 0.5,
  minDifficulty: 0.02,

  /* Strength of the tie every model plays against a fixed reference. Small:
     it only matters for models with one or two comparisons. */
  prior: 0.1,

  /* Frontier LLMs driving the arm through a fixed harness (RoboProbe L3)
     rather than a trained policy. toggle: entrants. */
  agents: ["gpt6_astra", "gpt55", "deepseek_flash"],

  /* Boards need this many models in common before we quote a Kendall tau. */
  minSharedForTau: 4,

  /* Capability axes. Each is its own small index over the sub-scores that
     measure it. `dim` indexes the RoboDojo `d` array: Generalization,
     Precision, Long-horizon, Memory, Open-vocab. RoboDojo spreads 42 tasks over
     five axes, so each axis rests on roughly a fifth of the rollouts. */
  capabilities: [
    /* definedBy: who decides what the capability is. A board's own task
       grouping is quoted from the board; groupings of several boards are ours.
       `what` says what each source column measures, in the board's words. */
    { id: "generalization", name: "Generalization", short: "Gen.", icon: "shuffle",
      definedBy: "PhAIL, joining three boards' own measures of unseen variation",
      sources: [
        { board: "robodojo-sim", dim: 0, trials: 840, what: "RoboDojo's Generalization axis: \u201cvaried objects, layouts and random variants\u201d (mean of standard and randomised layouts)" },
        { board: "robotwin-2", field: "hard", trials: 5000, what: "RoboTwin 2.0 success on randomised scenes (clutter, lighting, textures), after training on clean ones" },
        { board: "paw-gen-10", field: "interp", trials: 900, what: "PAW-GEN-10 success on unseen object placements between the training placements" }] },
    { id: "precision", name: "Precision", short: "Prec.", icon: "gauge", definedBy: "RoboDojo (its own task grouping)",
      sources: [{ board: "robodojo-sim", dim: 1, trials: 420, what: "RoboDojo's Precision axis: \u201cfine-grained manipulation with tight spatial constraints\u201d, e.g. Fasten Screws" }] },
    { id: "long", name: "Long-horizon", short: "Long", icon: "route", definedBy: "RoboDojo (its own task grouping)",
      sources: [{ board: "robodojo-sim", dim: 2, trials: 420, what: "RoboDojo's Long-Horizon axis: \u201cmulti-step tasks that require completing several subgoals\u201d" }] },
    { id: "memory", name: "Memory", short: "Mem.", icon: "history", definedBy: "RoboDojo (its own task grouping)",
      sources: [{ board: "robodojo-sim", dim: 3, trials: 420, what: "RoboDojo's Memory axis: \u201cstate tracking, sequence recall or delayed matching\u201d" }] },
    { id: "open", name: "Open-vocabulary", short: "Open", icon: "list-checks", definedBy: "RoboDojo (its own task grouping)",
      sources: [{ board: "robodojo-sim", dim: 4, trials: 420, what: "RoboDojo's Open axis: \u201copen-ended or language- / image-conditioned manipulation\u201d" }] },
    { id: "real", name: "Real robot", short: "Real", icon: "bot", definedBy: "PhAIL: every real-robot board's headline score",
      sources: [
        { board: "robodojo-real", what: "RoboDojo Real score, {!18} tasks on three real arms" },
        { board: "robochallenge-t30", what: "RoboChallenge Table30 success rate" },
        { board: "robochallenge-t30v2", what: "RoboChallenge Table30-v2 success rate" },
        { board: "roboarena", what: "RoboArena Elo from head-to-head votes" },
        { board: "paw-gen-10", what: "PAW-GEN-10 success rate" }] },
    { id: "embodiment", name: "Worst arm (cross-embodiment)", short: "Worst arm", icon: "git-merge", definedBy: "PhAIL: the weakest of a model's per-arm scores",
      sources: [{ board: "robodojo-real", min: ["arx", "piper", "piperX"], trials: 60, what: "RoboDojo Real: the lowest of the model's scores on ARX X5, Piper and Piper X" }] }
  ],

  /* Model gaps: where the models on the benchmark-run boards still fail, read
     off the raw published scores (not the index). Only the rules live here;
     every number on the page is computed from the ledger when it loads, so
     the section follows the data. `asks` quotes each board's own definition.
       level  best and median of one column, on one or more boards
       axis   one RoboDojo capability axis: trained policies, then agents
       drop   the fall from one column to another (clean -> randomised)
       arms   per-arm scores on one board (cross-embodiment)
     `low`: an axis score below this counts as failing that capability. */
  gaps: [
    { kind: "level", name: "Task completion, simulation", asks: "{!42} two-arm table-top tasks in simulation, {robotics.trials:robodojo-sim} episodes per policy.",
      boards: ["robodojo-sim"], field: "success" },
    { kind: "level", name: "Task completion, real robots", asks: "Table-top tasks on real arms, run by each board's operator.",
      boards: ["robodojo-real", "robochallenge-t30", "robochallenge-t30v2", "paw-gen-10"], field: "success" },
    { kind: "axis", name: "Generalization", asks: "“Varied objects, layouts and random variants” - e.g. Stack Bowls, Push T.", board: "robodojo-sim", dim: 0, low: 10 },
    { kind: "axis", name: "Precision", asks: "“Fine-grained manipulation with tight spatial constraints” - e.g. Fasten Screws, Plug In Charger.", board: "robodojo-sim", dim: 1, low: 10 },
    { kind: "axis", name: "Long-horizon", asks: "“Multi-step tasks with several subgoals” - e.g. Fill Pen Holder, Classify Objects.", board: "robodojo-sim", dim: 2, low: 10 },
    { kind: "axis", name: "Memory", asks: "“State tracking, sequence recall or delayed matching” - e.g. Cover Blocks.", board: "robodojo-sim", dim: 3, low: 10 },
    { kind: "axis", name: "Open-ended instructions", asks: "“Open-ended, language- or image-conditioned” - e.g. Stack Blocks By Language.", board: "robodojo-sim", dim: 4, low: 10 },
    { kind: "drop", name: "Robustness to scene changes", asks: "Trained on clean scenes, tested on clean and on randomised ones (clutter, lighting, textures).",
      board: "robotwin-2", from: "easy", to: "hard", labels: ["clean-scene", "randomised-scene"] },
    { kind: "drop", name: "Data efficiency", asks: "The same model fine-tuned on {!~300} and on {!~10} real demonstrations per environment, then tested on the real robot.",
      board: "paw-gen-10", from: "d300", to: "d10", labels: ["300-demo", "10-demo"] },
    { kind: "arms", name: "Cross-embodiment", asks: "The same {!18} real tasks on three different arms.",
      board: "robodojo-real", fields: ["arx", "piper", "piperX"], labels: ["ARX X5", "Piper", "Piper X"] }
  ],

  /* What else a ranking could weigh, and where each factor stands today.
     status: "used" feeds the index | "toggle" a switch on the page |
             "beside" shown next to the index, not in it | "missing" no data. */
  factors: [
    { name: "Board difficulty", why: "A win on a board the field has saturated says little.", data: "Best published score on every board.", status: "used" },
    { name: "Evidence class", why: "An operator running every model on one harness beats a baseline column.", data: "Provenance on every ledger row.", status: "used" },
    { name: "Sampling noise", why: "A {!1}-point gap over {robotics.trials:robodojo-real} real trials is a tie; over {robotics.trials:robodojo-sim} sim episodes it is not.", data: "Trial counts per board (stated or conservative).", status: "used" },
    { name: "Sim or real", why: "Sim rankings only partly predict real ones.", data: "Track on every board.", status: "toggle" },
    { name: "Agent or policy", why: "A harnessed frontier model and a post-trained VLA are different kinds of entry.", data: "{robotics.agentsWord} LLM agents on RoboDojo Sim.", status: "toggle" },
    { name: "Capabilities, decoupled", why: "One number hides whether a model fails at memory, precision or instructions.", data: "RoboDojo's five axes; RoboTwin clean vs randomised.", status: "beside" },
    { name: "Robustness gap", why: "Clean-scene scores overstate what survives a new layout.", data: "RoboTwin easy / hard; RoboDojo standard / random.", status: "beside" },
    { name: "Cross-embodiment", why: "A policy that works on one arm only is not general.", data: "RoboDojo Real per-arm scores.", status: "beside" },
    { name: "Model size", why: "The only public proxy for inference cost.", data: "Stated for {robotics.sizeStated} of the {robotics.models} ranked models.", status: "beside" },
    { name: "Latency / control rate", why: "Asked for as the x-axis on 19 Sep; decides whether a model can close a fast loop.", data: "No board publishes model latency or hardware. PAW-GEN-10 publishes task time and speed, at a fixed {!30 Hz} control rate.", status: "missing" },
    { name: "Compute and cost", why: "What a success costs to run.", data: "Only agent harness write-ups (tokens, dollars per trial).", status: "missing" },
    { name: "Post-training budget", why: "Separates a better model from a bigger fine-tune on the board's own demos.", data: "Rarely published.", status: "missing" },
    { name: "Safety", why: "A capable policy that ignores harm should not top a ranking unqualified.", data: "RoboHarm ({!3} models); PAW-GEN-10's safe-failure share and contact force ({ledger.models:paw-gen-10} models); RoboDojo's halted real run.", status: "missing" }
  ]
};
