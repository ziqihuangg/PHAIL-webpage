/* =============================================================================
   PhAIL - things to discuss, one list per tab (data only; discussion.js draws it)
   -----------------------------------------------------------------------------
   Slide-style: a short title, one or two lines of detail, and what needs
   deciding (omit `decide` when nothing does). Kept public: nothing internal.
   Delete an item once it is settled; running work goes in todo-data.js.
   ========================================================================== */

window.phailDiscussion = {
  meeting: "30 Sep 2026",

  scope: [
    {
      title: "Capability boards as axes",
      detail: "Memory, spatial, safety and touch boards cut across embodiments. For now they are dashed nodes under Robotics.",
      decide: "Tag every task on every board with capabilities, so each capability is scored across boards?"
    },
    {
      title: "Spatial board to confirm",
      detail: "The only closed-loop spatial board found is VABench (Sep 2026; frontier models acting in RoboTwin). RoboSpatial, MV-RoboBench and Embodied3DBench are offline question answering.",
      decide: "Confirm the board meant in the 19 Sep review."
    },
    {
      title: "The boundary",
      detail: "Boards are placed by what they score. A driving world model (WorldLens) scores generated video, so it sits on the boundary, not under driving.",
      decide: "Keep boundary boards out of the ranking?"
    },
    {
      title: "Agents and policies",
      detail: "Every board is tagged policy / agent / both. DrivingBench, Drone-Bench and every CAD board test agents only.",
      decide: "A separate agent ranking?"
    },
    {
      title: "Next domains for the ledger",
      detail: "Driving, aerial and design have no transcribed numbers yet.",
      decide: "Order: CARLA, Drone-Bench, Parametric CAD Bench and CAD Arena?"
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
      detail: "Now: difficulty × family share × evidence. Next: estimate difficulty and discrimination from the results themselves (IRT).",
      decide: "The rule, and a premium for real robots?"
    },
    {
      title: "Boards that disagree",
      detail: "RoboChallenge T30 and RoboDojo Real order their shared models almost oppositely (τ = −0.47 on 27 Sep); the other boards predict RoboChallenge below chance.",
      decide: "Keep, down-weight, or report beside the index?"
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
      detail: "No benchmark-run board publishes latency or hardware, so model size is the only proxy.",
      decide: "What to ask operators for?"
    },
    {
      title: "Validation",
      detail: "Live now: drop-one-board ranges, held-out accuracy, board agreement. Next: expert sanity check, internal cross-check, blinded re-runs.",
      decide: "What result would count as a failure?"
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
      detail: "No board publishes latency, cost or safety next to success; RoboDojo's capability axes are the richest data today."
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
