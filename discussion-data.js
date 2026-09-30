/* =============================================================================
   PhAIL - things to discuss, one list per tab (data only; discussion.js draws it)
   -----------------------------------------------------------------------------
   Slide-style: a short title, the context in a line or two (enough to follow
   without having seen the page before), and what needs deciding (omit
   `decide` when nothing does). `points` adds labelled lines under the detail.
   Kept public: nothing internal. The whole meeting is 15 minutes, so keep
   each tab's list short. Delete an item once it is settled; running work
   goes in todo-data.js.
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
      detail: "Robotics is split by task category (table-top, mobile, loco-manipulation...). Some boards instead test one capability - memory, spatial, safety, touch - with tasks from any category; for now they are the dashed nodes after the task categories. The alternative: tag every task on every board with the capabilities it needs, and score each capability across all boards, as RoboDojo already does with its five axes.",
      decide: "Keep the dashed nodes, or move to capability tags?"
    },
    {
      title: "Supporting capabilities stay out of the ranking",
      detail: "A board's layer is set by what it scores: an action goes to Execution, a manufactured design to Design, an answer or a generated video to Supporting capabilities. So WorldLens, a driving world model, sits under Supporting (it scores generated video), while EmbodiedBench sits under Robotics (its LLM agents act in a simulator). Supporting boards test other kinds of models - video generators, VLMs - than robot policies.",
      decide: "List Supporting boards but leave them out of the model ranking?"
    },
    {
      title: "The spatial board from 19 Sep",
      detail: "The 19 Sep review mentioned a spatial benchmark. The only one we found where the model acts is VABench (Sep 2026): general multimodal LLMs - not trained robot policies - find objects with a camera they move and write metric arm commands that a fixed controller executes in RoboTwin. RoboSpatial, MV-RoboBench and Embodied3DBench only ask questions, so they sit under Embodied reasoning.",
      decide: "Is VABench the one meant, or which other?"
    },
    {
      title: "Next domains for the ledger",
      detail: "The ranking covers robotics only, because the ledger holds numbers for robotics boards only; driving, drones and design have none yet. Proposed first: CARLA Leaderboard (driving), Drone-Bench (drones), Parametric CAD Bench and CAD Arena (design) - each a live board run by its operator, the same kind the robotics ranking uses.",
      decide: "Agree on this order?"
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
      detail: "Now: difficulty × family share × evidence. Next: weight each board by how well the other boards predict it (RoboChallenge T30: 48%, a coin flip), or estimate difficulty and discrimination from the results themselves (IRT).",
      decide: "The rule, and a premium for real robots?"
    },
    {
      title: "Boards that disagree",
      detail: "RoboChallenge T30 and RoboDojo Real order their 6 shared models mostly oppositely (τ = −0.47, 11 of 15 pairs reversed) - with so few models that alone could be chance, but the other boards also predict T30 no better than a coin flip (held-out check). The other measurable board pairs agree (τ +0.49 to +0.67).",
      decide: "Keep, down-weight, or report beside the index?"
    },
    {
      title: "Anchor models on every board",
      detail: "10 of the 16 board pairs that share any model share fewer than 4, so whether they agree cannot be measured, and the common scale rests on 22 models that sit on two or more boards. pi-0.5 is already on 6 of the 7 boards. Asking every operator to run the same 3-5 reference models would make agreement measurable and the index steadier.",
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
      detail: "No benchmark-run board publishes model latency or hardware, so model size is the only proxy. PAW-GEN-10 reports task time and speed, but at a fixed 30 Hz control rate.",
      decide: "What to ask operators for?"
    },
    {
      title: "Validation",
      detail: "Live now: drop-one-board ranges, held-out accuracy, board agreement. Next: expert sanity check, internal cross-check, blinded re-runs.",
      decide: "What result would count as a failure?"
    }
  ],

  cad: [
    {
      title: "One entry per model, or per model and harness",
      detail: "CAD boards list a model several times, with different agent harnesses (Claude Code, Codex, mini-swe-agent) and effort levels. The index keeps each model's best entry, as it keeps a robot model's best checkpoint - so a model is credited with its best harness.",
      decide: "Rank models, or model + harness pairs?"
    },
    {
      title: "The CAD boards agree poorly",
      detail: "Fitted without it, the pooled index orders Parametric CAD Bench's clear pairs no better than a coin flip, and BenchCAD's and MIT CADBench's worse; only CAD Arena is predicted well. Part of it is generations: older boards test older models, linked only through a few shared ones.",
      decide: "Report the index anyway, or per board until more models overlap?"
    },
    {
      title: "The hardest board carries the most weight",
      detail: "CADWorld (computer-use agents in FreeCAD, best 17.5%) gets the largest weight with 7 models - the same pattern as PAW-GEN-10 on the Robotics Index.",
      decide: "Cap the weight of small boards?"
    },
    {
      title: "What the CAD Index does not measure yet",
      detail: "Editing as experts judge it (best model 25% accepted, human edits 78%), assemblies, physics and manufacturability, tolerances and standard parts. CADEngBench and MARB exist but are not in the Ledger.",
      decide: "Which boards next?"
    }
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
      detail: "LIBERO rows at 95-97% carry almost no ranking signal.",
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
      detail: "Only PAW-GEN-10 publishes safety (safe failures, contact force) and speed next to success, for 4 models; no board publishes latency or cost. RoboDojo's capability axes are the richest data today."
    }
  ],

  astra: [
    {
      title: "An agent lane",
      detail: "4th of 48 in simulation through a harness; the real-robot run was halted for safety.",
      decide: "Should safety gate a ranking?"
    },
    {
      title: "Overlap with the MIT CSAIL survey",
      detail: "It tracks many of the same Astra sources. Comparison on the Related work tab."
    }
  ],

  benchmarks: [
    {
      title: "Two lists of boards",
      detail: "This table and the Scope tree overlap. Proposal: generate this one from the scope data."
    },
    {
      title: "Design-layer metrics",
      detail: "The glossary covers robotics only; design boards score voxel IoU, B-rep validity, DRC-clean routing, editability."
    }
  ]
};
