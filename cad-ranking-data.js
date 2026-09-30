/* =============================================================================
   PhAIL - CAD Index configuration (data only)
   -----------------------------------------------------------------------------
   The same engine as the Robotics Index (ranking-engine.js), with its own
   boards and knobs. cad-index.html draws it with ranking-app.js; everything
   the fields mean is documented in ranking-data.js.

   CAD-specific choices
     - One entry is one model. Boards list a model several times with other
       agent harnesses or effort levels; the engine keeps each model's best
       row, as it does for robot checkpoints. The harness stays in the Ledger.
     - Parametric CAD Bench publishes a 95% interval per run; it is stored as
       row.se and used as the noise instead of the binomial estimate.
     - BenchCAD's vendor-reported rows are provenance "model": in only with
       Evidence = "+ paper tables", at half weight.
     - Trial counts marked "stand-in" are conservative guesses where the
       board does not state how many samples each entry was scored on.
   ========================================================================== */

window.phailCadRanking = {
  version: "v0 draft",
  updated: "2026-09-30",
  indexName: "PhAIL CAD Index (draft)",
  tasks: ["cad"],
  scopeDomains: ["mechanical"],
  /* all entries are general models driving a harness, and none runs on a
     robot, so the Sim / Real and policy / agent switches do not apply */
  controls: ["coverage", "weighting", "evidence", "method"],

  boards: {
    "paramcad-v3":          { label: "Parametric CAD Bench V3", trials: 100, family: "paramcad", metric: "overall" },
    "benchcad-vision2code": { label: "BenchCAD Vision2Code", trials: 1000, family: "benchcad", metric: "iou" },   /* stand-in */
    "cad-arena":            { label: "CAD Arena", trials: 90, family: "cadarena", metric: "score" },
    "cadbench-mit-image":   { label: "CADBench (MIT)", trials: 1000, family: "cadbench_mit", metric: "iou" },     /* stand-in */
    "cadworld":             { label: "CADWorld", trials: 200, family: "cadworld", metric: "success" }
  },

  outOfIndex: {
    "cadbench-mit-mesh": { label: "CADBench (MIT), mesh-to-CAD systems",
      reason: "Mesh-to-CAD specialists: they read a 3D mesh, not an image or a drawing, so their task differs from every other CAD board, and none of them appears on another board." },
    "neuralcad-edit": "Its three models are on no other CAD board, so it adds no comparison between models. Its expert-acceptance result is shown under Model gaps."
  },

  paper: { trials: 1000, exclude: [] },
  evidenceWeight: { benchmark: 1, thirdParty: 0.5, model: 0.5 },
  neutralDifficulty: 0.5,
  minDifficulty: 0.02,
  prior: 0.1,
  agents: [],
  minSharedForTau: 4,

  capabilities: [
    { id: "text", name: "Create from text", short: "Text", icon: "pencil-ruler",
      sources: [{ board: "paramcad-v3", field: "create", trials: 30 }] },
    { id: "edit", name: "Create, then edit", short: "Edit", icon: "wrench",
      sources: [{ board: "paramcad-v3", field: "createEdit", trials: 30 }] },
    { id: "drawings", name: "From drawings or views", short: "Drawings", icon: "drafting-compass",
      sources: [{ board: "paramcad-v3", field: "image", trials: 40 }, { board: "cad-arena" }, { board: "benchcad-vision2code" }, { board: "cadbench-mit-image" }] },
    { id: "workflow", name: "Whole workflow in the CAD program", short: "Workflow", icon: "cog",
      sources: [{ board: "cadworld" }] }
  ],

  gaps: [
    { kind: "level", name: "Create a part from text", asks: "30 FreeCAD parts described in words; every stated dimension is checked.",
      boards: ["paramcad-v3"], field: "create" },
    { kind: "level", name: "Create, then edit", asks: "30 tasks: build a part, then carry out a requested change to it.",
      boards: ["paramcad-v3"], field: "createEdit" },
    { kind: "level", name: "Rebuild from a drawing", asks: "Engineering drawings or rendered views in, a CAD model or CAD code out.",
      boards: ["paramcad-v3", "cad-arena", "benchcad-vision2code", "cadbench-mit-image"], fields: { "paramcad-v3": "image", "cad-arena": "score", "benchcad-vision2code": "iou", "cadbench-mit-image": "iou" } },
    { kind: "level", name: "Whole workflow in the CAD program", asks: "Sketch, model, assemble, make toolpaths, run simulations and drawings in FreeCAD through the screen.",
      boards: ["cadworld"], field: "success" },
    { kind: "level", name: "Edits an expert would accept", asks: "Designers' edit requests on existing models, judged by experts (human edits: 78% accepted).",
      boards: ["neuralcad-edit"], field: "accept" }
  ],

  /* the x-axis next to the index: what a result costs, where boards say */
  cost: { board: "paramcad-v3", field: "costPerTask", label: "USD per task on Parametric CAD Bench V3 (the run the index uses)" },

  factors: [
    { name: "Board difficulty", why: "A win on a board the field has nearly solved says little.", data: "Best published score on every board.", status: "used" },
    { name: "Sampling noise", why: "A 2-point gap over 100 tasks is a tie.", data: "Parametric CAD Bench's own 95% intervals; task counts elsewhere (stand-ins where unstated).", status: "used" },
    { name: "Harness and effort", why: "The same model scores differently with another agent harness or effort level.", data: "Every Ledger row records both; the index keeps each model's best.", status: "used" },
    { name: "Evidence class", why: "A vendor's own number on its own subset is a different claim from a re-graded one.", data: "BenchCAD's vendor-reported rows, kept apart.", status: "toggle" },
    { name: "Cost", why: "What a result costs to get.", data: "Parametric CAD Bench (per run), CAD Arena (per trial).", status: "beside" },
    { name: "Editability and design intent", why: "A part that looks right can still be impossible to change.", data: "CAD Arena scores editability; neuralCAD-Edit asks experts.", status: "beside" },
    { name: "Physics and manufacturability", why: "Whether the part works: DFM rules, stress, assembly.", data: "CADEngBench and MARB exist, not yet in the Ledger.", status: "missing" },
    { name: "Tolerances and standard parts", why: "What engineers do every day.", data: "No public benchmark found.", status: "missing" }
  ]
};
