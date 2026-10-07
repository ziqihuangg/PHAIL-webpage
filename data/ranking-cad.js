/* =============================================================================
   PhAIL - CAD Index configuration (data only)
   -----------------------------------------------------------------------------
   The same engine as the Robotics Index (js/engine/ranking-engine.js), with its own
   boards and knobs. cad-index.html draws it with js/pages/ranking.js; everything
   the fields mean is documented in data/ranking-robotics.js.

   Which boards (decided 2026-10-07): only boards whose models overlap enough
   to be placed against each other - Parametric CAD Bench, CAD Arena,
   CADGenBench (validated) and BenchCAD Vision2Code. With these four the index
   orders the left-out boards' clear pairs ~4 times in 5; adding CADBench (MIT)
   and CADWorld pulled that towards a coin flip. Those boards stay beside the
   index: in `outOfIndex`, and as sources of the capability columns.

   CAD-specific choices
     - One entry is one model. Boards list a model several times with other
       agent harnesses or effort levels; the engine keeps each model's best
       operator-run row. On CADGenBench, where submitters run their own
       systems, only the board's own baseline harness counts (`harness`);
       submitters' harnesses stay in the Ledger.
     - Named CAD products (Godela, Archie in Forge) rank, but run their own
       harness, so they do not set the board's best score and difficulty
       (`difficultyHarness`).
     - `run`: how a model works on the board - "agentic" (a tool loop over many
       rounds) or "single" (one program, one shot). Shown, not adjusted for.
     - Parametric CAD Bench and CAD Arena publish a 95% interval per entry;
       it is stored as row.se and used as the noise instead of the binomial.
     - Vendor-reported rows (BenchCAD *) and unvalidated CADGenBench
       submissions enter only with Evidence = "+ paper tables", at half weight.
     - Trial counts marked "stand-in" are conservative guesses where the
       board does not state how many samples each entry was scored on.
   ========================================================================== */

window.phailCadRanking = {
  version: "v0 draft",
  updated: "2026-10-07",
  indexName: "PhAIL CAD Index (draft)",
  tasks: ["cad"],
  scopeDomains: ["mechanical"],
  /* all entries are general models driving a harness, and none runs on a
     robot, so the Sim / Real and policy / agent switches do not apply */
  controls: ["coverage", "weighting", "evidence", "method"],

  boards: {
    "paramcad-v3":           { label: "Parametric CAD Bench V3", trials: 100, family: "paramcad", metric: "overall", scopeTask: "cad-part", run: "agentic" },
    "cad-arena":             { label: "CAD Arena", trials: 90, family: "cadarena", metric: "score", scopeTask: "cad-part", run: "agentic" },
    /* 49 generation + 32 editing fixtures */
    "cadgenbench-validated": { label: "CADGenBench", trials: 81, family: "cadgenbench", metric: "score", scopeTask: "cad-part", run: "agentic",
                               harness: ["baseline", "product"], difficultyHarness: ["baseline"] },
    "benchcad-vision2code":  { label: "BenchCAD Vision2Code", trials: 1000, family: "benchcad", metric: "iou", scopeTask: "cad-part", run: "single" }   /* stand-in */
  },

  outOfIndex: {
    "cadbench-mit-image": { label: "CADBench (MIT), image-to-CAD systems",
      reason: "Too few of its models are on the index boards to place the rest (the overlap is counted above), and with it in, the index ordered the other boards' clearly separated pairs markedly worse. Its scores still feed the Drawings column under Capabilities." },
    "cadworld": "The only board that runs a whole CAD workflow through the screen. Almost none of its agents are on an index board, so they cannot be placed against the rest. It defines the Workflow column under Capabilities.",
    "benchcad-codeedit": { label: "BenchCAD Code Edit",
      reason: "An editing task, used for the Edit column under Capabilities rather than the overall index. Its entrants are older models that BenchCAD Vision2Code already brings into the index." },
    "cadbench-mit-mesh": { label: "CADBench (MIT), mesh-to-CAD systems",
      reason: "Mesh-to-CAD specialists: they read a 3D mesh, not an image or a drawing, so their task differs from every other CAD board, and none of them appears on another board." },
    "neuralcad-edit": "Its three models are on no other CAD board, so it adds no comparison between models. Its expert-acceptance result is shown under Model gaps.",
    "realcad-part": { label: "RealCADBench, parts (paper)",
      reason: "Shares four models with the index boards, but orders them differently: as a fifth board it was predicted wrongly on every clearly separated pair it had, and pulled the other boards' agreement down. A quarter of its score is a model acting as judge." },
    "realcad-assembly": { label: "RealCADBench, assemblies (paper)",
      reason: "A stratified study of a few assemblies, mixing single-shot models with two agent set-ups. Shown under Model gaps." },
    "cadengbench-p": { label: "CADEngBench, parametric parts (paper)",
      reason: "Its models are a generation behind the index boards and almost none of them is on one, so they cannot be placed. It is the only set with a finite-element check; that is shown under Model gaps." },
    "cadengbench-a": { label: "CADEngBench, assembly joints (paper)",
      reason: "Same models as its parametric part, none on an index board. Shown under Model gaps." },
    "muse": { label: "MUSE (paper)",
      reason: "Scored by a model acting as judge, which is also one of the models judged, and most of its models are on no index board." }
  },

  paper: { trials: 1000, exclude: [] },
  evidenceWeight: { benchmark: 1, thirdParty: 0.5, model: 0.5 },
  neutralDifficulty: 0.5,
  minDifficulty: 0.02,
  prior: 0.1,
  agents: [],
  minSharedForTau: 4,

  capabilities: [
    { id: "text", name: "Create from text", short: "Text", icon: "pencil-ruler", definedBy: "Parametric CAD Bench (its own task category)",
      sources: [{ board: "paramcad-v3", field: "create", trials: 30, what: "Parametric CAD Bench \u201cCreate\u201d: {!30} parts described in words" }] },
    { id: "edit", name: "Edit a model", short: "Edit", icon: "wrench", definedBy: "PhAIL, joining three boards' editing tasks",
      sources: [
        { board: "paramcad-v3", field: "createEdit", trials: 30, what: "Parametric CAD Bench \u201cCreate + Edit\u201d: {!30} tasks, build a part then change it" },
        { board: "cadgenbench-validated", field: "editing", trials: 32, what: "CADGenBench editing: {!32} drawing revisions applied to a supplied STEP model" },
        { board: "benchcad-codeedit", label: "BenchCAD Code Edit", family: "benchcad", field: "accuracy", trials: 748, what: "BenchCAD Code Edit: {!748} CadQuery programs, each with an edit instruction" }] },
    { id: "drawings", name: "From drawings or views", short: "Drawings", icon: "drafting-compass", definedBy: "PhAIL, joining five boards' drawing- or image-to-CAD tasks",
      sources: [
        { board: "paramcad-v3", field: "image", trials: 40, what: "Parametric CAD Bench \u201cImage-to-CAD\u201d: {!40} engineering drawings" },
        { board: "cad-arena", what: "CAD Arena: {!18} drawings rebuilt in {!5} commercial CAD tools" },
        { board: "benchcad-vision2code", what: "BenchCAD Vision2Code: four orthographic views to CadQuery code" },
        { board: "cadbench-mit-image", label: "CADBench (MIT)", trials: 1000, what: "CADBench (MIT): images to CAD programs, {!6} families" },   /* stand-in */
        { board: "cadgenbench-validated", field: "generation", trials: 49, what: "CADGenBench generation: {!49} engineering drawings to STEP models" }] },
    { id: "workflow", name: "Whole workflow in the CAD program", short: "Workflow", icon: "cog", definedBy: "CADWorld (the whole board)",
      sources: [{ board: "cadworld", label: "CADWorld", trials: 200, what: "CADWorld: {!200} FreeCAD tasks operated through the screen" }] }
  ],

  gaps: [
    { kind: "level", name: "Create a part from text", asks: "{!30} FreeCAD parts described in words; every stated dimension is checked.",
      boards: ["paramcad-v3"], field: "create" },
    { kind: "level", name: "Edit a model", asks: "Carry out a requested change to a part: after building it, on a supplied model, or in its CAD program.",
      boards: ["paramcad-v3", "cadgenbench-validated", "benchcad-codeedit"], fields: { "paramcad-v3": "createEdit", "cadgenbench-validated": "editing", "benchcad-codeedit": "accuracy" } },
    { kind: "level", name: "Rebuild from a drawing", asks: "Engineering drawings or rendered views in, a CAD model or CAD code out.",
      boards: ["paramcad-v3", "cad-arena", "cadgenbench-validated", "benchcad-vision2code", "cadbench-mit-image"], fields: { "paramcad-v3": "image", "cad-arena": "score", "cadgenbench-validated": "generation", "benchcad-vision2code": "iou", "cadbench-mit-image": "iou" } },
    { kind: "level", name: "Whole workflow in the CAD program", asks: "Sketch, model, assemble, make toolpaths, run simulations and drawings in FreeCAD through the screen.",
      boards: ["cadworld"], field: "success" },
    { kind: "level", name: "Assemble parts", asks: "Find how two parts join (entity pair and joint type), or build a whole assembly from parts.",
      boards: ["cadengbench-a", "realcad-assembly"], fields: { "cadengbench-a": "typed1", "realcad-assembly": "pa" } },
    { kind: "level", name: "Physics: the part behaves like the reference", asks: "A finite-element solve (stress, deformation, compliance) on the generated part agrees with the same solve on the reference.",
      boards: ["cadengbench-p"], field: "l3pair" },
    { kind: "level", name: "Edits an expert would accept", asks: "Designers' edit requests on existing models, judged by experts (human edits: {!78%} accepted).",
      boards: ["neuralcad-edit"], field: "accept" }
  ],

  /* the x-axis next to the index: what a result costs, where boards say */
  cost: { board: "paramcad-v3", field: "costPerTask", label: "USD per task on Parametric CAD Bench V3 (the run the index uses)" },

  factors: [
    { name: "Board difficulty", why: "A win on a board the field has nearly solved says little.", data: "Best published score on every board.", status: "used" },
    { name: "Sampling noise", why: "A {!2}-point gap over {cad.trials:paramcad-v3} tasks is a tie.", data: "Parametric CAD Bench's and CAD Arena's own {!95%} intervals; task counts elsewhere (stand-ins where unstated).", status: "used" },
    { name: "Harness and effort", why: "The same model scores differently with another agent harness or effort level.", data: "Only harnesses the board itself runs: its best such row per model; on CADGenBench, the board's baseline. Submitters' own harnesses stay in the Ledger.", status: "used" },
    { name: "Run mode", why: "Writing one program in one shot and working in a tool loop over many rounds are different systems.", data: "Each board's mode is shown beside it: BenchCAD single shot, the other three agentic.", status: "beside" },
    { name: "Evidence class", why: "A vendor's own number on its own subset, or a submission nobody validated, is a different claim from a re-graded one.", data: "BenchCAD's vendor-reported rows and CADGenBench's unvalidated submissions, kept apart.", status: "toggle" },
    { name: "Cost", why: "What a result costs to get.", data: "Parametric CAD Bench (per run), CAD Arena (per trial).", status: "beside" },
    { name: "Editability and design intent", why: "A part that looks right can still be impossible to change.", data: "CAD Arena scores editability; neuralCAD-Edit asks experts.", status: "beside" },
    { name: "Physics and manufacturability", why: "Whether the part works: DFM rules, stress, assembly.", data: "CADEngBench checks DFM rules and runs a finite-element solve; in the Ledger and under Model gaps, but its models are a generation behind. MARB is not transcribed.", status: "beside" },
    { name: "Tolerances and standard parts", why: "What engineers do every day.", data: "No public benchmark found.", status: "missing" }
  ]
};
