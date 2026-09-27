/* =============================================================================
   PhAIL - ranking configuration (data only)
   -----------------------------------------------------------------------------
   Every knob the cross-board index depends on, in one place. The engine
   (ranking-engine.js) reads this; the page (ranking.html) lets a reader flip
   the ones marked "toggle" live. Nothing here is a result.

   Board entries are keyed by resultGroups id in tasks-data-new.js.

     trials   rollouts behind one model's number on that board. Drives the noise
              band, and so how big a gap has to be before it counts as a win.
     family   boards from the same operator measuring the same thing share one
              weight (RoboChallenge v1 and v2 are one family, halves each).
     scale    "percent" (0-100, has a ceiling) or "elo" (no ceiling, publishes
              its own sd per model).
     metric   which column the board ranks by, when it is not the group's
              primary.
   ========================================================================== */

window.phailRanking = {
  version: "v0 draft",
  updated: "2026-09-27",

  boards: {
    "robodojo-sim":        { label: "RoboDojo Sim", trials: 2100, family: "robodojo-sim", metric: "score" },
    "robodojo-real":       { label: "RoboDojo Real", trials: 180, family: "robodojo-real", metric: "score" },
    "robochallenge-t30":   { label: "RoboChallenge T30", trials: 300, family: "robochallenge", metric: "success" },
    "robochallenge-t30v2": { label: "RoboChallenge T30-v2", trials: 300, family: "robochallenge", metric: "success" },
    "robotwin-2":          { label: "RoboTwin 2.0", trials: 10000, family: "robotwin", metric: "success" },
    "roboarena":           { label: "RoboArena", family: "roboarena", scale: "elo", metric: "elo" }
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
    { id: "generalization", name: "Generalization", short: "Gen.", icon: "shuffle",
      sources: [{ board: "robodojo-sim", dim: 0, trials: 840 }, { board: "robotwin-2", field: "hard", trials: 5000 }] },
    { id: "precision", name: "Precision", short: "Prec.", icon: "gauge",
      sources: [{ board: "robodojo-sim", dim: 1, trials: 420 }] },
    { id: "long", name: "Long-horizon", short: "Long", icon: "route",
      sources: [{ board: "robodojo-sim", dim: 2, trials: 420 }] },
    { id: "memory", name: "Memory", short: "Mem.", icon: "history",
      sources: [{ board: "robodojo-sim", dim: 3, trials: 420 }] },
    { id: "open", name: "Open-vocabulary", short: "Open", icon: "list-checks",
      sources: [{ board: "robodojo-sim", dim: 4, trials: 420 }] },
    { id: "real", name: "Real robot", short: "Real", icon: "bot",
      sources: [{ board: "robodojo-real" }, { board: "robochallenge-t30" }, { board: "robochallenge-t30v2" }, { board: "roboarena" }] },
    { id: "embodiment", name: "Worst arm (cross-embodiment)", short: "Worst arm", icon: "git-merge",
      sources: [{ board: "robodojo-real", min: ["arx", "piper", "piperX"], trials: 60 }] }
  ],

  /* What else a ranking could weigh, and where each factor stands today.
     status: "used" feeds the index | "toggle" a switch on the page |
             "beside" shown next to the index, not in it | "missing" no data. */
  factors: [
    { name: "Board difficulty", why: "A win on a board the field has saturated says little.", data: "Best published score on every board.", status: "used" },
    { name: "Evidence class", why: "An operator running every model on one harness beats a baseline column.", data: "Provenance on every ledger row.", status: "used" },
    { name: "Sampling noise", why: "A 1-point gap over 180 real trials is a tie; over 2,100 sim episodes it is not.", data: "Trial counts per board (stated or conservative).", status: "used" },
    { name: "Sim or real", why: "Sim rankings only partly predict real ones.", data: "Track on every board.", status: "toggle" },
    { name: "Agent or policy", why: "A harnessed frontier model and a post-trained VLA are different kinds of entry.", data: "Three LLM agents on RoboDojo Sim.", status: "toggle" },
    { name: "Capabilities, decoupled", why: "One number hides whether a model fails at memory, precision or instructions.", data: "RoboDojo's five axes; RoboTwin clean vs randomised.", status: "beside" },
    { name: "Robustness gap", why: "Clean-scene scores overstate what survives a new layout.", data: "RoboTwin easy / hard; RoboDojo standard / random.", status: "beside" },
    { name: "Cross-embodiment", why: "A policy that works on one arm only is not general.", data: "RoboDojo Real per-arm scores.", status: "beside" },
    { name: "Model size", why: "The only public proxy for inference cost.", data: "Stated for 13 models, a minority of those ranked.", status: "beside" },
    { name: "Latency / control rate", why: "Asked for as the x-axis on 19 Sep; decides whether a model can close a fast loop.", data: "None of the six benchmark-run boards publishes it.", status: "missing" },
    { name: "Compute and cost", why: "What a success costs to run.", data: "Only agent harness write-ups (tokens, dollars per trial).", status: "missing" },
    { name: "Post-training budget", why: "Separates a better model from a bigger fine-tune on the board's own demos.", data: "Rarely published.", status: "missing" },
    { name: "Safety", why: "A capable policy that ignores harm should not top a ranking unqualified.", data: "RoboHarm (3 models); RoboDojo's halted real run.", status: "missing" }
  ]
};
