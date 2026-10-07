/* =============================================================================
   PhAIL - things to discuss, one list per tab (data only; js/common/discussion.js draws it)
   -----------------------------------------------------------------------------
   Slide-style: a short title, the context in a line or two (enough to follow
   without having seen the page before), and what needs deciding (omit
   `decide` when nothing does). `points` adds labelled lines under the detail.
   Numbers are {tokens} computed on load (js/common/facts.js); {!text} is a
   number written on purpose. check.html fails on any other digit.
   Kept public: nothing internal. The whole meeting is 15 minutes, so keep
   each tab's list short. Delete an item once it is settled; running work
   goes in data/todo.js.
   ========================================================================== */

window.phailDiscussion = {
  meeting: "30 Sep 2026",

  scope: [
    {
      title: "What PhAIL is for",
      points: [
        ["Purpose", "Artificial Analysis gives language, image and video models one independent ranking; physical AI has none. PhAIL maps what physical AI benchmarks measure and turns their published results into one ranking, with capabilities scored separately."],
        ["Output", "This site: the scope map, the ranking, and a ledger of every cited number. A write-up of what models can and cannot do yet and which benchmarks are missing. Later, a composite benchmark built from the most informative tasks."],
        ["Audience", "People choosing a physical AI model for a task - robotics teams in labs and companies. Also model and benchmark builders, to see where models fail and which tests are missing."]
      ],
      decide: "Agree on purpose, outputs and audience - the rest of the site follows from them."
    },
    {
      title: "Reviewers for each domain",
      detail: "We wrote the domain definitions, chose the benchmarks and built the ranking ourselves, from papers and leaderboards. We need one or two people working in each domain - robotics, driving, drones, CAD, chip and board design, world models - to check three things: are the definitions right, is an important benchmark missing, and does the ranking match what they see in practice.",
      decide: "Who to ask in each domain, and by when?"
    },
    {
      title: "Capability boards: separate nodes or tags",
      detail: "Robotics is split by what the task needs - fixed-base manipulation (table-top, dexterous, industrial), moving-base manipulation (on wheels or on legs), navigation. Some boards instead test one capability - memory, long-horizon, safety, touch - with tasks from any category; for now they are the dashed nodes grouped under Capability boards. The alternative: tag every task on every board with the capabilities it needs, and score each capability across all boards, as RoboDojo already does with its five axes.",
      decide: "Keep the dashed nodes, or move to capability tags?"
    },
    {
      title: "Supporting capabilities stay out of the ranking",
      detail: "A board's layer is set by what it scores: an action goes to Execution, a manufactured design to Design, an answer, a generated video, or the commands of an LLM agent with no trained policy behind them to Supporting capabilities. So WorldLens, a driving world model, sits under Supporting (it scores generated video), and so does EmbodiedBench: its LLMs issue steps or gripper poses that the simulator carries out, and no robot policy is tested. Supporting boards test other kinds of models - video generators, LLMs, VLMs - than robot policies.",
      decide: "List Supporting boards but leave them out of the model ranking?"
    },
    {
      title: "The spatial board from 19 Sep",
      detail: "The 19 Sep review mentioned a spatial benchmark. The only one we found where the model acts is VABench (Sep 2026): general multimodal LLMs - not trained robot policies - find objects with a camera they move and write metric arm commands that a fixed controller executes in RoboTwin. No trained policy is tested, so it sits under Supporting capabilities with the other LLM and VLM agent boards; RoboSpatial, MV-RoboBench and Embodied3DBench only ask questions.",
      decide: "Is VABench the one meant, or which other?"
    },
    {
      title: "Next domains for the ledger",
      detail: "The ranking covers robotics only, because the ledger holds numbers for robotics boards only; driving, drones and design have none yet. Proposed first: CARLA Leaderboard (driving), Drone-Bench (drones), Parametric CAD Bench and CAD Arena (design) - each a live board run by its operator, the same kind the robotics ranking uses.",
      decide: "Agree on this order?"
    },
    {
      title: "Design-layer metrics",
      detail: "The metric glossary below the tree covers robotics only; design boards score voxel IoU, B-rep validity, DRC-clean routing, editability."
    }
  ],

  ranking: [
    {
      title: "Pairwise pooling as the headline",
      detail: "Models sit on different boards, so a weighted sum of raw scores rewards whoever entered easy boards. Try Method: Raw mean to see it.",
      decide: "Adopt pairwise pooling?"
    },
    {
      title: "Board weights",
      detail: "Now: difficulty × family share × evidence. Next: weight each board by how well the other boards predict it (RoboChallenge T30: {robotics.heldOutPct:robochallenge-t30}, a coin flip), or estimate difficulty and discrimination from the results themselves (IRT).",
      decide: "The rule, and a premium for real robots?"
    },
    {
      title: "Boards that disagree",
      detail: "RoboChallenge T30 and RoboDojo Real order their {robotics.tauN:robochallenge-t30/robodojo-real} shared models mostly oppositely (τ = {robotics.tau:robochallenge-t30/robodojo-real}, {robotics.tauOpposite:robochallenge-t30/robodojo-real} of {robotics.tauPairs:robochallenge-t30/robodojo-real} pairs reversed) - with so few models that alone could be chance, but the other boards also predict T30 no better than a coin flip (held-out check). The other measurable board pairs agree (τ {robotics.tauPositiveMin} to {robotics.tauPositiveMax}).",
      decide: "Keep, down-weight, or report beside the index?"
    },
    {
      title: "Anchor models on every board",
      detail: "{robotics.tauUnmeasured} of the {robotics.tauSharing} board pairs that share any model share fewer than {robotics.minShared}, so whether they agree cannot be measured, and the common scale rests on {robotics.multi} models that sit on two or more boards. {robotics.pivotName} is already on {robotics.pivotCoverage} of the {robotics.boards} boards. Asking every operator to run the same {!3-5} reference models would make agreement measurable and the index steadier.",
      decide: "Which reference models, and who asks the operators?"
    },
    {
      title: "A composite benchmark",
      detail: "Take the tasks that separate models best from each open board (RoboDojo, RoboTwin, LIBERO-Plus) and drop near-duplicates.",
      decide: "Start it?"
    },
    {
      title: "Agents vs post-trained policies",
      detail: "VLAs are fine-tuned on each board's own demos; frontier LLMs arrive zero-shot through a harness.",
      decide: "One index or two?"
    },
    {
      title: "Latency and cost",
      detail: "No benchmark-run board publishes model latency or hardware, so model size is the only proxy. PAW-GEN-10 reports task time and speed, but at a fixed {!30 Hz} control rate.",
      decide: "What to ask operators for?"
    },
    {
      title: "Validation",
      detail: "Live now: drop-one-board ranges, held-out accuracy, board agreement. Next: expert sanity check, internal cross-check, blinded re-runs.",
      decide: "What result would count as a failure?"
    }
  ],

  cad: [
    { title: "BenchCAD carries the most weight because it is single shot",
      detail: "A board's weight grows with how far its best entry is from {!100}. BenchCAD Vision2Code's best single-shot entry reaches {cad.bestPct:benchcad-vision2code}, so it gets the largest weight, {cad.weightPct:benchcad-vision2code}. With a Python sandbox the same task is close to solved (vendor-reported, above {!95%}): the difficulty comes from the run mode, not the parts.",
      decide: "Read difficulty per run mode, or weight single-shot boards down?" },
    { title: "Two CAD products rank among the top models",
      detail: "Godela and Archie in Forge run their own harness and appear only on CADGenBench, where the models they beat ran the plain baseline. They now rank {cad.rank:godela} and {cad.rank:archie_forge} overall, resting on one board each.",
      decide: "Keep products in the main ranking, or show them in a column of their own?" },
    { title: "Boards beside the index",
      detail: "CADBench (MIT) and CADWorld stay out because too few of their models are on the index boards; their agents are a model generation behind. They feed the Drawings and Workflow columns only.",
      decide: "Ask these boards to run current frontier models?" },
    { title: "What the CAD Index does not measure yet",
      detail: "Editing as experts judge it (best model {ledger.best:neuralcad-edit}% accepted, human edits {!78%}), assemblies, physics and tolerances. CADEngBench (physics) and RealCADBench (assemblies) are now in the Ledger, but test older models; MARB is not transcribed.",
      decide: "Which boards next, and ask which ones to run current models?" }
  ],

  ledger: [
    {
      title: "Live boards move",
      detail: "RoboDojo Sim gained three models and silently re-scored pi-0.5 in ten days.",
      decide: "Automate the reads; how often?"
    },
    {
      title: "Operator-run or team-submitted",
      detail: "Some “benchmark-run” rows were submitted by the model's own team; coverage of Simate-beta calls it self-reported.",
      decide: "Split the label in two?"
    },
    {
      title: "Saturated boards",
      detail: "LIBERO's best rows reach {ledger.best:libero}% and carry almost no ranking signal.",
      decide: "Hide them by default?"
    }
  ],

  charts: [
    {
      title: "Charts and the index",
      detail: "Each chart is one published table. The index uses only within-board comparisons - exactly what these charts show is meaningful."
    },
    {
      title: "What to chart next",
      detail: "Only PAW-GEN-10 publishes safety (safe failures, contact force) and speed next to success, for {ledger.models:paw-gen-10} models; no board publishes latency or cost. RoboDojo's capability axes are the richest data today."
    }
  ],

  astra: [
    {
      title: "An agent lane",
      detail: "{ledger.rank:robodojo-sim:gpt6_astra} in simulation through a harness; the real-robot run was halted for safety.",
      decide: "Should safety gate a ranking?"
    },
    {
      title: "Overlap with the MIT CSAIL survey",
      detail: "It tracks many of the same Astra sources. Comparison on the Related work tab."
    }
  ]
};
