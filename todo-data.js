/* =============================================================================
   PhAIL - what we are working on (data only; todo-app.js draws it)
   -----------------------------------------------------------------------------
   The one list of open work. status: "doing" | "next" | "later".
   `added` marks items new since the last review. {boards} and {ledger} are
   filled in from scope-data.js so the counts never go stale.
   ========================================================================== */

window.phailTodo = {
  updated: "2026-09-28",

  groups: [
    {
      name: "Data coverage",
      items: [
        { title: "Every Scope board into the Ledger", detail: "{boards} boards on the Scope tab, {ledger} with numbers in the Ledger. Transcribe the rest, live leaderboards first.", status: "next", added: "2026-09-28" },
        { title: "Keep live boards current", detail: "Scripted reads of each live leaderboard, diffed against the ledger, with a dated change log.", status: "next" },
        { title: "New domains", detail: "One board each for driving (CARLA), aerial (Drone-Bench) and design (Parametric CAD Bench, CAD Arena).", status: "next" },
        { title: "Model registry", detail: "Version and post-training recipe per model, so a board label like “GR00T” resolves to one checkpoint.", status: "later" }
      ]
    },
    {
      name: "Checking the ranking",
      items: [
        { title: "Ask people in each field", detail: "Show the ranking to researchers in each domain, ask whether it matches their sense of the models, and record where and why it does not.", status: "next", added: "2026-09-28" },
        { title: "Internal cross-check", detail: "A second person re-reads every transcribed number against its source and recomputes the index independently.", status: "next", added: "2026-09-28" },
        { title: "Held-out and blinded checks", detail: "Held-out board accuracy is live. Next: blinded re-runs of the pairs the boards disagree on.", status: "doing" },
        { title: "Weights from the data", detail: "Fit board difficulty and discrimination (IRT) instead of 1 − best score.", status: "later" }
      ]
    },
    {
      name: "Evaluation gaps",
      items: [
        { title: "Speed and cost", detail: "Ask operators for latency, control rate and hardware; record $ per trial and tokens for agent boards.", status: "next" },
        { title: "Capabilities across boards", detail: "Tag every task with the capabilities it tests, so each capability is scored across boards.", status: "later" },
        { title: "Composite suite", detail: "A non-redundant sample of the most discriminating tasks from the open boards.", status: "later" },
        { title: "Safety beside the index", detail: "Refusals and incidents (RoboHarm-style) shown next to each model.", status: "later" }
      ]
    },
    {
      name: "New indices",
      items: [
        { title: "Design index", detail: "Frontier models on CAD and PCB boards, ranked the same way.", status: "later" },
        { title: "Driving index", detail: "Once two or more driving boards are transcribed.", status: "later" }
      ]
    },
    {
      name: "Writing",
      items: [
        { title: "Related work", detail: "One entry per closely related project; the MIT CSAIL survey is the first.", status: "doing" },
        { title: "Write-up", detail: "What physical AI can and cannot do yet, read off the ledger.", status: "later" }
      ]
    }
  ]
};
