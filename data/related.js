/* =============================================================================
   PhAIL - related work, our internal notes (data only; js/pages/related.js draws it)
   -----------------------------------------------------------------------------
   One entry per closely related project: what it is, how it differs from
   PhAIL, and what we should take from it. Newest first.
   ========================================================================== */

window.phailRelated = {
  updated: "2026-09-28",

  entries: [
    {
      id: "mit-cdfg-survey",
      title: "On the Opportunities and Risks of Frontier Models for 3D Modeling, Computational Design and Robotics",
      who: "MIT CSAIL - Computational Design and Fabrication Group (CDFG)",
      when: "Living survey, working draft, September 2026",
      read: "2026-09-27",
      links: [
        ["Survey site", "https://mit-cdfg.github.io/Survey-AI-for-3D-modeling-Robotics/"],
        ["Case archive (GitHub)", "https://github.com/Frank-ZY-Dou/awesome-ai-3d-modeling-robotics"]
      ],
      summary: "What frontier general models (GPT-6 Astra, Claude, Gemini, Grok) can do in 3D modelling, CAD, robot control and animation when driven through software harnesses - built from community demos plus quoted benchmark results.",

      facts: [
        ["Domains", "3D modelling, industrial design / CAD, robot control, animation"],
        ["Corpus", "285+ community demos and reports in 214 archived cases; 30 benchmark suites quoted (23 robotics, 7 3D / CAD / spatial); 317 references"],
        ["Evidence scale", "Four tiers: Established (independently reproduced), Partial (vendor reports with telemetry), Not established (single clips), Absent / refuted (physical failures)"],
        ["Reproducibility", "Each case ranked: code released (30), interactive demo (16), media only (168)"],
        ["Core claim", "Performance belongs to the whole system - model, harness, feedback, test-time effort - not to the model alone"],
        ["Form", "Paper-length report, benchmark dashboard, filterable case archive; continuously updated"]
      ],

      compare: [
        ["Models studied", "Frontier general models through harnesses", "Mostly trained robot policies (VLAs) on benchmark boards, plus harnessed agents"],
        ["Evidence base", "Community demos as a “distributed user study”, plus quoted benchmark tables", "Published tables only; every number cited with its protocol"],
        ["Label on a number", "How verifiable it is (four tiers, three reproducibility ranks)", "Who produced it (benchmark-run, self-reported, third-party, none)"],
        ["Scope", "3D, CAD, robotics, animation", "Execution (robotics, driving, aerial), design (CAD, PCB, chips), boundary"],
        ["Aggregation", "None - one table per benchmark", "Draft cross-board index with uncertainty"],
        ["Policy boards", "RoboChallenge, RoboTwin, RoboArena, LIBERO absent", "Transcribed"],
        ["Cost and latency", "Recorded for agent runs ($ per trial, tokens, minutes)", "Not recorded yet"]
      ],

      learn: [
        ["Record the harness", "Add harness, reasoning effort, budget, retries and human interventions to agent rows - the number belongs to the system."],
        ["Cost and time per trial", "Agent boards already publish $ per trial, tokens and minutes: the Artificial Analysis x-axis exists for agents, if not for policies."],
        ["A reproducibility column", "Code, weights, logs available? Next to our provenance label, not instead of it."],
        ["Four sources of improvement", "Model, harness, feedback, test-time effort. Only a model swap under a fixed harness isolates the model."],
        ["Safety outcomes in four classes", "From RoboHarm: safety refusal, non-safety refusal, execution failure, completed harm."],
        ["Full denominators and seeds", "Complete test counts and multi-seed intervals - exactly what our noise model needs."],
        ["Open corrections", "The archive takes fixes through GitHub; we could take corrections the same way."]
      ],

      theyLack: [
        "No ranking or weighting across boards.",
        "Almost no trained-policy boards (the VLA leaderboards we transcribe).",
        "Numbers are not labelled by who ran them."
      ],

      overlap: "RoboDojo (Astra 28.97), RoboHarm, StationeryBench, DrivingBench, Drone-Bench, EmbodiedSWE-Bench, BenchCAD, Parametric CAD Bench, CAD Arena, CadQueryEval"
    }
  ]
};
