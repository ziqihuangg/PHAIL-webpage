/* =============================================================================
   PhAIL - GPT-6-Astra spotlight: the data
   -----------------------------------------------------------------------------
   Same contract as data/ledger.js: this file holds numbers and citations, and
   nothing else. No markup, no rendering, no DOM. js/pages/astra.js draws it.

   Why this page has its own file rather than rows in data/ledger.js: the
   ledger is organised one resultGroup per published table of MODELS. This page
   is the mirror image - one model read across six documents, most of which are
   not leaderboards at all (a safety-stopped diagnostic, a piano program, a demo
   thread). Folding them into the ledger would mean inventing benchmark entries
   for things that are not benchmarks.

   Every number below was read off the source page itself on the `retrieved`
   date. Where a source states n, n is recorded. Where it does not, the field is
   absent rather than guessed.
   ========================================================================== */

window.astraData = {

  meta: {
    model: "gpt-6-astra",
    retrieved: "2026-09-17",
    note: "OpenAI's general flagship model, no robotics-specific training. Every result here comes from someone else's harness."
  },

  /* --- who produced the number ---------------------------------------------
     Same idea as the ledger's provenance field, narrowed to the classes that
     actually appear on this page. Colour is the fill used in every chart.     */
  classes: {
    benchmark: {
      label: "Benchmark report",
      color: "#003b68",
      detail: "The benchmark operator ran the evaluation on its own harness and published the table."
    },
    report: {
      label: "Technical report",
      color: "#2f6b4f",
      detail: "A named research group built its own harness and published a report. Not the model's authors, not the benchmark operator."
    },
    evaluator: {
      label: "Third-party eval",
      color: "#a2560a",
      detail: "An independent evaluation shop running its own rig and rubric."
    },
    demo: {
      label: "Single demo",
      color: "#8a949b",
      detail: "One recorded run. No success rate, no protocol, no n."
    },
    index: {
      label: "Community index",
      color: "#aeb7bd",
      detail: "A list that points at other people's demos. It runs nothing itself."
    }
  },

  /* --- the sources ---------------------------------------------------------- */
  sources: {
    robodojo: {
      name: "RoboDojo",
      title: "An Unexpected Robot Policy: Early Evaluations of GPT-6 Astra on RoboDojo and Beyond",
      authors: "Wenbo Zhang, Kaixuan Wang, Yutao Ouyang and 9 others",
      cls: "benchmark",
      url: "https://robodojo-benchmark.com/report/gpt-6-astra-eval",
      retrieved: "2026-09-17",
      harness: "RoboProbe L3 \"Inspect EEF\": bounded Cartesian targets, interpolated to joint chunks at 25 Hz. Responses API, reasoning effort medium, one tool call per turn.",
      scope: "42 sim tasks x 50 episodes x 1 seed (2,100 trials). Real campaign stopped for safety."
    },
    hybrid: {
      name: "Su et al.",
      title: "GPT 6 Astra as an Embodied Policy",
      authors: "Jiayi Su, Yixin Zheng, Mi Yan, Li Yi, Zhizheng Zhang, He Wang",
      cls: "report",
      url: "https://anonymous-report-421.github.io/public-website",
      retrieved: "2026-09-17",
      harness: "Two architectures on one interface: Astra emits bimanual EEF targets directly (L3), or reviews a 50-step pi-0.5 candidate and accepts or corrects it (L2 hybrid). Reasoning effort xhigh.",
      scope: "10 RoboDojo tasks x 5 paired episodes, plus 10 RoboLab tasks x 5 trials on a single-arm Franka."
    },
    robocurve: {
      name: "Robocurve",
      title: "GPT-6 Astra on robotic manipulation",
      authors: "Achu Menon, Sravanthi Machcha, Sabrina Zou, Tzu Kit Chan, Jay Chooi",
      cls: "evaluator",
      url: "https://openai.robocurve.org/gpt-6-astra/",
      retrieved: "2026-09-17",
      harness: "Inspect Robots 0.58.0, agent policy, medium thinking effort, 20-LLM-call budget, 25% speed cap.",
      scope: "2 tasks x 20 trials on bimanual I2RT YAM arms, human-graded 0-4 per trial."
    },
    gptpolicy: {
      name: "GPT-Policy",
      title: "In-Context Robot Learning with VLM Agents",
      authors: "Dongzhou Cheng, Taoran Yi, Ye Fang and 12 others",
      cls: "report",
      url: "https://cheng-haha.github.io/GPT-Policy/",
      retrieved: "2026-09-17",
      harness: "Context compiler, a fixed VLM proposing robot-tool actions, and a constrained Cartesian controller that verifies each action and reports the outcome.",
      scope: "10 real-robot tasks in 5 context families, 3 trials per condition, ARX X5 and I2RT/YAM arms."
    },
    innate: {
      name: "Innate",
      title: "imitate_demonstration: one recorded episode as the whole context",
      authors: "David Dobas and Axel (@ax_pey), Innate",
      cls: "demo",
      url: "https://github.com/innate-inc/innate-os/pull/817",
      retrieved: "2026-09-17",
      harness: "One bounded, validated decision per observation, fresh telemetry re-read before every servo motion. Reasoning effort low, no trained policy, no fitted trajectory.",
      scope: "Demonstrations, not an evaluation. No success rate is claimed."
    },
    awesome: {
      name: "Awesome-Astra-Embodied-AI",
      title: "Community index of GPT-6-Astra embodied-AI cases",
      authors: "zjwzcx and contributors",
      cls: "index",
      url: "https://github.com/zjwzcx/Awesome-Astra-Embodied-AI",
      retrieved: "2026-09-17",
      harness: "None - it is a list.",
      scope: "35 indexed demonstrations, 2026-09-05 to 2026-09-16."
    }
  },

  /* --- CHART 1: the same model across every published harness ---------------
     Not a ranking. Each row is a different task set, robot and scoring rule, so
     the bars cannot be added, averaged, or read as progress. The spread IS the
     finding: the number you quote for this model depends almost entirely on who
     ran it.                                                                   */
  spread: [
    {
      label: "RoboLab, direct", value: 98, src: "hybrid",
      note: "49/50 trials. Single-arm Franka, semantic pick-and-place. Baselines are DROID-weight zero-shot."
    },
    {
      label: "Robocurve, block into bowl", value: 95, src: "robocurve",
      note: "19/20 trials, mean stage 3.95 of 4. Coarse placement into a large target."
    },
    {
      label: "RoboLab, hybrid", value: 92, src: "hybrid",
      note: "46/50 trials, pi-0.5 + Astra on the same task subset."
    },
    {
      label: "RoboDojo subset, hybrid", value: 48, src: "hybrid",
      note: "24/50 paired instances, mean Score 62.60. Tasks stratified towards low pi-0.5 success."
    },
    {
      label: "RoboDojo subset, direct", value: 26, src: "hybrid",
      note: "13/50 paired instances, mean Score 37.81."
    },
    {
      label: "RoboDojo-Sim, 42 tasks", value: 22.48, src: "robodojo",
      note: "Equal-weight mean of five capability axes, 2,100 trials, 1 seed. Rank 4 of 48 by Score (28.97) on the live board at 2026-09-27; rank 1 of 43 on the day the report was published."
    },
    {
      label: "Robocurve, puzzle into groove", value: 10, src: "robocurve",
      note: "2/20 trials. Same rig, same day, same model - a tight-tolerance insertion instead of a drop."
    },
    {
      label: "RoboDojo-Real, 33 clips", value: 3.03, src: "robodojo",
      note: "1 full success in 33 diagnostic trials. Not an official run: the campaign was stopped for safety."
    }
  ],

  /* --- CHART 2: RoboDojo capability axes ------------------------------------
     One published table, three policies, the five axes RoboDojo scores
     separately. Success rate, not Score.                                      */
  dimensions: {
    dims: ["Memory", "Open-ended", "Generalization", "Long-horizon", "Precision"],
    rows: [
      { label: "GPT-6-Astra (L3)", values: [38.67, 31.00, 30.50, 8.25, 4.00], color: "#003b68" },
      { label: "DM0.5 (best VLA)", values: [47.44, 2.08, 10.95, 19.50, 16.75], color: "#7f8b94" },
      { label: "GalaxeaVLA (G0.5)", values: [7.33, 1.58, 12.83, 32.25, 20.42], color: "#b7c0c6" }
    ]
  },

  /* --- CHART 3: the two ICL results that point opposite ways ---------------- */
  icl: {
    rows: [
      { label: "RoboDojo: zero-shot", value: 22.9, src: "robodojo", note: "78/340 episodes, 34 tasks x 10 layouts." },
      { label: "RoboDojo: + image demo", value: 17.9, src: "robodojo", note: "61/340 matched episodes. 5.0 points below zero-shot." },
      { label: "RoboDojo: + text demo", value: 12.9, src: "robodojo", note: "44/340 matched episodes. 10.0 points below zero-shot." },
      { label: "GPT-Policy: towel, none", value: 0, src: "gptpolicy", note: "0/3. 96.3 mean decisions, 24.6 min, gave up." },
      { label: "GPT-Policy: towel + demo", value: 66.7, src: "gptpolicy", note: "2/3. 76.7 decisions, 18.9 min." },
      { label: "GPT-Policy: cap, none", value: 0, src: "gptpolicy", note: "0/3. Budget exhausted on trial 3." },
      { label: "GPT-Policy: cap + robot video", value: 66.7, src: "gptpolicy", note: "2/3, 74.3 decisions." },
      { label: "GPT-Policy: cap + actions", value: 100, src: "gptpolicy", note: "3/3, and the cheapest of the three conditions at 54.7 decisions." }
    ]
  },

  /* --- CHART 4: what survives an unannounced change mid-episode ------------- */
  robustness: {
    rows: [
      { label: "Unperturbed", value: 100, n: "8/8", cost: "Reference condition" },
      { label: "Image flipped up/down", value: 100, n: "8/8", cost: "Nothing measurable" },
      { label: "Image mirrored left/right", value: 75, n: "6/8", cost: "Arm reassignment" },
      { label: "Head camera deleted", value: 75, n: "6/8", cost: "No global view" },
      { label: "X/Y/Z axes negated", value: 50, n: "4/8", cost: "Sign inferred after the first move" },
      { label: "One wrist camera only", value: 37.5, n: "3/8", cost: "Visual search; layout 9 succeeds at 1.7x budget" },
      { label: "10 cm pose jitter", value: 37.5, n: "3/8", cost: "Final grasp precision" }
    ]
  },

  /* --- CHART 5: Su et al., RoboDojo 10-task subset, mean Score -------------- */
  hybridBoard: {
    rows: [
      { label: "pi-0.5 + Astra (hybrid)", value: 62.60, sr: 48, highlight: true },
      { label: "GalaxeaVLA (G0.5)", value: 38.26, sr: 30.95 },
      { label: "GPT-6-Astra (direct)", value: 37.81, sr: 26, highlight: true },
      { label: "Xiaomi-Robotics-1", value: 33.97, sr: 25.51 },
      { label: "OpenWAM-alpha", value: 32.73, sr: 23.07 },
      { label: "DM0.5", value: 31.82, sr: 22.04 },
      { label: "Meituan-Robotics-0", value: 28.33, sr: 17.88 },
      { label: "Spatial Forcing", value: 24.96, sr: 17.15 },
      { label: "pi-0.5 alone", value: 24.43, sr: 15.67 },
      { label: "StarVLA-PI", value: 22.36, sr: 16.17 },
      { label: "InternVLA-A1.5", value: 21.74, sr: 15.03 },
      { label: "Hy-Embodied-0.5-VLA", value: 21.16, sr: 13.94 }
    ]
  },

  /* --- tables ---------------------------------------------------------------
     Kept here so the HTML carries no numbers. js/pages/astra.js renders each one.  */
  tables: {

    /* Ranks are read off the LIVE board, not off the report. They are not the
       same any more: the report went up on 2026-09-16 with Astra at the top of
       43 entries, LiberAI landed two policies above it the next morning, and
       Simate-beta a third on 2026-09-23. Nothing about Astra's run changed - the
       board it is measured against did. Re-read 2026-09-27, 48 entries.       */
    simBoard: {
      head: ["Rank", "Model", "Team", "Score", "Avg SR"],
      rows: [
        ["1", "Simate-beta", "Simate", "33.95", "27.96%", ""],
        ["2", "Liber-0 Preview", "LiberAI", "30.74", "25.52%", ""],
        ["3", "Liber-0 Lite", "LiberAI", "29.24", "24.23%", ""],
        ["4", "GPT-6-Astra", "OpenAI (L3 harness)", "28.97", "22.48%", "hi"],
        ["5", "DM0.5", "Dexmal", "24.90", "19.34%", ""],
        ["6", "GalaxeaVLA (G0.5)", "Galaxea AI", "20.23", "14.88%", ""],
        ["33", "DeepSeek-Flash", "DeepSeek (L3 harness)", "2.99", "1.92%", "hi"],
        ["38", "GPT-5.5", "OpenAI (L3 harness)", "1.13", "0.88%", "hi"]
      ]
    },

    monopoly: {
      head: ["Astra wins by 20+ points", "Astra", "Best VLA", "Best VLA loses by 20+", "Astra", "Best VLA"],
      rows: [
        ["push_T", "60.0%", "0.7%", "make_kong", "0.0%", "90.0%"],
        ["arrange_largest_number", "60.0%", "4.7%", "build_tower", "2.0%", "78.7%"],
        ["align_blocks", "50.0%", "0.0%", "insert_tubes", "0.0%", "59.3%"],
        ["solve_equation", "40.0%", "0.0%", "play_tic_tac_toe", "0.0%", "58.7%"],
        ["stack_blocks_by_language", "40.0%", "2.7%", "pour_balls_into_vase", "4.0%", "46.0%"],
        ["imitate_sorting_sequence", "36.0%", "0.7%", "pour_liquid_into_cup", "4.0%", "42.0%"],
        ["classify_objects_by_language", "30.0%", "0.7%", "fill_pen_holder", "0.0%", "22.0%"]
      ]
    },

    real: {
      head: ["Robot", "Task", "n", "Score", "SR"],
      rows: [
        ["Piper", "stack_bowls", "4", "47.5", "25%", "hi"],
        ["ARX X5", "store_in_safe", "1", "40.0", "0%", ""],
        ["ARX X5", "cover_blocks / insert_tubes / make_bread / make_food", "8", "0", "0%", ""],
        ["Piper", "fill_pen_holder / insert_charger / put_objects_into_basket", "9", "0", "0%", ""],
        ["Piper", "stack_and_cover_blocks / stand_up_bottles", "8", "0", "0%", ""],
        ["Piper X", "sweep_blocks", "3", "0", "0%", ""],
        ["-", "Pooled diagnostic sample", "33", "6.97", "3.03%", "hi"],
        ["-", "Official 18-task board: OpenWAM-alpha", "18 tasks", "37.60", "24.40%", "ref"],
        ["-", "Official 18-task board: pi-0.5", "18 tasks", "22.90", "12.80%", "ref"]
      ]
    },

    piano: {
      head: ["Score", "Change", "Notes", "F1", "Correct hand"],
      rows: [
        ["Twinkle, two hands", "as delivered", "34", "0.902", "35/35", "hi"],
        ["Twinkle, two hands", "tempo x0.85", "34", "0.883", "32/32", ""],
        ["Twinkle, two hands", "-7 semitones, tempo x1.25", "34", "0.837", "33/38", ""],
        ["Twinkle, two hands", "+2 semitones", "34", "0.683", "32/36", ""],
        ["Twinkle, two hands", "-3 semitones", "34", "0.655", "31/37", ""],
        ["C major scale", "unseen score, white keys only", "30", "0.903", "30/30", ""],
        ["C major chords", "unseen score, simultaneous presses", "16", "0.654", "12/12", ""],
        ["D major scale", "unseen score, black keys", "30", "0.556", "23/34", ""]
      ]
    },

    robolab: {
      head: ["Task", "Astra direct", "pi-0.5 + Astra", "pi-0.5", "Cosmos3-Nano", "DreamZero"],
      rows: [
        ["Blocks into bin", "5/5", "5/5", "0/5", "2/5", "0/5", ""],
        ["Pumpkins in clutter", "5/5", "4/5", "0/5", "0/5", "0/5", ""],
        ["Butter on raisin box", "5/5", "5/5", "0/5", "1/5", "2/5", ""],
        ["Stack blocks in order", "5/5", "4/5", "0/5", "0/5", "0/5", ""],
        ["Reorient red mug", "5/5", "4/5", "2/5", "1/5", "1/5", ""],
        ["Larger raisin box into bin", "4/5", "4/5", "3/5", "0/5", "0/5", ""],
        ["Sauce bottle into crate", "5/5", "5/5", "2/5", "5/5", "5/5", ""],
        ["Canned food into bin", "5/5", "5/5", "4/5", "4/5", "4/5", ""],
        ["Yogurt into bowl", "5/5", "5/5", "2/5", "0/5", "0/5", ""],
        ["Rubik's cube into bowl", "5/5", "5/5", "5/5", "5/5", "5/5", ""],
        ["Overall", "98%", "92%", "36%", "36%", "34%", "hi"]
      ]
    },

    cost: {
      head: ["", "pi-0.5 + Astra", "Astra direct"],
      rows: [
        ["Success rate, 50 instances", "48%", "26%", ""],
        ["Executed control steps", "42,750", "38,221", ""],
        ["Executed action segments", "3,776", "7,729", ""],
        ["Steps written by Astra", "14.4%", "100%", ""],
        ["Total tokens incl. cached", "624.8M", "1.13B", "hi"],
        ["Output tokens", "1.31M", "2.09M", ""]
      ]
    },

    robocurve: {
      head: ["Task", "Model", "Mean stage", "Completions", "Output tokens/run", "Cost/run", "Min/run"],
      rows: [
        ["Block into bowl", "GPT-6 Astra", "3.95", "19 / 20", "2.1k", "$0.94", "2.5", "hi"],
        ["Block into bowl", "Fable 5.1", "2.40", "8 / 20", "12.9k", "$2.12", "6.8", ""],
        ["Block into bowl", "Fable 5", "1.30", "1 / 20", "19.2k", "$2.69", "8.2", ""],
        ["Puzzle into groove", "GPT-6 Astra", "2.00", "2 / 20", "2.7k", "$1.36", "3.4", "hi"],
        ["Puzzle into groove", "Fable 5.1", "2.35", "2 / 20", "10.5k", "$2.18", "5.9", ""],
        ["Puzzle into groove", "Fable 5", "1.50", "0 / 20", "16.3k", "$2.63", "7.9", ""]
      ]
    },

    gptpolicy: {
      head: ["Family", "Task", "Context", "Success", "Decisions", "Time"],
      rows: [
        ["Human video", "Pick Red Towel", "none", "0 / 3", "96.3", "24.6 min", ""],
        ["Human video", "Pick Red Towel", "human video", "2 / 3", "76.7", "18.9 min", "hi"],
        ["Human video", "Pick Up Notebook", "none", "0 / 3", "94.0", "24.6 min", ""],
        ["Human video", "Pick Up Notebook", "human video", "2 / 3", "66.7", "16.1 min", "hi"],
        ["Robot demo", "Unscrew Bottle Cap", "none", "0 / 3", "71.0", "16.1 min", ""],
        ["Robot demo", "Unscrew Bottle Cap", "robot video", "2 / 3", "74.3", "15.2 min", ""],
        ["Robot demo", "Unscrew Bottle Cap", "video + actions", "3 / 3", "54.7", "17.9 min", "hi"],
        ["Robot demo", "Remove and Reinsert Plug", "none", "0 / 3", "24.0", "5.3 min", ""],
        ["Robot demo", "Remove and Reinsert Plug", "robot video", "0 / 3", "33.7", "7.9 min", ""],
        ["Robot demo", "Remove and Reinsert Plug", "video + actions", "2 / 3", "48.3", "10.8 min", "hi"],
        ["Goal image", "Arrange T Shape", "target image", "3 / 3", "66.7", "15.8 min", ""],
        ["Goal image", "Arrange Fruit", "target image", "3 / 3", "49.0", "12.4 min", ""],
        ["Self history", "Lemon To Pink Plate", "self history", "3 / 3", "35.3", "8.1 min", ""],
        ["Self history", "Movable Exploration", "self history", "3 / 3", "40.3", "25.5 min", ""],
        ["Interaction", "Tic-Tac-Toe", "live human turns", "3 / 3", "69.7", "13.6 min", ""],
        ["Interaction", "Pointed Fruit Pickup", "pointing gesture", "3 / 3", "67.3", "15.0 min", ""]
      ]
    },

    glance: {
      head: ["Source", "Published", "Role in the loop", "Effort", "Robot / scope", "n"],
      rows: [
        ["RoboDojo", "2026-09", "L3 / Direct", "medium", "Sim, 42 tasks + halted real campaign", "2,100 + 33"],
        ["Su et al.", "2026-09-13", "L3 Direct and L2 Hybrid", "xhigh", "Sim, bimanual + single-arm Franka", "50 + 50"],
        ["Robocurve", "2026-09-04", "Agent policy (Inspect Robots)", "medium", "Real bimanual YAM arms, 2 tasks", "40"],
        ["GPT-Policy", "2026-09", "VLM proposes, controller verifies", "not stated", "Real ARX X5 / YAM, 10 tasks", "48"],
        ["Innate", "2026-09-11", "L3 / Direct, no trained policy", "low", "Real mobile arm, demonstrations", "no n"],
        ["Awesome index", "2026-09-16", "n/a - a list", "n/a", "35 community cases", "no n"]
      ]
    },

    community: {
      head: ["Category", "Cases", "What it covers"],
      rows: [
        ["Zero-shot control, simulation", "12", "Dual-ALOHA puzzles, humanoid body control, Isaac Sim grasping, Rubik's cube, quadruped trajectories, physically writing Fibonacci"],
        ["Zero-shot control, real world", "10", "Keyboard typing, marker grasp from low-level control only, cucumber slicing, painting from a semantic prompt, one-shot plug insertion"],
        ["Real-to-sim replay", "6", "Kitchen reconstruction with articulated objects, tendon-driven hand motion, hand-object rollout, video in / physics out"],
        ["Astra builds RL environments", "6", "Pen-spinning RL in Isaac Lab, quadruped locomotion, office scan to humanoid gym, PPO training and tuning"],
        ["Agentic policy calls", "1", "Astra decomposes the task and invokes a pretrained VLA (FluxVLA) to execute"]
      ]
    }
  },

  /* --- videos ---------------------------------------------------------------
     Hot-linked from each source's own CDN, never rehosted, always attributed
     and always preload="none" so nothing downloads until someone clicks.      */
  videos: {
    robodojoReal: [
      {
        src: "https://media.luminis-sim.com/media/report/gpt-6-astra/robodojo-real/piper/stack_bowls/trial_8.mp4",
        poster: "https://media.luminis-sim.com/media/report/gpt-6-astra/robodojo-real/piper/stack_bowls/trial_8.jpg",
        caption: "The one full success in the whole retained real-robot sample: stack_bowls trial 8 on a Piper.",
        src_id: "robodojo"
      },
      {
        src: "https://media.luminis-sim.com/media/report/gpt-6-astra/astra-real-deployment/web/pour_phase3_on_target.mp4",
        poster: "https://media.luminis-sim.com/media/report/gpt-6-astra/astra-real-deployment/web/pour_phase3_on_target.jpg",
        caption: "Franka pour, on target. The model names the correction it needs - tilt further as the stream thins.",
        src_id: "robodojo"
      },
      {
        src: "https://media.luminis-sim.com/media/report/gpt-6-astra/astra-real-deployment/web/pour_phase4_stream_dies.mp4",
        poster: "https://media.luminis-sim.com/media/report/gpt-6-astra/astra-real-deployment/web/pour_phase4_stream_dies.jpg",
        caption: "The same pour, moments later: the perception-reasoning-control loop is not fast enough to apply that correction, and the stream dies down the cup wall.",
        src_id: "robodojo"
      }
    ],
    robodojoAdapt: [
      {
        src: "https://media.luminis-sim.com/media/report/gpt-6-astra/ablation-bundle/clips/negate-xyz-L0-ok.mp4",
        poster: "https://media.luminis-sim.com/media/report/gpt-6-astra/ablation-bundle/clips/negate-xyz-L0-ok.jpg",
        caption: "X, Y and Z silently negated with no warning. The model infers the sign flip from the outcome of its first move and finishes the task.",
        src_id: "robodojo"
      },
      {
        src: "https://media.luminis-sim.com/media/report/gpt-6-astra/ablation-bundle/clips/one-wrist-L9-2x-ok.mp4",
        poster: "https://media.luminis-sim.com/media/report/gpt-6-astra/ablation-bundle/clips/one-wrist-L9-2x-ok.jpg",
        caption: "Head camera and one wrist camera masked. It succeeds - but only when the call budget is raised 1.7x, because the search eats the episode.",
        src_id: "robodojo"
      },
      {
        src: "https://media.luminis-sim.com/media/report/gpt-6-astra/astra-piano-showcase/web/hero_two_hand.mp4",
        poster: "https://media.luminis-sim.com/media/report/gpt-6-astra/astra-piano-showcase/web/hero_two_hand.jpg",
        caption: "The inverted experiment: rather than acting, Astra writes the controller. Two Shadow hands, 45-D joint targets every 50 ms, F1 0.902, 35/35 notes on the correct hand.",
        src_id: "robodojo"
      }
    ],
    hybrid: [
      {
        src: "https://anonymous-report-421.github.io/public-website/media/clips/imitate_sorting_sequence_a5_frames_493_1309.mp4",
        poster: "https://anonymous-report-421.github.io/public-website/media/posters/imitate_sorting_sequence_a5_frames_493_1309.jpg",
        caption: "Hybrid control, 3D planning: Astra judges the contact geometry, nudges the object into a better pose, then hands control back to pi-0.5 for the grasp.",
        src_id: "hybrid"
      },
      {
        src: "https://anonymous-report-421.github.io/public-website/media/clips/clip__cbf8658bad76fd96fef01245__1.mp4",
        poster: "https://anonymous-report-421.github.io/public-website/media/posters/clip__cbf8658bad76fd96fef01245__1.jpg",
        caption: "Reasoning from non-termination: the manipulation looks finished, the simulator disagrees, so the model hypothesises what is unmet and re-checks.",
        src_id: "hybrid"
      },
      {
        src: "https://anonymous-report-421.github.io/public-website/media/clips/clip__b34c1a832bb5123d6eb6a6af__0.mp4",
        poster: "https://anonymous-report-421.github.io/public-website/media/posters/clip__b34c1a832bb5123d6eb6a6af__0.jpg",
        caption: "Direct control, and the paper's own point: a genuinely inventive zero-shot plan - sweep the bottles into the bin with the arm - that does not survive execution.",
        src_id: "hybrid"
      },
      {
        src: "https://anonymous-report-421.github.io/public-website/media/clips/clip__faad002fd6c510f09db4c435__0.mp4",
        poster: "https://anonymous-report-421.github.io/public-website/media/posters/clip__faad002fd6c510f09db4c435__0.jpg",
        caption: "Direct control failing on proprioception: without an action prior it cannot turn joint state into reachable targets, and repeats blocked commands.",
        src_id: "hybrid"
      }
    ],
    robocurve: [
      {
        src: "https://openai.robocurve.org/gpt-6-astra/video/bowl-astra-vs-fable51-cost.mp4",
        poster: "https://openai.robocurve.org/gpt-6-astra/video/bowl-astra-vs-fable51-cost-poster.jpg",
        caption: "Best completed bowl run from each model, side by side, thinking pauses removed. Astra 2.5 min at $0.94; Fable 5.1 6.8 min at $2.12.",
        src_id: "robocurve"
      }
    ],
    gptpolicy: [
      {
        src: "https://cheng-haha.github.io/GPT-Policy/assets/videos/towel-no-demo.mp4",
        poster: "https://cheng-haha.github.io/GPT-Policy/assets/images/towel-without-human-poster.jpg",
        caption: "Pick up the red towel, no demonstration: 0/3, 96.3 mean decisions, gave up after 24.6 minutes.",
        src_id: "gptpolicy"
      },
      {
        src: "https://cheng-haha.github.io/GPT-Policy/assets/videos/towel-with-demo.mp4",
        poster: "https://cheng-haha.github.io/GPT-Policy/assets/images/towel-with-human-poster.jpg",
        caption: "Same task, same rig, one human video in the prompt: 2/3, and 20% fewer decisions.",
        src_id: "gptpolicy"
      },
      {
        src: "https://cheng-haha.github.io/GPT-Policy/assets/experiments/bottle-astra-action-r1.mp4",
        poster: "https://cheng-haha.github.io/GPT-Policy/assets/experiments/bottle-astra-action-r1.jpg",
        caption: "Unscrew the bottle cap with a robot video plus aligned action labels: 3/3, and the cheapest of the three conditions at 54.7 decisions.",
        src_id: "gptpolicy"
      },
      {
        src: "https://cheng-haha.github.io/GPT-Policy/assets/videos/tic-tac-toe.mp4",
        poster: "",
        caption: "Live tic-tac-toe: it tracks the human's turn, waits for the hand to withdraw, re-localises after the board shifts mid-transport, and blocks the left column.",
        src_id: "gptpolicy"
      }
    ]
  },

  /* --- where the sources disagree -------------------------------------------
     The part of this page that cannot be got from any single source.          */
  disagreements: [
    {
      q: "Effect of a demonstration in the prompt",
      verdict: "Contested - and the two sides are not testing the same thing.",
      rows: [
        { who: "RoboDojo", src: "robodojo", says: "No. Across 340 layout-matched episodes an image demonstration scores 17.9% and a text demonstration 12.9%, against 22.9% zero-shot. On tasks that are already 0/10 zero-shot, image demonstrations recover 2 of 150 episodes." },
        { who: "GPT-Policy", src: "gptpolicy", says: "Yes. Four tasks go from 0/3 with no context to 2/3 or 3/3 with a demonstration, and with fewer decision-steps." },
        { who: "Innate", src: "innate", says: "Yes. With the task description withheld, the model recovered all six phases of a multi-step task from one recorded episode alone." }
      ],
      reading: "RoboDojo's demonstration comes from a <em>different layout of the same task</em>, which its authors argue misleads a model that already understood the goal. GPT-Policy's demonstration is of the <em>same scene</em> the robot is about to act in, and its tasks are ones the model fails outright without help. Both can be true: a demonstration transfers geometry, not intent, and is only worth its prompt space when the geometry is the thing you are missing. RoboDojo's own conclusion is that the in-context learning that works here is self-repair against the model's own action history - it recovers from negated axes (4/8) and mirrored cameras (6/8) mid-episode without being told anything changed."
    },
    {
      q: "Astra alone versus Astra driving a learned policy",
      verdict: "It depends on whether the learned policy was trained on the task.",
      rows: [
        { who: "Su et al., on RoboDojo", src: "hybrid", says: "Hybrid wins clearly: 48% vs 26% success, Score 62.60 vs 37.81 - while Astra rewrites only 14.4% of executed control steps and the run costs 44.8% fewer tokens." },
        { who: "Su et al., on RoboLab", src: "hybrid", says: "Direct wins: 98% vs 92%. Same authors, same week, opposite ordering." }
      ],
      reading: "The RoboDojo runs use pi-0.5 weights fine-tuned on those tasks; the RoboLab runs use DROID weights zero-shot, where pi-0.5 alone manages 36%. A student worth correcting helps; a student that is wrong most of the time mostly creates work. The report says this itself, and it is the single most useful caveat on this page for anyone planning to build a hybrid stack."
    },
    {
      q: "The bottleneck",
      verdict: "Unanimous: contact, not cognition.",
      rows: [
        { who: "RoboDojo", src: "robodojo", says: "Precision is the worst of the five axes at 4.00% SR, against 38.67% on memory. Sixteen of 42 tasks sit at exactly zero while ten are at or above 50%." },
        { who: "Robocurve", src: "robocurve", says: "95% dropping a block into a bowl, 10% seating a puzzle piece in its groove. Same rig, same session, same model." },
        { who: "Su et al.", src: "hybrid", says: "Grasp failures, container-rim collisions, and slip that goes unnoticed until the next action-segment boundary." },
        { who: "GPT-Policy", src: "gptpolicy", says: "\"Knowing what to do is not the same as doing it reliably.\" Observed inter-arm collisions; existing safeguards judged insufficient for autonomous deployment." }
      ],
      reading: "Every source that ran a precision task reports the same split, and RoboDojo names it: semantic understanding is in place, spatial understanding is in place, physical commonsense - contact dynamics, force, collision geometry - is not. The practical consequence shows up in RoboDojo's real campaign, which was stopped after the model issued unsafe actions that damaged hardware."
    },
    {
      q: "Independence of the evaluations",
      verdict: "Less than the count of sources suggests.",
      rows: [
        { who: "RoboDojo", src: "robodojo", says: "Its L3 harness is an Inspect Robots agent; Inspect Robots is cited to Robocurve." },
        { who: "Robocurve", src: "robocurve", says: "Runs Inspect Robots 0.58.0 with the agent policy." },
        { who: "Su et al.", src: "hybrid", says: "Independent harness, but three of its five RoboLab baselines and all of its public RoboDojo reference columns are re-tabulated from RoboDojo's board, not re-run." }
      ],
      reading: "Two of the four quantitative sources share a harness codebase, and a third borrows RoboDojo's baseline numbers. That is not misconduct - it is what a field looks like three weeks into an evaluation scramble - but it means the six sources on this page are closer to three or four independent measurements, and agreement between them is weaker evidence than it appears."
    }
  ],

  /* --- what nobody has published -------------------------------------------- */
  gaps: [
    "No official RoboDojo-Real result. The 18-task protocol was never completed; what exists is 33 diagnostic clips retained around a safety stop.",
    "No multi-seed anything. Every quantitative source on this page is a single seed.",
    "No end-to-end latency figure. Su et al. record physical duration with model-response latency explicitly excluded, and name latency as the unresolved obstacle to real-time deployment.",
    "No evaluation by OpenAI. The only clearly OpenAI-owned document about this model is the API model card, which says nothing about robots.",
    "No shared task set. RoboDojo-Sim, RoboLab, Robocurve's two tasks and GPT-Policy's ten tasks have no overlap, so nothing on this page can be pooled."
  ]
};
