/* =============================================================================
   PhAIL - open questions, one list per tab (data only; discussion.js draws it)
   -----------------------------------------------------------------------------
   Each item: the question, what we propose, and what needs deciding. Written
   for the review on 30 Sep 2026 but kept public: nothing here is internal.
   When an item is settled, delete it and record the outcome where it applies.
   ========================================================================== */

window.phailDiscussion = {
  meeting: "30 Sep 2026",

  scope: [
    {
      topic: "Two layers, and what to call them",
      issue: "“Planning layer” collides with planning inside the execution layer: LLM task planners, RoboDojo's L2 / L3 harness levels. One word would mean two things on one site.",
      proposal: "Keep the split, rename it Execution / Design (or Action / Artifact). The test stays the same: is the model's output an action, or a thing that gets made?",
      decide: "Final names for the two layers."
    },
    {
      topic: "Capability boards: domains or axes?",
      issue: "Memory, safety, tactile and spatial boards cut across embodiments. Filed under Robotics they look like one more task family.",
      proposal: "Drawn as dashed capability nodes for now. Next, tag every task on every board with the capabilities it exercises, so a capability can be scored across boards instead of on one.",
      decide: "The capability list: RoboDojo's five, plus safety, touch and spatial?"
    },
    {
      topic: "Which spatial board",
      issue: "The 19 Sep review mentions a spatial board. The ones we found (RoboSpatial, VSI-Bench, ERQA) are offline question answering, not closed-loop execution.",
      proposal: "Filed under supporting capabilities. Add an execution-level spatial board if there is one.",
      decide: "Confirm which board was meant."
    },
    {
      topic: "Where the boundary sits",
      issue: "World models and embodied-reasoning VLMs neither act nor produce anything, yet most execution models are built on top of them.",
      proposal: "Keep them as a boundary branch: listed, not ranked, available as diagnostic columns next to the index.",
      decide: "In or out of the ranking."
    },
    {
      topic: "Agents and policies on one tree",
      issue: "A growing share of boards (DrivingBench, Drone-Bench, EmbodiedSWE, every CAD board) test general models driving a harness, not trained policies.",
      proposal: "Every board is now tagged with what it can test: policy, agent, or both. Rank the two separately wherever a board mixes them.",
      decide: "Whether agent-only boards feed the same index as policy boards."
    },
    {
      topic: "Coverage beyond robotics",
      issue: "The first list had 36 boards; the tree now carries every one plus the additions marked “new” in the directory. Driving, aerial and design boards have no transcribed results yet.",
      proposal: "Transcribe one live board per domain next: CARLA Leaderboard for driving, Drone-Bench for aerial, Parametric CAD Bench and CAD Arena for design.",
      decide: "Order of the next three."
    }
  ],

  ranking: [
    {
      topic: "Models sit on different boards",
      issue: "No two models were run on the same set of boards. A weighted sum of raw scores rewards whoever happened to be entered on an easy board - switch Method to “Raw mean” above to see the order change.",
      proposal: "Compare models only inside a board, pool the comparisons with Bradley-Terry, and publish each model's coverage and leave-one-board-out range beside its index.",
      decide: "Adopt pairwise pooling as the headline method?"
    },
    {
      topic: "Board weights",
      issue: "Which boards should count more: harder ones, better-evidenced ones, quieter ones, real over sim, independent operators?",
      proposal: "Default: difficulty (1 - best score) x family share x evidence class, shown in the board table. Next: an item-response fit that estimates each board's difficulty and discrimination from the results instead of from its top score.",
      decide: "The weighting rule, and whether real-robot boards get a premium."
    },
    {
      topic: "Boards that disagree",
      issue: "RoboChallenge T30 orders the models it shares with RoboDojo Real in nearly the opposite way, and the other boards predict its pairwise order no better than chance (tables above).",
      proposal: "Check agreement and held-out accuracy before a board is merged. Likely causes to rule out: different task mix, submitter-run fine-tuning, model-version mismatch.",
      decide: "Keep disagreeing boards in the index, down-weight them, or report them beside it."
    },
    {
      topic: "A composite benchmark",
      issue: "An index built on other people's boards inherits their gaps and their overlaps.",
      proposal: "Sample tasks from each open board, keep the ones that separate models (high discrimination) and drop near-duplicates (high task-to-task correlation): full coverage, no repetition. RoboDojo, RoboTwin and LIBERO-Plus publish their task lists.",
      decide: "Start it, and with which boards."
    },
    {
      topic: "Agents versus post-trained policies",
      issue: "VLAs on these boards are post-trained on each board's own demonstrations; frontier LLMs arrive zero-shot through a harness. One axis mixes “model + fine-tuning recipe” with “model + harness”.",
      proposal: "Keep one index but tag entrants (the Entrants switch removes agents), and record the post-training budget (demos, steps) wherever a board publishes it.",
      decide: "One index or two."
    },
    {
      topic: "Latency and cost",
      issue: "None of the six benchmark-run boards publishes inference latency, control frequency or hardware, so the speed axis asked for on 19 Sep cannot be drawn. Parameter count is the only proxy, and most ranked models do not disclose it.",
      proposal: "Ask operators to log latency and GPU per run. Until then, plot the index against parameter count where known (chart above).",
      decide: "Which efficiency number to request from operators."
    },
    {
      topic: "Decoupling capabilities",
      issue: "Only RoboDojo scores capabilities separately; every other board gives one number per model.",
      proposal: "The capability table above is v0. Extend it by tagging tasks on RoboTwin, RoboChallenge and LIBERO-Plus with the same capability names.",
      decide: "The capability list (shared with the Scope tab)."
    },
    {
      topic: "Validating the index",
      issue: "How would we know the index is wrong?",
      proposal: "Three checks, all live on this page: leave-one-board-out ranges, held-out pairwise accuracy per board, board-to-board agreement. Next: re-run a few disputed pairs, blinded, on one real board.",
      decide: "What result would count as a failed validation."
    },
    {
      topic: "Model identity",
      issue: "Board labels are ambiguous: “GR00T” without a version, pi-0.5 as specialist and generalist, five DROID variants of one backbone.",
      proposal: "A model registry with version and post-training recipe. Until then the index takes each model's best entry on each board.",
      decide: "-"
    },
    {
      topic: "Beyond robotics",
      issue: "Driving and design boards are not in the index.",
      proposal: "Design boards rank the same frontier models (GPT, Claude, Gemini, Grok), so a separate design index from BenchCAD, Parametric CAD Bench, CAD Arena and CadQueryEval is feasible once transcribed.",
      decide: "Priority against deepening robotics."
    }
  ],

  ledger: [
    {
      topic: "Live boards move under us",
      issue: "RoboDojo Sim gained three entries and quietly re-scored pi-0.5 between 17 and 27 Sep. A hand transcription goes stale within days.",
      proposal: "Script the read (the board ships its data inside its page bundle), diff it against the ledger, and log every change with a date.",
      decide: "Refresh cadence."
    },
    {
      topic: "Operator-run or submitter-run",
      issue: "On RoboDojo and RoboChallenge some rows are evaluated by the operator, others submitted by the model's own team. Press coverage calls the new RoboDojo #1 self-reported.",
      proposal: "Split “benchmark-run” into operator-evaluated and operator-hosted, and let the index weight them differently.",
      decide: "Adopt the split?"
    },
    {
      topic: "Saturated boards",
      issue: "LIBERO rows (95-97%) fill the self-reported tables but carry almost no ranking information.",
      proposal: "Keep them for provenance; flag saturated boards and leave them out of default views.",
      decide: "-"
    }
  ],

  charts: [
    {
      topic: "From “no composite” to a draft index",
      issue: "This page was built to show why raw scores cannot be averaged across boards. The Ranking tab now publishes an index.",
      proposal: "Keep these charts as the evidence for the index's one design rule: it only ever compares models inside a board, which is the comparison these charts show to be meaningful.",
      decide: "-"
    },
    {
      topic: "What to chart next",
      issue: "Latency, cost and safety have no chart because no board publishes them next to success.",
      proposal: "Chart them as soon as one board does. Meanwhile RoboDojo's per-capability axes and RoboTwin's clean-vs-randomised split are the richest data we have.",
      decide: "-"
    }
  ],

  astra: [
    {
      topic: "An agent lane",
      issue: "GPT-6-Astra is 4th of 48 on RoboDojo Sim through a fixed harness, and its real-robot campaign was halted for safety.",
      proposal: "Show agents in their own lane of the index, and make real-robot claims conditional on a safety record (refusals, incidents).",
      decide: "Should safety gate a ranking, or sit beside it?"
    },
    {
      topic: "Overlap with the MIT CSAIL survey",
      issue: "MIT CDFG's living survey (Sep 2026) tracks many of the same Astra sources, with a four-tier evidence scale and 285 community demos.",
      proposal: "Cite it, map its evidence tiers onto our provenance labels, and keep this page on what it does not do: comparing across boards.",
      decide: "-"
    }
  ],

  benchmarks: [
    {
      topic: "Two lists of boards",
      issue: "The Scope tree and this table list overlapping boards from two separate sources.",
      proposal: "Generate this table from the scope data and keep only protocol columns here (year, scale, scoring).",
      decide: "-"
    },
    {
      topic: "Metrics for the design layer",
      issue: "The glossary covers robotics only. Design boards score voxel IoU, B-rep validity, DRC-clean routing and editability.",
      proposal: "Extend the glossary as those boards are transcribed.",
      decide: "-"
    }
  ]
};
