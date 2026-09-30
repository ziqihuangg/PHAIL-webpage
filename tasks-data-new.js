/* =============================================================================
   PhAIL - Physical AI Ledger : evaluation database
   -----------------------------------------------------------------------------
   Last updated: 2026-09-30

   HOW TO EDIT THIS FILE
   ---------------------
   Rendering lives in tasks-app.js / charts.js. Data lives here. Adding a row
   should never require touching HTML.

   Every number on this site comes from ONE published table, page, or repo file.
   Results are therefore grouped by source: one `resultGroups` entry == one table
   in one document. The citation is written once, on the group, and every row
   inside inherits it. To add a new benchmark table: copy a group, change the
   header fields, paste the rows.

   PROVENANCE - the thing this ledger actually tries to get right
   -------------------------------------------------------------
   `provenance` records WHO PRODUCED THE NUMBER, not who made the model:

     "benchmark"   The benchmark operator ran the evaluation themselves
                   (RoboChallenge, RoboDojo, RoboTwin, RoboArena). Where the
                   policy was submitted by an outside team, `submitter` says so.
     "model"       Self-reported: the model's own authors published it.
     "thirdParty"  Someone else ran (or re-tabulated) a model they did not make,
                   e.g. a baseline column in a competing paper.
     "pending"     We know an evaluation exists or should exist, but we have no
                   number we can cite yet. Deliberately left visible.

   NEVER add a number without `source` + `sourceUrl` you can open. If a value is
   derived by us (e.g. an average we computed from per-suite numbers), set
   `derived: true` and explain in the row note.
   ========================================================================== */

window.phailDatabase = {
  meta: {
    updated: "2026-09-30",
    note: "Numbers are copied from the cited table and not renormalised. Scores from different benchmarks are not comparable and are never averaged together on this site; the Ranking index compares models within each board only."
  },

  /* --- provenance taxonomy -------------------------------------------------- */
  provenance: {
    benchmark: {
      label: "Benchmark-run",
      short: "Benchmark",
      color: "#003b68",
      detail: "The benchmark operator ran the evaluation and published the number."
    },
    model: {
      label: "Self-reported",
      short: "Self-reported",
      color: "#a2560a",
      detail: "Published by the model's own authors, on a harness they controlled."
    },
    thirdParty: {
      label: "Third-party",
      short: "Third-party",
      color: "#2f6b4f",
      detail: "Produced by a group that did not build the model - typically a baseline column in someone else's paper."
    },
    pending: {
      label: "No citable number",
      short: "Pending",
      color: "#8a949b",
      detail: "An evaluation is claimed, expected, or in progress, but we have nothing we can cite."
    }
  },

  /* --- organisations ---------------------------------------------------------
     One colour per organisation, so that every model from the same lab reads as
     one group across the charts - the Ledger, Charts and Ranking all use it.
     Colours are picked to stay distinct from each other, not copied from the
     logos (logo-derived colours were tried on 2026-09-28 and rolled back: too
     many labs have black logos). The logo itself sits in the badge. `mark` is the monogram drawn in the badge under
     each bar; add `logo: "logos/name.svg"` to any entry to use a real wordmark
     instead - the renderer prefers it when present.
     `unconfirmed` is not a gap in this table, it is the finding: for a large part
     of the 2026 leaderboards the only public trace is a board row and a citation
     key, with no stated affiliation.
     ------------------------------------------------------------------------ */
  organisations: {
    nvidia:        { name: "NVIDIA", mark: "NV", color: "#76b900", site: "https://www.nvidia.com/", logo: "logos/nvidia.png" },
    deepmind:      { name: "Google DeepMind", mark: "G", color: "#1a73e8", site: "https://deepmind.google/", logo: "logos/deepmind.png" },
    physical_intelligence: { name: "Physical Intelligence", mark: "π", color: "#c0392b", site: "https://www.physicalintelligence.company/", logo: "logos/physical_intelligence.png" },
    stanford:      { name: "Stanford", mark: "S", color: "#8c1515", site: "https://www.stanford.edu/", logo: "logos/stanford.png" },
    berkeley:      { name: "UC Berkeley", mark: "B", color: "#003262", site: "https://www.berkeley.edu/", logo: "logos/berkeley.svg" },
    huggingface:   { name: "Hugging Face / LeRobot", mark: "HF", color: "#d97706", site: "https://huggingface.co/", logo: "logos/huggingface.png" },
    tsinghua:      { name: "Tsinghua University", mark: "TH", color: "#660874", site: "https://www.tsinghua.edu.cn/", logo: "logos/tsinghua.png" },
    tencent:       { name: "Tencent", mark: "TX", color: "#2c4b9b", site: "https://www.tencent.com/", logo: "logos/tencent.png" },
    ant_group:     { name: "Ant Group (Robbyant)", mark: "ANT", color: "#0e9be0", site: "https://www.antgroup.com/", logo: "logos/ant_group.png" },
    alibaba:       { name: "Alibaba (AMAP CV Lab)", mark: "AM", color: "#9c4a1a", site: "https://www.alibabagroup.com/", logo: "logos/alibaba.png" },
    sjtu:          { name: "Shanghai Jiao Tong University", mark: "SJ", color: "#e74c3c", site: "https://www.sjtu.edu.cn/", logo: "logos/sjtu.png" },
    hkust:         { name: "HKUST", mark: "UST", color: "#1a5276", site: "https://hkust.edu.hk/", logo: "logos/hkust.png" },
    galbot:        { name: "Galbot", mark: "GB", color: "#3d5afe", site: "https://www.galbot.com/", logo: "logos/galbot.png" },
    ai2:           { name: "Allen Institute for AI", mark: "AI2", color: "#167d9e", site: "https://allenai.org/", logo: "logos/ai2.png" },
    figure:        { name: "Figure AI", mark: "F", color: "#17191c", site: "https://www.figure.ai/", logo: "logos/figure.png" },
    microsoft:     { name: "Microsoft Research", mark: "MS", color: "#1565a5", site: "https://www.microsoft.com/", logo: "logos/microsoft.png" },
    agibot:        { name: "AgiBot", mark: "AB", color: "#0f9b8e", site: "https://www.agibot.com/", logo: "logos/agibot.png" },
    galaxea:       { name: "Galaxea", mark: "GX", color: "#5b4b9e", site: "https://galaxea.ai/", logo: "logos/galaxea.png" },
    shanghai_ai_lab: { name: "Shanghai AI Laboratory", mark: "SH", color: "#0e6e6e", site: "https://www.shlab.org.cn/", logo: "logos/shanghai_ai_lab.png" },
    xiaomi:        { name: "Xiaomi Robotics", mark: "MI", color: "#e05a00", site: "https://www.mi.com/", logo: "logos/xiaomi.png" },
    gigaai:        { name: "GigaAI", mark: "GA", color: "#a0522d", site: "https://www.gigaai.net/", logo: "logos/gigaai.png" },
    spirit_ai:     { name: "Spirit AI", mark: "SP", color: "#2e8b57", site: "https://www.spirit-ai.com/", logo: "logos/spirit_ai.png" },
    dexmal:        { name: "Dexmal", mark: "DX", color: "#8a6a1f", site: "https://www.dexmal.com/", logo: "logos/dexmal.png" },
    robotera:      { name: "Robotera", mark: "RT", color: "#b03060", site: "https://www.robotera.com/" },
    atlas:         { name: "Atlas", mark: "AT", color: "#2f6b8f" },
    xsquare:       { name: "X Square Robot", mark: "X2", color: "#6b8e23", site: "https://www.x2robot.com/", logo: "logos/xsquare.png" },
    ola:           { name: "OLA-HKUSTGZ", mark: "OLA", color: "#7a3e9d", site: "https://www.hkust-gz.edu.cn/", logo: "logos/ola.png" },
    openhelix:     { name: "OpenHelix", mark: "OH", color: "#196f3d", site: "https://github.com/OpenHelix-Team", logo: "logos/openhelix.png" },
    usc_psi:       { name: "USC PSI Lab", mark: "PSI", color: "#6e2c00", site: "https://www.usc.edu/", logo: "logos/usc_psi.png" },
    columbia_tri:  { name: "Columbia / TRI", mark: "CT", color: "#5c7ca8", site: "https://www.columbia.edu/", logo: "logos/columbia_tri.png" },
    qizhi:         { name: "Shanghai Qi Zhi", mark: "QZ", color: "#6b4226", site: "https://sqz.ac.cn/", logo: "logos/qizhi.png" },
    midea_ecnu:    { name: "Midea / ECNU", mark: "ME", color: "#4f7942", site: "https://www.midea.com/", logo: "logos/midea_ecnu.png" },
    roboarena:     { name: "RoboArena team", mark: "RA", color: "#4a5568", site: "https://robo-arena.github.io/", logo: "logos/roboarena.png" },
    openai:        { name: "OpenAI", mark: "AI", color: "#0b8a6f", site: "https://openai.com/", logo: "logos/openai.svg" },
    deepseek:      { name: "DeepSeek", mark: "DS", color: "#3f5ae0", site: "https://www.deepseek.com/", logo: "logos/deepseek.png" },
    liberai:       { name: "LiberAI", mark: "LB", color: "#a8471f", site: "", logo: "logos/liberai.png" },
    meituan:       { name: "Meituan Robotics", mark: "MT", color: "#b8860b", site: "https://about.meituan.com/" },
    openwam:       { name: "OpenWAM Team", mark: "OW", color: "#4c6b8a", site: "", logo: "logos/openwam.png" },
    simate:        { name: "Simate", mark: "SM", color: "#8e44ad", site: "", logo: "logos/simate.png" },
    hust:          { name: "Huazhong Univ. of Science and Technology", mark: "HU", color: "#1f5aa6", site: "https://www.hust.edu.cn/" },
    robochallenge: { name: "RoboChallenge", mark: "RC", color: "#46607a", site: "https://robochallenge.ai/", logo: "logos/robochallenge.png" },
    cmu:           { name: "Carnegie Mellon University", mark: "CMU", color: "#a0287a", site: "https://www.cmu.edu/" },
    anthropic:     { name: "Anthropic", mark: "A", color: "#cc785c", site: "https://www.anthropic.com/" },
    xai:           { name: "xAI", mark: "xAI", color: "#6b7280", site: "https://x.ai/" },
    moonshot:      { name: "Moonshot AI", mark: "K", color: "#be185d", site: "https://www.moonshot.ai/" },
    qwen:          { name: "Alibaba (Qwen team)", mark: "Qw", color: "#0e7490", site: "https://qwen.ai/" },
    minimax:       { name: "MiniMax", mark: "MM", color: "#e11d48", site: "https://www.minimax.io/" },
    meta:          { name: "Meta", mark: "M", color: "#4d7c0f", site: "https://ai.meta.com/" },
    thinking_machines: { name: "Thinking Machines", mark: "TM", color: "#a16207", site: "https://thinkingmachines.ai/" },
    mit:           { name: "MIT", mark: "MIT", color: "#a31f34", site: "https://www.mit.edu/" },
    unconfirmed:   { name: "Affiliation not confirmed", mark: "?", color: "#8a949b" },
    reference:     { name: "Reference baseline", mark: "H", color: "#aeb7bd" }
  },

  /* --- model sizes ----------------------------------------------------------
     `size` is the published string, verbatim. `sizeB` is a parameter count in
     BILLIONS, and is only present where the source states a single figure - not
     for ranges ("27M-93M"), not for backbone-plus-head sums, not for models whose
     size is undisclosed. The size slider on the ledger filters on `sizeB`, so a
     model without one drops out as soon as the slider is narrowed; the summary
     line says how many. SmolVLA is recorded at 0.45B, the checkpoint every
     benchmark row on this site evaluates.
     ------------------------------------------------------------------------ */

  /* --- task taxonomy -------------------------------------------------------- */
  tasks: [
    { id: "tabletop", family: "Robotics", name: "Tabletop manipulation", detail: "Pick-place, insertion, and tool use on a fixed base." },
    { id: "bimanual", family: "Robotics", name: "Bimanual manipulation", detail: "Coordinated two-arm tasks." },
    { id: "mobile", family: "Robotics", name: "Mobile manipulation", detail: "Manipulation combined with base movement." },
    { id: "loco", family: "Robotics", name: "Loco-manipulation", detail: "Whole-body humanoid control while manipulating." },
    { id: "household", family: "Robotics", name: "Long-horizon household", detail: "Multi-step activities in changing scenes." },
    { id: "generalist", family: "Robotics", name: "Open-ended generalist", detail: "Evaluator picks the task; no fixed task list." },
    { id: "driving", family: "Autonomous driving", name: "Autonomous driving", detail: "Perception, planning, and vehicle control." },
    { id: "world", family: "World models", name: "World-model prediction", detail: "Predict physical-world video without directly acting." },
    { id: "reasoning", family: "Embodied reasoning", name: "Embodied reasoning", detail: "Spatial and physical reasoning, pointing, and planning - no actuation." },
    { id: "industrial", family: "Industrial robotics", name: "Bin-picking and assembly", detail: "Throughput, reliability, and recovery on production-like tasks." },
    { id: "locomotion", family: "Robotics", name: "Whole-body locomotion", detail: "Balance, gait, contact, and disturbance rejection." },
    { id: "cad", family: "Mechanical design", name: "CAD modelling", detail: "Parts, edits and whole workflows produced as CAD models or CAD code." }
  ],

  /* --- benchmarks ----------------------------------------------------------- */
  benchmarks: [
    { id: "libero", name: "LIBERO", type: "Simulation", year: "2023", url: "https://libero-project.github.io/main.html", operator: "Lifelong Robot Learning (UT Austin)", runsPolicies: false },
    { id: "metaworld", name: "Meta-World", type: "Simulation", year: "2019", url: "https://meta-world.github.io/", operator: "Stanford / UC Berkeley", runsPolicies: false },
    { id: "rlbench", name: "RLBench", type: "Simulation", year: "2019", url: "https://sites.google.com/view/rlbench", operator: "Imperial College London", runsPolicies: false },
    { id: "calvin", name: "CALVIN", type: "Simulation", year: "2022", url: "https://calvin-rl.github.io/", operator: "University of Freiburg", runsPolicies: false },
    { id: "robocasa", name: "RoboCasa", type: "Simulation", year: "2024", url: "https://robocasa.ai/leaderboard.html", operator: "UT Austin / NVIDIA", runsPolicies: false },
    { id: "maniskill", name: "ManiSkill3", type: "GPU simulation", year: "2024", url: "https://maniskill.ai/", operator: "UC San Diego (Hillbot)", runsPolicies: false },
    { id: "behavior", name: "BEHAVIOR-1K", type: "Sim + transfer", year: "2023", url: "https://huggingface.co/spaces/behavior-1k/2026-challenge-leaderboard", operator: "Stanford Vision & Learning Lab", runsPolicies: false },
    { id: "simpler_bridge", name: "SimplerEnv (Bridge / WidowX)", type: "Sim-real paired", year: "2024", url: "https://simpler-env.github.io/", operator: "UC San Diego / Google DeepMind", runsPolicies: false },
    { id: "simpler_fractal", name: "SimplerEnv (Fractal / Google Robot)", type: "Sim-real paired", year: "2024", url: "https://simpler-env.github.io/", operator: "UC San Diego / Google DeepMind", runsPolicies: false },
    { id: "robotwin", name: "RoboTwin 2.0", type: "Sim + real alignment", year: "2025-2026", url: "https://robotwin-platform.github.io/leaderboard", operator: "MMLab@HKU / THU (RoboTwin Team)", runsPolicies: true },
    { id: "paw_gen_10", name: "PAW-GEN-10 (Poke & Wiggle)", type: "Real robot", year: "2026", url: "https://pokeandwiggle.com/leaderboard", operator: "Poke & Wiggle", runsPolicies: true },
    { id: "paramcad", name: "Parametric CAD Bench", type: "CAD, agents in FreeCAD", year: "2026", url: "https://cadbench.ai/leaderboard", operator: "gnucleus.ai", runsPolicies: true },
    { id: "benchcad", name: "BenchCAD (Vision2Code)", type: "CAD code from drawings", year: "2026", url: "https://benchcad.com/leaderboard", operator: "BenchCAD team", runsPolicies: true },
    { id: "cadarena", name: "CAD Arena", type: "CAD, agents in commercial CAD tools", year: "2026", url: "https://normal.ai/leaderboard/cad-arena", operator: "Normal", runsPolicies: true },
    { id: "cadbench_mit", name: "CADBench (MIT)", type: "CAD program reconstruction", year: "2026", url: "https://anniedoris.github.io/CADBench/#Leaderboard", operator: "MIT DeCoDE Lab", runsPolicies: true },
    { id: "cadworld", name: "CADWorld", type: "CAD, computer-use agents in FreeCAD", year: "2026", url: "https://cad-world.github.io", operator: "CADWorld authors", runsPolicies: true },
    { id: "neuralcad_edit", name: "neuralCAD-Edit", type: "CAD editing, expert-judged", year: "2026", url: "https://autodeskailab.github.io/neuralCAD-Edit/", operator: "Autodesk Research", runsPolicies: true },
    { id: "robodojo_sim", name: "RoboDojo (Sim)", type: "Simulation", year: "2026", url: "https://robodojo-benchmark.com/leaderboard", operator: "RoboDojo Team", runsPolicies: true },
    { id: "robodojo_real", name: "RoboDojo (Real)", type: "Real robot", year: "2026", url: "https://robodojo-benchmark.com/leaderboard", operator: "RoboDojo Team (RoboDojo-RealEval)", runsPolicies: true },
    { id: "robochallenge", name: "RoboChallenge Table30", type: "Real robot", year: "2025", url: "https://robochallenge.ai/leaderboard", operator: "RoboChallenge", runsPolicies: true },
    { id: "robochallenge_v2", name: "RoboChallenge Table30-v2", type: "Real robot", year: "2026", url: "https://robochallenge.ai/leaderboard", operator: "RoboChallenge", runsPolicies: true },
    { id: "robochallenge_cvpr26", name: "RoboChallenge CVPR 2026 competition", type: "Real robot, closed competition", year: "2026", url: "https://robochallenge.ai/competition/cvpr", operator: "RoboChallenge (GigaBrain Challenge 2026)", runsPolicies: true },
    { id: "robochallenge_icra26", name: "RoboChallenge ICRA 2026 competition", type: "Real robot, closed competition", year: "2026", url: "https://robochallenge.ai/competition/icra", operator: "RoboChallenge with Dexmal", runsPolicies: true },
    { id: "roboarena", name: "RoboArena", type: "Real robot, distributed", year: "2025-2026", url: "https://robo-arena.github.io/leaderboard", operator: "Berkeley / Stanford + 6 universities", runsPolicies: true },
    { id: "humanoid", name: "HumanoidBench", type: "Simulation", year: "2024", url: "https://humanoid-bench.github.io/", operator: "KAIST / UC Berkeley", runsPolicies: false },
    { id: "psi0_own_suite", name: "Psi-0 own real suite", type: "Real robot", year: "2026", url: "https://github.com/physical-superintelligence-lab/Psi0", operator: "USC PSI Lab", runsPolicies: false },
    { id: "smolvla_so100", name: "SmolVLA own SO-100 suite", type: "Real robot", year: "2025", url: "https://arxiv.org/abs/2506.01844", operator: "Hugging Face / LeRobot", runsPolicies: false },
    { id: "er_suite", name: "Embodied-reasoning suite (15 benchmarks)", type: "Vision-language", year: "2025", url: "https://deepmind.google/discover/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/", operator: "Various academic benchmarks", runsPolicies: false },
    { id: "pai", name: "PAI-Bench", type: "Video-based", year: "2026", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard", operator: "SHI Labs", runsPolicies: false },
    { id: "worldarena", name: "WorldArena", type: "World-model evaluation", year: "2026", url: "https://huggingface.co/spaces/WorldArena/WorldArena", operator: "Tsinghua FIB Lab", runsPolicies: false },
    { id: "phail_industrial", name: "PhAIL (Positronic)", type: "Real robot, industrial", year: "2026", url: "https://phail.ai/", operator: "Positronic Robotics / Nebius / Toloka", runsPolicies: true },
    { id: "openvla_oft_efficiency", name: "OpenVLA-OFT inference profile", type: "Efficiency measurement", year: "2025", url: "https://openvla-oft.github.io/", operator: "Stanford (Kim et al.)", runsPolicies: false }
  ],

  /* --- models ---------------------------------------------------------------
     `maker: "Not confirmed"` is deliberate: for several 2026 entries the only
     source we have is a leaderboard row, which gives a name and a citation key
     but no affiliation. We leave it blank rather than guess.
     ------------------------------------------------------------------------ */
  models: [
    { id: "openvla", name: "OpenVLA", maker: "Stanford / UC Berkeley / TRI", org: "stanford", open: "Open", embodiment: "Cross-embodiment", size: "7B params", sizeB: 7, runtime: "RTX 4090 (15GB bf16)", license: "MIT", note: "970k Open X-Embodiment demonstrations; ~6 Hz on one RTX 4090 per the authors." },
    { id: "openvla_oft", name: "OpenVLA-OFT", maker: "Stanford (Kim et al.)", org: "stanford", open: "Open", embodiment: "Cross-embodiment", size: "7B params (OpenVLA backbone)", sizeB: 7, runtime: "Consumer GPU", license: "MIT", note: "Optimised fine-tuning recipe: parallel decoding, action chunking, L1 regression." },
    { id: "pi0", name: "pi-0", maker: "Physical Intelligence", org: "physical_intelligence", open: "Open", embodiment: "Single/dual-arm, mobile", size: "~3.3B params", sizeB: 3.3, runtime: ">8GB VRAM", license: "Apache-2.0 (openpi)" },
    { id: "pi0_fast", name: "pi-0-FAST", maker: "Physical Intelligence", org: "physical_intelligence", open: "Open", embodiment: "Single/dual-arm", size: "~3B params", sizeB: 3, runtime: ">8GB VRAM", license: "Apache-2.0 (openpi)", note: "Autoregressive FAST action-tokeniser variant of pi-0." },
    { id: "pi05", name: "pi-0.5", maker: "Physical Intelligence", org: "physical_intelligence", open: "Open", embodiment: "Mobile manipulation, dual-arm", size: "Not officially disclosed", runtime: ">8GB VRAM", license: "Apache-2.0 (openpi)", note: "Headline claims in the pi-0.5 paper are qualitative (cleaning unseen homes), not benchmark numbers." },
    { id: "octo", name: "Octo", maker: "UC Berkeley (RAIL)", org: "berkeley", open: "Open", embodiment: "Tabletop", size: "27M-93M params", runtime: "Consumer GPU", license: "MIT" },
    { id: "smolvla", name: "SmolVLA", maker: "Hugging Face / LeRobot", org: "huggingface", open: "Open", embodiment: "Tabletop", size: "0.24B / 0.45B / 2.25B params", sizeB: 0.45, runtime: "Consumer GPU or CPU", license: "Apache-2.0", note: "Trainable on a single GPU; asynchronous inference decouples action prediction from execution." },
    { id: "groot_n16", name: "GR00T N1.6", maker: "NVIDIA", org: "nvidia", open: "Open weights", embodiment: "Cross-embodiment", size: "3B params", sizeB: 3, runtime: "NVIDIA GPU", license: "NVIDIA model terms" },
    { id: "groot_n17", name: "GR00T N1.7", maker: "NVIDIA", org: "nvidia", open: "Open weights", embodiment: "Cross-embodiment", size: "3B params", sizeB: 3, runtime: "NVIDIA GPU", license: "NVIDIA model terms", note: "N1.7 refreshes documented results across RoboCasa, SimplerEnv, LIBERO, and real Unitree G1." },
    { id: "dit_flow", name: "DiT-Flow", maker: "Carnegie Mellon University / UC Berkeley (Dasari et al.)", org: "cmu", open: "Open", embodiment: "Not specific", size: "115M params", sizeB: 0.115, license: "MIT", note: "Diffusion-transformer policy (code: SudeepDasari/dit-policy, Oct 2024). No public pretrained checkpoint: PAW-GEN-10 trains it from an ImageNet vision encoder." },
    { id: "gemini_15", name: "Gemini Robotics 1.5", maker: "Google DeepMind", org: "deepmind", open: "Closed", embodiment: "Bi-arm", size: "Not reported", runtime: "Partner access", license: "Closed (select partners)" },
    { id: "gemini_er15", name: "Gemini Robotics-ER 1.5", maker: "Google DeepMind", org: "deepmind", open: "Closed", embodiment: "World model", size: "Not reported", runtime: "Gemini API", license: "Closed", note: "Reasons about the physical world; does not drive actuators." },
    { id: "helix", name: "Helix", maker: "Figure AI", org: "figure", open: "Closed", embodiment: "Humanoid", size: "Not reported", runtime: "Embedded GPU (onboard)", license: "Closed", note: "200 Hz whole-upper-body control per Figure's own announcement; no public benchmark number." },
    { id: "rdt1b", name: "RDT-1B", maker: "Tsinghua (TSAIL)", org: "tsinghua", open: "Open", embodiment: "Bi-arm", size: "1B params", sizeB: 1, runtime: "GPU", license: "MIT" },
    { id: "h_rdt", name: "H-RDT", maker: "Tsinghua", org: "tsinghua", open: "Open", embodiment: "Bi-arm", size: "Not reported", runtime: "GPU", license: "Open research" },
    { id: "act", name: "ACT", maker: "Stanford (Zhao et al.)", org: "stanford", open: "Open", embodiment: "Bi-arm", size: "~80M params", sizeB: 0.08, runtime: "GPU", license: "MIT", note: "Single-task imitation baseline, not a generalist policy." },
    { id: "dp", name: "Diffusion Policy", maker: "Columbia / TRI", org: "columbia_tri", open: "Open", embodiment: "Tabletop", size: "Not reported", runtime: "GPU", license: "MIT", note: "Single-task imitation baseline." },
    { id: "dp3", name: "DP3 (3D Diffusion Policy)", maker: "Shanghai Qi Zhi / Tsinghua", org: "qizhi", open: "Open", embodiment: "Bi-arm", size: "Not reported", runtime: "GPU", license: "MIT" },
    { id: "dit_policy", name: "DiT Policy", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "Tabletop", size: "Not reported" },
    { id: "tinyvla", name: "TinyVLA", maker: "Midea Group / ECNU (Wen et al.)", org: "midea_ecnu", open: "Open", embodiment: "Tabletop", size: "Sub-1B params", runtime: "Consumer GPU" },
    { id: "cogact", name: "CogACT", maker: "Microsoft Research", org: "microsoft", open: "Open", embodiment: "Cross-embodiment", size: "Not reported" },
    { id: "go1", name: "GO-1", maker: "AgiBot", org: "agibot", open: "Open weights", embodiment: "Humanoid", size: "Not reported" },
    { id: "galaxea_g0", name: "GalaxeaVLA (G0)", maker: "Galaxea", org: "galaxea", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "internvla_a1", name: "InternVLA-A1", maker: "Shanghai AI Laboratory", org: "shanghai_ai_lab", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "x_vla", name: "X-VLA", maker: "Tsinghua AIR", org: "tsinghua", open: "Open", embodiment: "Cross-embodiment", size: "0.9B params", sizeB: 0.9, cite: "Zheng et al., arXiv:2510.10274 (ICLR 2026); affiliation read off the THU-AIR-DREAM repository, not stated on the leaderboard" },
    { id: "x_wam", name: "X-WAM", maker: "Xiaomi Robotics / Tsinghua University", org: "xiaomi", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Guo et al., arXiv:2604.26694 - X-WAM: Unified 4D World Action Modeling" },
    { id: "aha_wam", name: "AHA-WAM", maker: "Shanghai Jiao Tong University / Baidu AI Cloud", org: "sjtu", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Cai et al., arXiv:2606.09811" },
    { id: "fast_wam", name: "Fast-WAM", maker: "Tsinghua IIIS / Galaxea AI", org: "tsinghua", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Yuan et al., arXiv:2603.16666 - every author lists both affiliations" },
    { id: "wam_4d", name: "4D-WAM", maker: "OpenHelix Robotics", org: "openhelix", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "spatial_forcing", name: "Spatial Forcing", maker: "OpenHelix-Team", org: "openhelix", open: "Open", embodiment: "Not reported", size: "Not reported", cite: "Li et al., arXiv:2510.12276 (ICLR 2026); attribution from the OpenHelix-Team repository" },
    { id: "hy_embodied", name: "Hy-Embodied-0.5-VLA", maker: "Tencent Robotics X / Tencent Hy Team", org: "tencent", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Zhang et al., arXiv:2606.14409 - affiliation read off the paper's title block" },
    { id: "xiaomi_r0", name: "Xiaomi-Robotics-0", maker: "Xiaomi", org: "xiaomi", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "starvla", name: "StarVLA-alpha", maker: "HKUST (with CUHK, Tongyi Lab, SmartMore)", org: "hkust", open: "Open", embodiment: "Not reported", size: "Not reported", cite: "Ye et al., arXiv:2604.11757" },
    { id: "gigaworld_policy", name: "GigaWorld-Policy", maker: "GigaAI", org: "gigaai", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "gigabrain_01", name: "GigaBrain-0.1", maker: "GigaAI", org: "gigaai", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "gigabrain_07", name: "GigaBrain-0.7", maker: "GigaAI", org: "gigaai", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "lingbot", name: "LingBot-VLA", maker: "Ant Group (Robbyant)", org: "ant_group", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Wu et al., A Pragmatic VLA Foundation Model - ~20,000 hours of real data from 9 dual-arm configurations" },
    { id: "eventvla", name: "EventVLA", maker: "Shanghai Jiao Tong University / Huawei / Shanghai AI Laboratory", org: "sjtu", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Yang et al., arXiv:2606.20092" },
    { id: "abot_m0", name: "ABot-M0", maker: "AMAP CV Lab (Alibaba)", org: "alibaba", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Yang et al., arXiv:2602.11236" },
    { id: "molmoact2", name: "MolmoAct2", maker: "Allen Institute for AI / University of Washington", org: "ai2", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Fang et al., arXiv:2605.02881" },
    { id: "lda1b", name: "LDA-1B", maker: "Galbot (with Peking University, CASIA, BAAI)", org: "galbot", open: "Not reported", embodiment: "Not reported", size: "1B params (per name)", sizeB: 1, cite: "Lyu et al., arXiv:2602.12215 (RSS 2026)" },
    { id: "dexora", name: "Dexora-1B", maker: "Tsinghua University / BAAI", org: "tsinghua", open: "Not reported", embodiment: "Not reported", size: "1B params (per name)", sizeB: 1, cite: "Zhang et al., arXiv:2605.18722 (ICRA 2026)" },
    { id: "a1_model", name: "A1", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Zhang et al., arXiv:2604.05672 - the HTML version does not expose author affiliations, so this one stays unattributed" },
    { id: "spirit15", name: "Spirit v1.5", maker: "Spirit AI", org: "spirit_ai", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "dm0", name: "DM0", maker: "Dexmal", org: "dexmal", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "dm05", name: "DM0.5", maker: "Dexmal", org: "dexmal", open: "Open weights", embodiment: "Bi-arm, multi-embodiment", size: "6B params", sizeB: 6, license: "Gemma licence", note: "Released 9 Jul 2026 (huggingface.co/Dexmal/DM05). On RoboChallenge v2 it is listed as VLA-DM0.5, submitted under KDDI Research; Dexmal's release post quotes the same 54.42, so the entry is filed here." },
    { id: "era0", name: "Era0", maker: "Robotera", org: "robotera", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "lira", name: "Lira", maker: "Atlas", org: "atlas", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "atlas_generalist", name: "Atlas generalist", maker: "Atlas", org: "atlas", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "zr0", name: "ZR-0", maker: "Atlas", org: "atlas", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "wall_oss", name: "WALL-OSS v0.1", maker: "X Square Robot", org: "xsquare", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "vlo", name: "VLO", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ola_sem", name: "OLA-Sem", maker: "OLA-HKUSTGZ", org: "ola", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "ola_geo", name: "OLA-Geo", maker: "OLA-HKUSTGZ", org: "ola", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "dreamzero", name: "DreamZero", maker: "NVIDIA", org: "nvidia", open: "Open", embodiment: "Tabletop", size: "Not reported", note: "World-action model on a video-diffusion backbone; the DROID checkpoint is trained on DROID alone. All authors listed under NVIDIA on the project page." },
    { id: "paligemma_droid", name: "PaliGemma-DROID", maker: "RoboArena team", org: "roboarena", open: "Open", embodiment: "Tabletop", size: "3B (PaliGemma backbone)", sizeB: 3, note: "Five action-representation variants trained by the RoboArena authors as reference policies." },
    { id: "magicbot", name: "MagicBot", maker: "MagicBot", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "jv0", name: "JV0", maker: "JIIOV", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "mc_brains", name: "mc", maker: "mcBrains", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "my16", name: "my16", maker: "Submitted by Tymtbo", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "rc_baseline", name: "RoboChallenge baseline model", maker: "RoboChallenge", org: "robochallenge", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    /* RoboChallenge entrants known only by their board name and team handle (read 2026-09-29). */
    { id: "my_grasper", name: "my grasper", maker: "Submitted by 周熊队", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "pi_grnvla", name: "pi (GRNVLA)", maker: "Submitted by GRNVLA", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "pi05_prismbot", name: "pi05 (prismbot)", maker: "Submitted by prismbot", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "kp_robot_icra", name: "kp-robot (ICRA)", maker: "Submitted by kp-robot", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "irobot_v1", name: "irobot_v1", maker: "Submitted by iRobot", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "mypi05_cooler", name: "mypi0.5", maker: "Submitted by Cooler Robotics", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "gr00t_89757", name: "gr00t (No.89757)", maker: "Submitted by No.89757", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "dywp", name: "DYWP", maker: "Submitted by 断雁无凭", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "mypi05_casia", name: "mypi05", maker: "Submitted by CASIA Pioneer", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "biuh_tum", name: "BIUH_TUM", maker: "Submitted by biuh_tum", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "vla_test_0204", name: "VLA_test_0204", maker: "Submitted by Xiangyue Wu", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "vla_test_0119", name: "VLA_test_0119", maker: "Submitted by Xiangyue Wu", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "holobrain", name: "holobrain", maker: "Submitted by HRL", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "test_01", name: "test_01", maker: "Submitted by VLA", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "w0", name: "W0", maker: "Submitted by WMA", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "debuggers_vla", name: "debuggers_vla", maker: "Submitted by debuggers", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "hcp_e", name: "hcp-e", maker: "Submitted by HCP-E", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "astraeus_v1_5", name: "Astraeus_V1.5", maker: "Submitted by Yuze Xuan", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "egovla", name: "EgoVLA", maker: "Submitted by Yuhao Chen", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ustb_linketic", name: "USTB-Linketic", maker: "Submitted by Zhenyang Wei", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "vict", name: "vict", maker: "Submitted by victory team", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "arx5_multitask", name: "ARX5-multitask", maker: "Submitted by Hua Xue", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "astraeus_v1_6", name: "Astraeus_V1.6", maker: "Submitted by Yuze Xuan", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ambase", name: "ambase", maker: "Submitted by AVerse001", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "multivla", name: "MultiVLA", maker: "Submitted by Vertex", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "roborush", name: "RoboRush", maker: "Submitted by RoboRush", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "metrics", name: "metrics", maker: "Submitted by Metrics", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "xyz", name: "xyz", maker: "Submitted by xyz", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "avp", name: "AVP", maker: "Submitted by Any-01", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "smartvla", name: "smartVLA", maker: "Submitted by smartVLA", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "astraeus_v1", name: "Astraeus_V1", maker: "Submitted by Yuze Xuan", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ngrob", name: "NGRob", maker: "Submitted by Next Gen Robot", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "brainc", name: "BrainC", maker: "Submitted by YunJinBrains", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "dos_w1_multitask", name: "DOS-W1-multitask", maker: "Submitted by Hua Xue", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "tengenx0_1", name: "TengenX0.1", maker: "Submitted by Yimin Chen", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "aloha_multitask", name: "ALOHA-multitask", maker: "Submitted by Hua Xue", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "keti_pi05", name: "KETI_pi0.5", maker: "KETI - a fine-tune of pi-0.5", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "tvt", name: "TvT", maker: "Submitted by TvT", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "happy_farm", name: "happy_farm", maker: "Submitted by YZF", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ur5_multitask", name: "UR5-multitask", maker: "Submitted by Hua Xue", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "astraeus_v1_7", name: "Astraeus_V1.7", maker: "Submitted by Yuze Xuan", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "aloha05", name: "Aloha05", maker: "db0 (submitted by jiafan)", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "robotpioneer", name: "RobotPioneer", maker: "Submitted by RobotPioneer", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "echomind_master", name: "EchoMind Master", maker: "Submitted by EchoMind Master", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "pi_aloha_base", name: "pi-aloha-base", maker: "Submitted by AVerse001", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "moveon", name: "moveon", maker: "Submitted by 能动就行", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "wp", name: "wp", maker: "Submitted by zhaogs", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "r0", name: "R0", maker: "Submitted by VLM", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "wam_v0", name: "WAM_v0", maker: "Submitted by Nanfang Zheng", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "m36_e0", name: "M36-E0", maker: "Submitted by Bo Zhang", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "pi05_robocare", name: "pi05 (robocare)", maker: "robocare - a fine-tune of pi-0.5", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ei_wam_53m", name: "EI-WAM-53M", maker: "Submitted by Jiahao Wu", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "datawhale_vla", name: "Datawhale-VLA", maker: "Submitted by Datawhale-EAI", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "testmulti6", name: "testmulti6", maker: "Submitted by THUEE", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "vertical", name: "vertical", maker: "Submitted by Vertical", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "pb_vla", name: "pb_vla", maker: "Submitted by PB", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "kp_robot", name: "kp-robot", maker: "Submitted by Lutos_sanzu", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "dm_opd", name: "DM-OPD", maker: "Submitted by Wenjuan Han", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "minicpm_robotmanip", name: "MiniCPM-RobotManip", maker: "Submitted by Modelbest", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "gpt6_astra", name: "GPT-6-Astra", maker: "OpenAI", org: "openai", open: "Closed (API)", embodiment: "None of its own", size: "Not disclosed", runtime: "API", license: "Closed", note: "A general text+image model with no robotics training and no motor outputs. Every robot number attached to it was produced by someone else's harness - see the spotlight page." },
    { id: "gpt55", name: "GPT-5.5", maker: "OpenAI", org: "openai", open: "Closed (API)", embodiment: "None of its own", size: "Not disclosed", runtime: "API", license: "Closed" },
    { id: "deepseek_flash", name: "DeepSeek-Flash", maker: "DeepSeek", org: "deepseek", open: "Not reported", embodiment: "None of its own", size: "Not disclosed", runtime: "API", license: "Not reported", note: "Third planner through the identical RoboDojo L3 harness, at 10 episodes per task rather than 50." },
    /* CAD Index entrants (read 2026-09-30): language and vision-language models, plus CAD-specialised models. */
    { id: "claude_opus_55", name: "Claude Opus 5.5", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_fable_51", name: "Claude Fable 5.1", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_opus_5", name: "Claude Opus 5", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_opus_48", name: "Claude Opus 4.8", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_opus_47", name: "Claude Opus 4.7", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_sonnet_5", name: "Claude Sonnet 5", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_sonnet_46", name: "Claude Sonnet 4.6", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_sonnet_45", name: "Claude Sonnet 4.5", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_mythos_5", name: "Claude Mythos 5", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "claude_mythos_preview", name: "Claude Mythos Preview", maker: "Anthropic", org: "anthropic", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt6_sol", name: "GPT-6 Sol", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt6_luna", name: "GPT-6 Luna", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt56_sol", name: "GPT-5.6 Sol", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt56_terra", name: "GPT-5.6 Terra", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt56_luna", name: "GPT-5.6 Luna", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt54", name: "GPT-5.4", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt53", name: "GPT-5.3", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt52", name: "GPT-5.2", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gpt4o", name: "GPT-4o", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "openai_o3", name: "o3", maker: "OpenAI", org: "openai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gemini_38_flash", name: "Gemini 3.8 Flash", maker: "Google DeepMind", org: "deepmind", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gemini_31_pro", name: "Gemini 3.1 Pro", maker: "Google DeepMind", org: "deepmind", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "gemini_3_pro", name: "Gemini 3 Pro", maker: "Google DeepMind", org: "deepmind", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "grok_47", name: "Grok 4.7", maker: "xAI", org: "xai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "grok_46", name: "Grok 4.6", maker: "xAI", org: "xai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "grok_45", name: "Grok 4.5", maker: "xAI", org: "xai", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "kimi_k3", name: "Kimi K3", maker: "Moonshot AI", org: "moonshot", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "kimi_k26", name: "Kimi K2.6", maker: "Moonshot AI", org: "moonshot", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "moonshot_v1_128k", name: "Moonshot v1-128k", maker: "Moonshot AI", org: "moonshot", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "moonshot_v1_8k", name: "Moonshot v1-8k", maker: "Moonshot AI", org: "moonshot", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "qwen3_vl_2b", name: "Qwen3-VL-2B", maker: "Alibaba (Qwen team)", org: "qwen", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "qwen35_27b", name: "Qwen 3.5 27B", maker: "Alibaba (Qwen team)", org: "qwen", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "qwen35_9b", name: "Qwen 3.5 9B", maker: "Alibaba (Qwen team)", org: "qwen", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "qwen36", name: "Qwen3.6", maker: "Alibaba (Qwen team)", org: "qwen", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "minimax_m3", name: "MiniMax M3", maker: "MiniMax", org: "minimax", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "muse_13", name: "Muse 1.3", maker: "Meta", org: "meta", open: "Not reported", embodiment: "None of its own", size: "Not disclosed", note: "Listed as Muse 1.3 by CAD Arena. Parametric CAD Bench lists a Muse Spark 1.3; they may be the same model, but neither board says so, so they are kept apart." },
    { id: "muse_spark_13", name: "Muse Spark 1.3", maker: "Not confirmed (a Muse model)", org: "unconfirmed", open: "Not reported", embodiment: "None of its own", size: "Not disclosed", note: "See Muse 1.3 - possibly the same model under another name." },
    { id: "inkling", name: "Inkling", maker: "Thinking Machines", org: "thinking_machines", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "inkling_small", name: "Inkling Small", maker: "Thinking Machines", org: "thinking_machines", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "deepseek_v4", name: "DeepSeek V4", maker: "DeepSeek", org: "deepseek", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "opencua", name: "OpenCUA", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "holo_31", name: "Holo 3.1", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "cad_coder", name: "CAD-Coder", maker: "MIT (DeCoDE Lab)", org: "mit", open: "Not reported", embodiment: "None of its own", size: "Not disclosed", note: "Open vision-language model fine-tuned to write CAD code." },
    { id: "cadfit", name: "CADFit", maker: "MIT (DeCoDE Lab)", org: "mit", open: "Not reported", embodiment: "None of its own", size: "Not disclosed", note: "Mesh-to-CAD program generation with hybrid optimisation." },
    { id: "cadevolve", name: "CADEvolve", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "cadrille", name: "Cadrille", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "cad_recode", name: "CAD-Recode", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "None of its own", size: "Not disclosed" },
    { id: "liber0_preview", name: "Liber-0 Preview", maker: "LiberAI", org: "liberai", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "liber0_lite", name: "Liber-0 Lite", maker: "LiberAI", org: "liberai", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "galaxea_g05", name: "GalaxeaVLA (G0.5)", maker: "Galaxea", org: "galaxea", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "xiaomi_r1", name: "Xiaomi-Robotics-1", maker: "Xiaomi", org: "xiaomi", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "simate_beta", name: "Simate-beta", maker: "Simate", org: "simate", open: "Not reported", embodiment: "Not reported", size: "Withheld", note: "From a company founded in mid-2026. Scale and architecture are held back for a future technical report; press coverage of the result calls it self-reported, with no independent re-verification.", cite: "No paper yet. Company described in ByteWoops, 2026-09-24" },
    { id: "kinrt", name: "KinRT", maker: "Tsinghua SIGS / Pengcheng Lab", org: "tsinghua", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Yang et al., arXiv:2607.26807 - kinematics-supervised expert routing in an MoE-augmented VLA. The board lists the submitter as IIGroup, Yujiu Yang's group at Tsinghua SIGS" },
    { id: "simplememvla", name: "SimpleMemVLA", maker: "HUST / Tsinghua / ModelBest et al.", org: "hust", open: "Open", embodiment: "Not reported", size: "Qwen3.5-4B backbone + flow-matching action head", cite: "Yin et al., arXiv:2609.05533; code at github.com/OpenBMB/SimpleMemVLA. Filed under HUST, the first institution on the title block" },
    { id: "openwam_alpha", name: "OpenWAM-alpha", maker: "OpenWAM Team", org: "openwam", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "No affiliation is stated on the leaderboard and we found none published, so the contributor name stands in for the lab." },
    { id: "meituan_r0", name: "Meituan-Robotics-0", maker: "Meituan Robotics", org: "meituan", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "internvla_a15", name: "InternVLA-A1.5", maker: "Shanghai AI Laboratory", org: "shanghai_ai_lab", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "starvla_pi_v3", name: "StarVLA-PI_v3", maker: "StarVLA Team (HKUST)", org: "hkust", open: "Open", embodiment: "Not reported", size: "Not reported" },
    { id: "starvla_groot", name: "StarVLA-GR00T", maker: "StarVLA Team (HKUST)", org: "hkust", open: "Open", embodiment: "Not reported", size: "Not reported" },
    { id: "starvla_oft", name: "StarVLA-OFT", maker: "StarVLA Team (HKUST)", org: "hkust", open: "Open", embodiment: "Not reported", size: "Not reported" },
    { id: "vlact", name: "VLAct", maker: "StarVLA Team (HKUST)", org: "hkust", open: "Open", embodiment: "Not reported", size: "Not reported" },
    { id: "psi0", name: "Psi-0", maker: "USC PSI Lab + NVIDIA + WorldEngine", org: "usc_psi", open: "Open", embodiment: "Humanoid", size: "~500M action expert + Qwen3-VL-2B backbone", runtime: "Robot GPU", license: "GitHub" },
    { id: "omega0", name: "Omega-0", maker: "Not confirmed (arXiv 2608.06375)", org: "unconfirmed", open: "Not reported", embodiment: "Humanoid", size: "Not reported" },
    { id: "agibot", name: "AGIBOT BFM / GCFM", maker: "AgiBot (Shanghai)", org: "agibot", open: "Not reported", embodiment: "Humanoid", size: "Not reported" },
    { id: "cosmos", name: "NVIDIA Cosmos", maker: "NVIDIA", org: "nvidia", open: "Open weights", embodiment: "World model", size: "Not reported", runtime: "GPU-hours" }
  ],

  /* --- results, grouped one block per cited table ---------------------------- */
  resultGroups: [

    /* ====================== BENCHMARK-RUN: RoboDojo Sim =====================
       Read off the OFFICIAL LIVE BOARD, not the arXiv paper. The board has moved
       well past the July table: 48 models instead of 30, MolmoAct2 re-scored from
       1.02 to 8.99 after a full evaluation, three frontier LLMs added in
       September, and Simate-beta at the top from 2026-09-23. pi-0.5 was quietly
       re-scored between our two reads (11.41 -> 11.44). Where the live board and
       the paper disagree, the board wins.
       ---------------------------------------------------------------------- */
    {
      id: "robodojo-sim",
      task: "tabletop",
      benchmark: "robodojo_sim",
      track: "Sim",
      metric: "Capability score / Success rate",
      provenance: "benchmark",
      reporter: "RoboDojo Team",
      source: "RoboDojo official leaderboard, RoboDojo-Sim board (48 models, board updated 2026-09-23)",
      sourceUrl: "https://robodojo-benchmark.com/leaderboard",
      retrieved: "2026-09-27",
      protocol: "42 tasks x 50 episodes x 3 seeds (2,100 episodes per policy); DeepSeek-Flash at 10 episodes per task",
      primary: "score",
      unit: "score",
      secondary: "success",
      secondaryUnit: "%",
      dims: ["Generalization", "Precision", "Long-horizon", "Memory", "Open-vocab"],
      note: "Live board, so these values move. `submitter` is the contributor column: roughly half these entries were evaluated by the RoboDojo Team itself, the rest submitted by the model's own team. Open-vocabulary instruction following is where nearly every trained policy is close to zero.",
      rows: [
        { model: "simate_beta", score: 33.95, success: 27.96, d: [35.09, 34.35, 57.84, 33.33, 9.12], submitter: "Simate", note: "Top of the board from 2026-09-23. Leads on long-horizon (57.84) by twelve points; generalization is the mean of 40.54 on standard and 29.63 on randomised layouts, the smallest standard-to-random drop of any trained policy here." },
        { model: "liber0_preview", score: 30.74, success: 25.52, d: [24.99, 38.28, 45.98, 37.77, 6.68], submitter: "LiberAI" },
        { model: "liber0_lite", score: 29.24, success: 24.23, d: [25.36, 36.6, 45.5, 35.68, 3.06], submitter: "LiberAI" },
        { model: "gpt6_astra", score: 28.97, success: 22.48, d: [33.36, 12.65, 21.45, 43.04, 34.36], submitter: "RoboDojo Team" },
        { model: "dm05", score: 24.9, success: 19.34, d: [15.77, 24.82, 33.7, 47.74, 2.43], submitter: "Dexmal" },
        { model: "galaxea_g05", score: 20.23, success: 14.88, d: [18.46, 28.25, 44.12, 8.61, 1.73], submitter: "Galaxea AI" },
        { model: "xiaomi_r1", score: 20.07, success: 13.93, d: [23.54, 26.69, 38.39, 7.81, 3.94], submitter: "Xiaomi Robotics" },
        { model: "openwam_alpha", score: 17.18, success: 11.92, d: [20.71, 18.45, 34.93, 10.41, 1.41], submitter: "OpenWAM Team" },
        { model: "meituan_r0", score: 14.95, success: 9.53, d: [13.75, 16.77, 29.61, 10.06, 4.54], submitter: "Meituan Robotics" },
        { model: "hy_embodied", score: 13.07, success: 8.8, d: [11.78, 13.81, 25.74, 13.37, 0.65], submitter: "Tencent Robotics X" },
        { model: "kinrt", score: 13.02, success: 8.8, d: [14.02, 15.65, 26.4, 4.82, 4.23], submitter: "IIGroup" },
        { model: "simplememvla", score: 12.58, success: 9.27, d: [6.36, 7.42, 14.58, 33.71, 0.85], submitter: "SimpleMemVLA Team", note: "A memory model, and it shows: 33.71 on the memory axis is third on the board, while precision is 7.42. Higher success rate than the two entries above it on Score." },
        { model: "spatial_forcing", score: 12.38, success: 8.04, d: [14.12, 17.32, 23.26, 5.43, 1.78], submitter: "OpenHelix Robotics" },
        { model: "pi05", score: 11.44, success: 6.93, d: [13.38, 12.4, 23.54, 5.89, 1.98], submitter: "RoboDojo Team", note: "Re-scored on the live board between 2026-09-17 (11.41 / 6.91%) and 2026-09-27; the memory axis moved from 5.78 to 5.89." },
        { model: "internvla_a15", score: 11.15, success: 7.14, d: [10.35, 15.23, 23.8, 4.93, 1.43], submitter: "InternVLA Team" },
        { model: "starvla_pi_v3", score: 10.81, success: 7.51, d: [11.22, 17.77, 18.46, 4.59, 2.03], submitter: "StarVLA Team" },
        { model: "vlact", score: 10.65, success: 7.58, d: [9.54, 20.57, 20.12, 0.66, 2.37], submitter: "StarVLA Team" },
        { model: "x_vla", score: 10.13, success: 6.52, d: [10.47, 18.32, 16.53, 4.76, 0.55], submitter: "RoboDojo Team" },
        { model: "molmoact2", score: 8.99, success: 5.03, d: [8.53, 10.92, 15.2, 5.53, 4.75], submitter: "MolmoAct2 Team" },
        { model: "starvla_groot", score: 8.25, success: 4.67, d: [7.96, 9.56, 16.18, 5.6, 1.95], submitter: "StarVLA Team" },
        { model: "starvla_oft", score: 8.18, success: 4.82, d: [7.41, 16.08, 14.28, 1.74, 1.41], submitter: "StarVLA Team" },
        { model: "x_wam", score: 7.69, success: 3.83, d: [7.39, 6.72, 17.47, 6.32, 0.57], submitter: "X-WAM Team" },
        { model: "xiaomi_r0", score: 6.93, success: 4.18, d: [7.43, 8.42, 13.51, 5.07, 0.22], submitter: "RoboDojo Team" },
        { model: "starvla", score: 6.4, success: 3.24, d: [3.94, 9.9, 14.15, 3.34, 0.67], submitter: "RoboDojo Team" },
        { model: "gigaworld_policy", score: 6.2, success: 3.27, d: [5.34, 6.15, 15.51, 3.46, 0.54], submitter: "RoboDojo Team" },
        { model: "galaxea_g0", score: 5.82, success: 2.96, d: [4.54, 8.1, 12.6, 3.17, 0.7], submitter: "RoboDojo Team" },
        { model: "lingbot", score: 5.5, success: 2.96, d: [6.71, 5.33, 10.89, 3.82, 0.72], submitter: "RoboDojo Team" },
        { model: "eventvla", score: 4.97, success: 2.81, d: [3.95, 10.13, 5.05, 4.92, 0.8], submitter: "SJTU ScaleLab" },
        { model: "aha_wam", score: 4.82, success: 2.39, d: [5.79, 5.86, 8.61, 2.97, 0.88], submitter: "SJTU ScaleLab" },
        { model: "abot_m0", score: 3.67, success: 1.73, d: [5.73, 5.5, 3.96, 2.44, 0.72], submitter: "RoboDojo Team" },
        { model: "fast_wam", score: 3.48, success: 2.03, d: [2.33, 1.96, 9.14, 3.55, 0.42], submitter: "RoboDojo Team" },
        { model: "pi0", score: 3.48, success: 1.53, d: [3.94, 3.56, 6.19, 3.47, 0.25], submitter: "RoboDojo Team" },
        { model: "deepseek_flash", score: 2.99, success: 1.92, d: [2.42, 1.75, 2.12, 2.17, 6.5], submitter: "RoboDojo Team" },
        { model: "groot_n17", score: 2.85, success: 1.31, d: [2.16, 2.54, 8.3, 1.06, 0.18], submitter: "RoboDojo Team" },
        { model: "internvla_a1", score: 2.48, success: 1.08, d: [2.86, 3.0, 4.79, 1.58, 0.17], submitter: "RoboDojo Team" },
        { model: "smolvla", score: 1.82, success: 0.85, d: [1.68, 2.87, 1.22, 3.35, 0.0], submitter: "RoboDojo Team", variant: "single-task" },
        { model: "lda1b", score: 1.66, success: 0.54, d: [0.81, 3.33, 1.98, 2.11, 0.08], submitter: "RoboDojo Team" },
        { model: "gpt55", score: 1.13, success: 0.88, d: [0.19, 0.42, 0.51, 1.67, 2.87], submitter: "RoboDojo Team" },
        { model: "act", score: 1.08, success: 0.47, d: [0.69, 0.85, 1.73, 2.15, 0.0], submitter: "RoboDojo Team", variant: "single-task" },
        { model: "go1", score: 0.99, success: 0.53, d: [1.58, 1.45, 1.13, 0.7, 0.08], submitter: "RoboDojo Team" },
        { model: "h_rdt", score: 0.67, success: 0.12, d: [0.49, 0.41, 2.23, 0.12, 0.08], submitter: "RoboDojo Team" },
        { model: "rdt1b", score: 0.51, success: 0.13, d: [0.55, 0.38, 1.13, 0.49, 0.0], submitter: "RoboDojo Team" },
        { model: "dm0", score: 0.45, success: 0.05, d: [0.49, 0.61, 0.97, 0.2, 0.0], submitter: "RoboDojo Team" },
        { model: "dexora", score: 0.38, success: 0.02, d: [0.49, 0.49, 0.82, 0.12, 0.01], submitter: "RoboDojo Team" },
        { model: "a1_model", score: 0.28, success: 0.02, d: [0.16, 0.09, 1.07, 0.0, 0.08], submitter: "RoboDojo Team" },
        { model: "spirit15", score: 0.23, success: 0.14, d: [0.8, 0.03, 0.11, 0.22, 0.0], submitter: "RoboDojo Team" },
        { model: "tinyvla", score: 0.22, success: 0.07, d: [0.03, 0.05, 0.67, 0.11, 0.25], submitter: "RoboDojo Team" },
        { model: "openvla_oft", score: 0.21, success: 0.02, d: [0.04, 0.2, 0.7, 0.0, 0.08], submitter: "RoboDojo Team" }
      ]
    },

    /* ====================== BENCHMARK-RUN: RoboDojo Real ====================
       Also from the live board. OpenWAM-alpha took the top of this board in
       September and does not appear in the paper table at all.
       ---------------------------------------------------------------------- */
    {
      id: "robodojo-real",
      task: "tabletop",
      benchmark: "robodojo_real",
      track: "Real",
      metric: "Score / Success rate (overall average)",
      provenance: "benchmark",
      reporter: "RoboDojo Team",
      source: "RoboDojo official leaderboard, RoboDojo-RealWorld board (11 models, unchanged at the 2026-09-27 read)",
      sourceUrl: "https://robodojo-benchmark.com/leaderboard",
      retrieved: "2026-09-27",
      protocol: "18 tasks x 10 trials across ARX X5, Piper, and Piper X (180 trials per policy)",
      primary: "score",
      unit: "score",
      secondary: "success",
      secondaryUnit: "%",
      extras: ["arx", "piper", "piperX"],
      note: "The per-robot columns are the interesting part: every policy on this board does better on Piper than on Piper X, and four of them score a flat zero on one of the three arms.",
      rows: [
        { model: "openwam_alpha", score: 37.6, success: 24.4, arx: 39.0, piper: 46.7, piperX: 27.2, submitter: "OpenWAM Team" },
        { model: "pi05", score: 22.9, success: 12.8, arx: 27.7, piper: 32.0, piperX: 9.1, submitter: "RoboDojo Team" },
        { model: "internvla_a1", score: 12.0, success: 7.2, arx: 10.0, piper: 23.2, piperX: 2.7, submitter: "RoboDojo Team" },
        { model: "galaxea_g0", score: 9.0, success: 4.4, arx: 3.4, piper: 22.0, piperX: 1.7, submitter: "RoboDojo Team" },
        { model: "xiaomi_r0", score: 7.9, success: 3.9, arx: 15.0, piper: 7.6, piperX: 1.2, submitter: "RoboDojo Team" },
        { model: "x_vla", score: 7.6, success: 3.3, arx: 6.8, piper: 15.9, piperX: 0.1, submitter: "RoboDojo Team" },
        { model: "groot_n17", score: 5.9, success: 1.7, arx: 9.3, piper: 6.8, piperX: 1.4, submitter: "RoboDojo Team" },
        { model: "pi0", score: 5.8, success: 1.7, arx: 8.1, piper: 9.0, piperX: 0.3, submitter: "RoboDojo Team" },
        { model: "starvla", score: 4.1, success: 1.7, arx: 0.0, piper: 12.0, piperX: 0.5, submitter: "RoboDojo Team" },
        { model: "spirit15", score: 1.6, success: 0.6, arx: 0.0, piper: 4.0, piperX: 0.7, submitter: "RoboDojo Team" },
        { model: "dm0", score: 0.0, success: 0.0, arx: 0.0, piper: 0.0, piperX: 0.0, submitter: "RoboDojo Team" }
      ]
    },

    /* ================= BENCHMARK-RUN: RoboChallenge Table30 ================= */
    {
      id: "robochallenge-t30",
      task: "tabletop",
      benchmark: "robochallenge",
      track: "Real",
      metric: "Progress score / Success rate",
      provenance: "benchmark",
      reporter: "RoboChallenge (runs the robots itself)",
      source: "RoboChallenge live leaderboard, table-30 board (22 entries, read 2026-09-29)",
      sourceUrl: "https://robochallenge.ai/leaderboard",
      retrieved: "2026-09-29",
      protocol: "30 tasks x 10 rollouts on UR5, Franka, Cobot Magic Aloha, and ARX-5 (10 machines)",
      primary: "success",
      unit: "%",
      secondary: "score",
      secondaryUnit: "progress",
      note: "RoboChallenge executes every rollout on its own hardware, but the checkpoints are submitted by outside teams - `submitter` records who sent each one. Live board, so these values move.",
      rows: [
        { model: "era0", success: 64.33, score: 76.34, submitter: "Robotera" },
        { model: "dm0", success: 62.00, score: 72.25, submitter: "Dexmal" },
        { model: "gigabrain_01", success: 51.67, score: 68.34, submitter: "lyf" },
        { model: "spirit15", success: 51.00, score: 67.19, submitter: "Spirit AI" },
        { model: "lira", success: 45.00, score: 59.83, submitter: "Atlas", variant: "generalist" },
        { model: "pi05", success: 42.67, score: 61.84, submitter: "RoboChallenge baseline", note: "The RoboChallenge tech report quotes 43.7% / 62.2 for task-specific fine-tuned pi-0.5; the live board has since been updated." },
        { model: "atlas_generalist", success: 39.67, score: 55.10, submitter: "Atlas" },
        { model: "dm0", success: 37.33, score: 49.08, submitter: "Dexmal", variant: "generalist" },
        { model: "wall_oss", success: 35.33, score: 55.30, submitter: "Pushi Zhang" },
        { model: "pi0", success: 28.33, score: 46.41, submitter: "RoboChallenge baseline" },
        { model: "vlo", success: 25.67, score: 42.34, submitter: "Sicheng Xie" },
        { model: "x_vla", success: 21.33, score: 34.75, submitter: "Chongyang Xu" },
        { model: "pi05", success: 17.67, score: 31.27, submitter: "wyf", variant: "generalist" },
        { model: "rdt1b", success: 15.00, score: 28.84, submitter: "zsz" },
        { model: "groot_n17", success: 14.33, score: 31.64, submitter: "Sicheng Xie", variant: "board label: GR00T", note: "The board says only 'GR00T' - the minor version is not stated, so we file it under N1.7 provisionally." },
        { model: "groot_n17", success: 13.33, score: 28.39, submitter: "Sicheng Xie", variant: "GR00T-MULTI" },
        { model: "zr0", success: 12.67, score: 29.20, submitter: "Atlas", variant: "generalist" },
        { model: "cogact", success: 11.67, score: 21.83, submitter: "hsk" },
        { model: "pi0", success: 9.00, score: 20.22, submitter: "wyf", variant: "generalist" },
        { model: "vla_test_0204", success: 9.00, score: 17.33, submitter: "Xiangyue Wu", variant: "generalist" },
        { model: "vla_test_0119", success: 5.00, score: 21.95, submitter: "Xiangyue Wu", variant: "generalist" },
        { model: "openvla_oft", success: 5.00, score: 8.66, submitter: "gkf" }
      ]
    },

    /* ============== BENCHMARK-RUN: RoboChallenge Table30-v2 ================= */
    {
      id: "robochallenge-t30v2",
      task: "tabletop",
      benchmark: "robochallenge_v2",
      track: "Real",
      metric: "Progress score / Success rate",
      provenance: "benchmark",
      reporter: "RoboChallenge (runs the robots itself)",
      source: "RoboChallenge live leaderboard, table-30-v2 board (all 53 entries, read 2026-09-29)",
      sourceUrl: "https://robochallenge.ai/leaderboard",
      retrieved: "2026-09-29",
      protocol: "30 tasks x 10 rollouts, refreshed task set",
      primary: "success",
      unit: "%",
      secondary: "score",
      secondaryUnit: "progress",
      extras: ["tasks"],
      taskTotal: 30,
      note: "v2 is markedly harder than v1: the top entry drops from 64.3% to 40.7%. The board averages every entry over all 30 tasks, so a task a team did not run counts as zero - `tasks` is how many of the 30 each entry ran (only 3 ran 29 or more). Most entries are team handles with no public model card, so the maker is just the submitter. LoopWAM (28.67% / 45.03, liangyingping), listed on 17 Sep, is gone from the board on 29 Sep and is dropped here.",
      rows: [
        { model: "dm05", success: 40.67, score: 54.42, tasks: 30, submitter: "KDDI Research", variant: "board label: VLA-DM0.5", note: "Dexmal's DM0.5 release post quotes this same 54.42 on Table30-v2." },
        { model: "my16", success: 30.67, score: 41.27, tasks: 20, submitter: "Tymtbo" },
        { model: "jv0", success: 16.00, score: 27.58, tasks: 20, submitter: "JIIOV" },
        { model: "mc_brains", success: 15.33, score: 23.63, tasks: 18, submitter: "mcBrains" },
        { model: "magicbot", success: 14.67, score: 20.82, tasks: 20, submitter: "MagicBot" },
        { model: "rc_baseline", success: 14.33, score: 31.48, tasks: 30, submitter: "RoboChallenge" },
        { model: "holobrain", success: 14.33, score: 27.93, tasks: 24, submitter: "HRL" },
        { model: "test_01", success: 12.33, score: 22.73, tasks: 19, submitter: "VLA" },
        { model: "w0", success: 12.00, score: 21.85, tasks: 29, submitter: "WMA" },
        { model: "debuggers_vla", success: 11.00, score: 18.72, tasks: 20, submitter: "debuggers" },
        { model: "hcp_e", success: 10.33, score: 19.20, tasks: 20, submitter: "HCP-E" },
        { model: "astraeus_v1_5", success: 8.67, score: 13.87, tasks: 23, submitter: "Yuze Xuan" },
        { model: "egovla", success: 7.67, score: 21.28, tasks: 28, submitter: "Yuhao Chen" },
        { model: "ustb_linketic", success: 7.33, score: 14.90, tasks: 14, submitter: "Zhenyang Wei" },
        { model: "vict", success: 7.33, score: 12.72, tasks: 19, submitter: "victory team" },
        { model: "arx5_multitask", success: 6.67, score: 13.00, tasks: 7, submitter: "Hua Xue" },
        { model: "astraeus_v1_6", success: 6.33, score: 11.57, tasks: 9, submitter: "Yuze Xuan" },
        { model: "ambase", success: 6.33, score: 8.30, tasks: 8, submitter: "AVerse001" },
        { model: "multivla", success: 6.00, score: 12.85, tasks: 16, submitter: "Vertex" },
        { model: "roborush", success: 6.00, score: 12.33, tasks: 15, submitter: "RoboRush" },
        { model: "metrics", success: 5.67, score: 16.12, tasks: 20, submitter: "Metrics" },
        { model: "xyz", success: 5.33, score: 8.83, tasks: 9, submitter: "xyz" },
        { model: "avp", success: 5.00, score: 9.58, tasks: 10, submitter: "Any-01" },
        { model: "smartvla", success: 4.00, score: 7.25, tasks: 6, submitter: "smartVLA" },
        { model: "astraeus_v1", success: 3.67, score: 8.42, tasks: 7, submitter: "Yuze Xuan" },
        { model: "ngrob", success: 3.33, score: 6.28, tasks: 13, submitter: "Next Gen Robot" },
        { model: "brainc", success: 3.00, score: 10.10, tasks: 7, submitter: "YunJinBrains" },
        { model: "dos_w1_multitask", success: 3.00, score: 5.53, tasks: 9, submitter: "Hua Xue" },
        { model: "tengenx0_1", success: 2.00, score: 8.68, tasks: 10, submitter: "Yimin Chen" },
        { model: "aloha_multitask", success: 2.00, score: 5.92, tasks: 9, submitter: "Hua Xue" },
        { model: "keti_pi05", success: 2.00, score: 5.42, tasks: 3, submitter: "KETI" },
        { model: "tvt", success: 2.00, score: 5.12, tasks: 7, submitter: "TvT" },
        { model: "happy_farm", success: 1.67, score: 4.05, tasks: 9, submitter: "YZF" },
        { model: "ur5_multitask", success: 1.00, score: 5.95, tasks: 3, submitter: "Hua Xue" },
        { model: "astraeus_v1_7", success: 1.00, score: 3.67, tasks: 7, submitter: "Yuze Xuan" },
        { model: "aloha05", success: 1.00, score: 1.52, tasks: 1, submitter: "jiafan" },
        { model: "robotpioneer", success: 0.67, score: 3.22, tasks: 15, submitter: "RobotPioneer" },
        { model: "echomind_master", success: 0.33, score: 4.22, tasks: 17, submitter: "EchoMind Master" },
        { model: "pi_aloha_base", success: 0.00, score: 2.97, tasks: 4, submitter: "AVerse001" },
        { model: "moveon", success: 0.00, score: 2.60, tasks: 11, submitter: "能动就行" },
        { model: "wp", success: 0.00, score: 2.53, tasks: 10, submitter: "zhaogs" },
        { model: "r0", success: 0.00, score: 1.92, tasks: 4, submitter: "VLM" },
        { model: "wam_v0", success: 0.00, score: 1.42, tasks: 3, submitter: "Nanfang Zheng" },
        { model: "m36_e0", success: 0.00, score: 1.15, tasks: 6, submitter: "Bo Zhang" },
        { model: "pi05_robocare", success: 0.00, score: 0.73, tasks: 10, submitter: "robocare" },
        { model: "ei_wam_53m", success: 0.00, score: 0.37, tasks: 7, submitter: "Jiahao Wu" },
        { model: "datawhale_vla", success: 0.00, score: 0.20, tasks: 1, submitter: "Datawhale-EAI" },
        { model: "testmulti6", success: 0.00, score: 0.18, tasks: 3, submitter: "THUEE" },
        { model: "vertical", success: 0.00, score: 0.17, tasks: 4, submitter: "Vertical" },
        { model: "pb_vla", success: 0.00, score: 0.00, tasks: 3, submitter: "PB" },
        { model: "kp_robot", success: 0.00, score: 0.00, tasks: 1, submitter: "Lutos_sanzu" },
        { model: "dm_opd", success: 0.00, score: 0.00, tasks: 4, submitter: "Wenjuan Han" },
        { model: "minicpm_robotmanip", success: 0.00, score: 0.00, tasks: 3, submitter: "Modelbest" }
      ]
    },

    /* ========= BENCHMARK-RUN, CLOSED COMPETITION: RoboChallenge CVPR 2026 =========
       Kept out of the Ranking index (ranking-data.js `outOfIndex`). */
    {
      id: "robochallenge-cvpr26",
      task: "tabletop",
      benchmark: "robochallenge_cvpr26",
      track: "Real",
      metric: "Progress score / Success rate",
      provenance: "benchmark",
      reporter: "RoboChallenge (runs the robots itself)",
      source: "RoboChallenge CVPR 2026 Workshop Competition (GigaBrain Challenge 2026, RoboChallenge track), final leaderboard of 18 May 2026",
      sourceUrl: "https://robochallenge.ai/competition/cvpr",
      retrieved: "2026-09-29",
      protocol: "RoboChallenge's own 'Table30 CVPR version': one model for all 30 tasks, run remotely on the operator's robots; scored by the competition's group-completion rule",
      primary: "success",
      unit: "%",
      secondary: "score",
      secondaryUnit: "progress",
      extras: ["tasks"],
      taskTotal: 30,
      note: "Closed competition, frozen on 18 May 2026. Kept out of the Ranking index: all 30 entrants are also on Table30-v2, scored there under a different rule (my16: 40.9% here, 30.7% on v2), so ranking both would count the same teams twice. The reason is also stated on the Ranking tab.",
      rows: [
        { model: "my16", success: 40.89, score: 55.02, tasks: 20, submitter: "Tymtbo" },
        { model: "jv0", success: 21.33, score: 36.78, tasks: 20, submitter: "JIIOV" },
        { model: "mc_brains", success: 21.33, score: 32.62, tasks: 20, submitter: "mcBrains" },
        { model: "magicbot", success: 19.56, score: 27.76, tasks: 20, submitter: "MagicBot" },
        { model: "rc_baseline", success: 18.44, score: 37.38, tasks: 30, submitter: "RoboChallenge" },
        { model: "holobrain", success: 18.44, score: 35.53, tasks: 24, submitter: "HRL" },
        { model: "test_01", success: 16.44, score: 30.31, tasks: 20, submitter: "VLA" },
        { model: "w0", success: 15.67, score: 26.30, tasks: 30, submitter: "WMA" },
        { model: "debuggers_vla", success: 14.67, score: 24.96, tasks: 20, submitter: "debuggers" },
        { model: "hcp_e", success: 13.78, score: 25.60, tasks: 20, submitter: "HCP-E" },
        { model: "vict", success: 9.78, score: 16.96, tasks: 20, submitter: "victory team" },
        { model: "roborush", success: 8.44, score: 17.76, tasks: 16, submitter: "RoboRush" },
        { model: "metrics", success: 7.56, score: 21.49, tasks: 20, submitter: "Metrics" },
        { model: "xyz", success: 7.11, score: 11.78, tasks: 9, submitter: "xyz" },
        { model: "avp", success: 6.67, score: 12.78, tasks: 10, submitter: "Any-01" },
        { model: "smartvla", success: 5.33, score: 9.67, tasks: 6, submitter: "smartVLA" },
        { model: "ngrob", success: 4.44, score: 8.38, tasks: 13, submitter: "Next Gen Robot" },
        { model: "brainc", success: 4.00, score: 13.47, tasks: 7, submitter: "YunJinBrains" },
        { model: "keti_pi05", success: 2.67, score: 7.22, tasks: 3, submitter: "KETI" },
        { model: "tvt", success: 2.67, score: 6.82, tasks: 7, submitter: "TvT" },
        { model: "happy_farm", success: 2.22, score: 5.40, tasks: 10, submitter: "YZF" },
        { model: "robotpioneer", success: 0.89, score: 4.64, tasks: 17, submitter: "RobotPioneer" },
        { model: "echomind_master", success: 0.44, score: 4.57, tasks: 24, submitter: "EchoMind Master" },
        { model: "pi_aloha_base", success: 0.00, score: 3.96, tasks: 4, submitter: "AVerse001" },
        { model: "moveon", success: 0.00, score: 3.47, tasks: 13, submitter: "能动就行" },
        { model: "wp", success: 0.00, score: 3.38, tasks: 10, submitter: "zhaogs" },
        { model: "r0", success: 0.00, score: 2.56, tasks: 4, submitter: "VLM" },
        { model: "pi05_robocare", success: 0.00, score: 0.98, tasks: 13, submitter: "robocare" },
        { model: "testmulti6", success: 0.00, score: 0.24, tasks: 10, submitter: "THUEE" },
        { model: "vertical", success: 0.00, score: 0.22, tasks: 6, submitter: "Vertical" }
      ]
    },

    /* ========= BENCHMARK-RUN, CLOSED COMPETITION: RoboChallenge ICRA 2026 =========
       Kept out of the Ranking index (ranking-data.js `outOfIndex`). */
    {
      id: "robochallenge-icra26",
      task: "mobile",
      benchmark: "robochallenge_icra26",
      track: "Real",
      metric: "Weighted score / Success rate",
      provenance: "benchmark",
      reporter: "RoboChallenge with Dexmal (Whole Body Control track)",
      source: "RoboChallenge ICRA 2026 Competition, final leaderboard of 28 May 2026",
      sourceUrl: "https://robochallenge.ai/competition/icra",
      retrieved: "2026-09-29",
      protocol: "2 supermarket tasks (navigate, pick up and load goods, restock), weighted 0.4 and 0.6; each team's best run counts",
      primary: "success",
      unit: "%",
      secondary: "score",
      secondaryUnit: "weighted",
      extras: ["tasks"],
      taskTotal: 2,
      note: "Closed competition, frozen on 28 May 2026. Kept out of the Ranking index: only 2 tasks, a different task category (mobile manipulation in a shop, not table-top), and apart from the organiser's baseline no entrant appears on any other board, so it adds no comparison between models. The reason is also stated on the Ranking tab.",
      rows: [
        { model: "my_grasper", success: 94.00, score: 99.20, tasks: 2, submitter: "周熊队" },
        { model: "pi_grnvla", success: 84.00, score: 92.50, tasks: 2, submitter: "GRNVLA" },
        { model: "pi05_prismbot", success: 80.00, score: 89.10, tasks: 2, submitter: "prismbot" },
        { model: "kp_robot_icra", success: 56.00, score: 76.90, tasks: 2, submitter: "kp-robot" },
        { model: "rc_baseline", success: 50.00, score: 71.60, tasks: 2, submitter: "RoboChallenge", variant: "ICRA track baseline" },
        { model: "irobot_v1", success: 42.00, score: 65.70, tasks: 2, submitter: "iRobot" },
        { model: "mypi05_cooler", success: 36.00, score: 61.90, tasks: 2, submitter: "Cooler Robotics" },
        { model: "gr00t_89757", success: 32.00, score: 61.40, tasks: 2, submitter: "No.89757" },
        { model: "dywp", success: 32.00, score: 59.60, tasks: 2, submitter: "断雁无凭" },
        { model: "mypi05_casia", success: 24.00, score: 52.00, tasks: 2, submitter: "CASIA Pioneer" },
        { model: "biuh_tum", success: 0.00, score: 7.20, tasks: 1, submitter: "biuh_tum" }
      ]
    },

    /* ==================== BENCHMARK-RUN: RoboTwin 2.0 ====================== */
    {
      id: "robotwin-2",
      task: "bimanual",
      benchmark: "robotwin",
      track: "Sim",
      metric: "Success rate, clean-to-clean / clean-to-random",
      provenance: "benchmark",
      reporter: "RoboTwin Team (MMLab@HKU / THU), via the XPolicyLab interface",
      source: "RoboTwin 2.0 leaderboard, overall ranking by Average (c2c+c2r); board last updated 2026-09-01",
      sourceUrl: "https://robotwin-platform.github.io/leaderboard",
      retrieved: "2026-09-17",
      protocol: "Train on 50 clean demos x 50 tasks (2,500), then 100 trials/task on Aloha-AgileX under demo_clean and demo_randomized",
      primary: "success",
      unit: "%",
      extras: ["easy", "hard"],
      note: "The easy/hard gap matters more than the average: several policies above 70% on clean scenes fall below 5% under domain randomisation. Listing requires public code, public weights, and a technical report.",
      rows: [
        { model: "ola_sem", success: 71.3, easy: 75.1, hard: 67.6, submitter: "OLA-HKUSTGZ", variant: "co-train" },
        { model: "gigabrain_07", success: 67.3, easy: 66.8, hard: 67.9, submitter: "GigaAI", variant: "co-train" },
        { model: "wam_4d", success: 61.6, easy: 81.5, hard: 41.8, submitter: "OpenHelix Robotics", variant: "co-train" },
        { model: "pi05", success: 58.4, easy: 70.7, hard: 46.0, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "ola_geo", success: 58.3, easy: 83.0, hard: 33.6, submitter: "OLA-HKUSTGZ", variant: "co-train" },
        { model: "spatial_forcing", success: 52.0, easy: 77.2, hard: 26.7, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "x_wam", success: 47.9, easy: 70.0, hard: 25.8, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "x_vla", success: 44.5, easy: 68.0, hard: 20.9, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "abot_m0", success: 43.9, easy: 57.4, hard: 30.4, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "eventvla", success: 40.6, easy: 65.6, hard: 15.7, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "xiaomi_r0", success: 40.5, easy: 62.9, hard: 18.2, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "fast_wam", success: 39.9, easy: 77.8, hard: 1.9, submitter: "RoboTwin Team", variant: "co-train", note: "77.8% on clean scenes, 1.9% under randomisation - the widest robustness gap on the board." },
        { model: "galaxea_g0", success: 37.7, easy: 62.7, hard: 12.7, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "aha_wam", success: 33.8, easy: 64.3, hard: 3.2, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "pi0", success: 31.38, easy: 46.42, hard: 16.34, submitter: "RoboTwin Team", variant: "single-task" },
        { model: "dp3", success: 30.10, easy: 55.24, hard: 4.96, submitter: "RoboTwin Team", variant: "single-task" },
        { model: "starvla", success: 24.8, easy: 46.5, hard: 3.2, submitter: "RoboTwin Team", variant: "co-train" },
        { model: "rdt1b", success: 24.11, easy: 34.50, hard: 13.72, submitter: "RoboTwin Team", variant: "single-task" },
        { model: "act", success: 15.74, easy: 29.74, hard: 1.74, submitter: "RoboTwin Team", variant: "single-task" },
        { model: "dp", success: 14.34, easy: 28.04, hard: 0.64, submitter: "RoboTwin Team", variant: "single-task" }
      ]
    },

    /* ================= BENCHMARK-RUN: PAW-GEN-10 (Poke & Wiggle) ================
       Read from the page's own data attributes (exact values, not the rounded
       display). `env` follows `envs`. Extra metrics kept for later use:
       quality = Excellent share of successes, timeS = mean active seconds of a
       success, stepsPerMin = task steps per active minute, sparc = smoothness
       (closer to -1 is smoother), jerk in m/s^3, safeFail = share of failures
       that left both arms ok, forceN = mean of each episode's max contact force.
       ---------------------------------------------------------------------- */
    {
      id: "paw-gen-10",
      task: "tabletop",
      benchmark: "paw_gen_10",
      track: "Real",
      metric: "Success rate (episodes rated Ok or Excellent) / Progress",
      provenance: "benchmark",
      reporter: "Poke & Wiggle (fine-tunes and runs every model)",
      source: "Poke & Wiggle Reality Check Leaderboard, PAW-GEN-10 (4 models)",
      sourceUrl: "https://pokeandwiggle.com/leaderboard",
      retrieved: "2026-09-30",
      protocol: "10 environments on a two-arm Franka FR3 Duo station, 5 public and 5 held out; every model fine-tuned by the operator from its public checkpoint on ~10, ~100 and ~300 demonstrations per environment (DiT-Flow from an ImageNet encoder); 30 scenes on training placements and 30 on unseen placements per environment and data tier; 30 Hz arm and gripper control",
      primary: "success",
      unit: "%",
      secondary: "progress",
      secondaryUnit: "%",
      extras: ["d10", "d100", "d300", "nominal", "interp"],
      envs: ["Sort screws into bins", "Datum-corner alignment", "Pour screws into the funnel", "Connect DC jack", "Route cable through closed hoops", "Put tools in standing toolbox", "Place loaded boxes in container (bimanual)", "Place spray bottles upright, nozzle forward (bimanual handover)", "Open the toolbox with a screwdriver", "Clamp electrical component"],
      note: "The operator trains every model itself, from the developer's public checkpoint and recipe, so the board compares models under one training and test protocol. It states 3,600 evaluations per model, but every rate it publishes is a multiple of 1/1,800 (1/180 per environment, 1/600 per data tier), so the Ranking uses 1,800 episodes per model. Also publishes execution speed, smoothness, contact force and the share of failures that stayed safe.",
      rows: [
        { model: "molmoact2", success: 28.17, progress: 45.12, d10: 3.83, d100: 36.50, d300: 44.17, nominal: 30.89, interp: 25.44, env: [10.00, 44.44, 51.67, 15.00, 20.56, 4.44, 41.67, 51.67, 18.33, 23.89], quality: 78.50, timeS: 39.6, stepsPerMin: 7.87, sparc: -6.07, jerk: 4.93, safeFail: 69.06, forceN: 66.2, evals: 3600 },
        { model: "pi05", success: 21.00, progress: 39.73, d10: 4.50, d100: 25.67, d300: 32.83, nominal: 23.00, interp: 19.00, env: [4.44, 39.44, 65.56, 2.22, 9.44, 2.78, 12.78, 58.89, 12.78, 1.67], quality: 74.34, timeS: 37.1, stepsPerMin: 8.37, sparc: -5.73, jerk: 10.29, safeFail: 93.53, forceN: 45.6, evals: 3600 },
        { model: "dit_flow", success: 18.50, progress: 33.78, d10: 2.33, d100: 24.17, d300: 29.00, nominal: 21.44, interp: 15.56, env: [1.67, 16.67, 48.33, 1.67, 0.00, 1.11, 32.22, 62.78, 16.11, 4.44], quality: 85.29, timeS: 40.1, stepsPerMin: 8.48, sparc: -5.93, jerk: 7.65, safeFail: 96.93, forceN: 34.7, evals: 3600 },
        { model: "groot_n17", success: 12.11, progress: 33.43, d10: 3.50, d100: 13.83, d300: 19.00, nominal: 12.67, interp: 11.56, env: [2.78, 13.89, 25.00, 1.11, 0.56, 1.11, 13.89, 50.00, 12.78, 0.00], quality: 58.26, timeS: 45.0, stepsPerMin: 8.24, sparc: -6.56, jerk: 15.70, safeFail: 82.81, forceN: 50.1, evals: 3600 }
      ]
    },

    /* ======================= CAD INDEX TABLES (read 2026-09-30) ======================= */
    {
      id: "paramcad-v3",
      task: "cad",
      benchmark: "paramcad",
      track: "Design",
      metric: "Mean task reward, 0-100 (failed or unscored tasks count as zero)",
      provenance: "benchmark",
      reporter: "gnucleus.ai (runs every agent itself, Harbor harness)",
      source: "Parametric CAD Bench V3 leaderboard (13 runs)",
      sourceUrl: "https://cadbench.ai/leaderboard",
      retrieved: "2026-09-30",
      protocol: "100 FreeCAD tasks: 30 create from text, 30 create then edit from text, 40 create from engineering drawings; one run per model, agent and effort",
      primary: "overall",
      unit: "score",
      extras: ["create", "createEdit", "image", "costPerTask"],
      note: "Each row is one model with one agent harness and effort level (variant); the index keeps each model's best row. The board's 95% intervals are stored as `se` (half-width / 1.96) and used as the noise. Cost is the whole 100-task run divided by 100.",
      rows: [
        { model: "claude_opus_55", overall: 61.03, se: 3.84, create: 50.87, createEdit: 39.69, image: 84.66, perfect: 9, scored: 99, costPerTask: 5.74, variant: "Claude Code 2.1.280, max effort" },
        { model: "claude_opus_55", overall: 57.96, se: 3.99, create: 42.79, createEdit: 41.38, image: 81.77, perfect: 8, scored: 93, costPerTask: 4.98, variant: "mini-swe-agent 2.4.6, max effort" },
        { model: "gpt6_astra", overall: 56.87, se: 3.49, create: 52.26, createEdit: 44.37, image: 69.70, perfect: 5, scored: 100, costPerTask: 3.18, variant: "Codex 0.154.0, max effort" },
        { model: "claude_fable_51", overall: 56.75, se: 3.66, create: 55.48, createEdit: 36.75, image: 72.71, perfect: 7, scored: 98, costPerTask: 10.56, variant: "Claude Code 2.1.270, max effort" },
        { model: "claude_opus_5", overall: 50.86, se: 3.80, create: 49.48, createEdit: 36.52, image: 62.64, perfect: 6, scored: 99, costPerTask: 10.12, variant: "Claude Code 2.1.270, max effort" },
        { model: "gemini_38_flash", overall: 36.19, se: 3.56, create: 47.94, createEdit: 31.22, image: 31.10, perfect: 4, scored: 94, costPerTask: 2.72, variant: "mini-swe-agent 2.4.6, high effort" },
        { model: "grok_47", overall: 34.82, se: 3.39, create: 45.57, createEdit: 34.63, image: 26.91, perfect: 3, scored: 100, costPerTask: 6.70, variant: "Grok Build 1.0.30, high effort" },
        { model: "gpt56_sol", overall: 29.98, se: 3.15, create: 36.23, createEdit: 24.78, image: 29.20, perfect: 1, scored: 100, costPerTask: 2.92, variant: "Codex 0.154.0, max effort" },
        { model: "grok_46", overall: 27.72, se: 3.21, create: 41.61, createEdit: 33.45, image: 13.00, perfect: 2, scored: 100, costPerTask: 3.91, variant: "Grok Build 1.0.30, high effort" },
        { model: "gemini_38_flash", overall: 27.56, se: 3.43, create: 43.28, createEdit: 25.32, image: 17.45, perfect: 4, scored: 100, costPerTask: 1.97, variant: "Antigravity 1.2.7, high effort" },
        { model: "kimi_k3", overall: 24.92, se: 3.27, create: 39.11, createEdit: 23.49, image: 15.36, perfect: 1, scored: 96, costPerTask: 3.15, variant: "mini-swe-agent 2.4.6, max effort" },
        { model: "muse_spark_13", overall: 20.92, se: 2.96, create: 33.61, createEdit: 24.33, image: 8.84, perfect: 1, scored: 99, costPerTask: 3.57, variant: "mini-swe-agent 2.4.6, max effort" },
        { model: "gpt56_terra", overall: 17.24, se: 2.98, create: 23.32, createEdit: 23.23, image: 8.18, perfect: 0, scored: 99, costPerTask: 2.15, variant: "Codex 0.154.0, max effort" }
      ]
    },
    {
      id: "benchcad-vision2code",
      task: "cad",
      benchmark: "benchcad",
      track: "Design",
      metric: "IoU-score x100 (voxel IoU x execution rate; failed programs score 0)",
      provenance: "benchmark",
      reporter: "BenchCAD team (re-grades submitted predictions itself)",
      source: "BenchCAD leaderboard, Vision2Code task, entries BenchCAD re-graded",
      sourceUrl: "https://benchcad.com/leaderboard",
      retrieved: "2026-09-30",
      protocol: "Four orthographic views of an industrial part in, a CadQuery program out; the program is re-executed and compared with the ground-truth solid",
      primary: "iou",
      unit: "score",
      extras: ["iouTools"],
      note: "Only the rows BenchCAD re-graded itself. Rows the vendors reported (marked * on the board) are in the self-reported table below. Effort level in `variant`; `iouTools` is the agentic setting with a Python sandbox. GPT-4o on blank images is BenchCAD's control.",
      rows: [
        { model: "grok_46", iou: 36.38, iouTools: 80.55, variant: "xhigh effort" },
        { model: "grok_45", iou: 31.94, iouTools: 77.71, variant: "high effort" },
        { model: "kimi_k3", iou: 36.70, variant: "max effort" },
        { model: "gpt4o", iou: 18.23 },
        { model: "gpt53", iou: 18.73 },
        { model: "gpt53", iou: 17.93, variant: "max effort" },
        { model: "claude_sonnet_46", iou: 19.20 },
        { model: "claude_sonnet_46", iou: 22.20, variant: "max effort" },
        { model: "claude_opus_47", iou: 26.17 },
        { model: "claude_opus_47", iou: 26.92, variant: "max effort" },
        { model: "gemini_31_pro", iou: 27.79 },
        { model: "gemini_31_pro", iou: 28.90, variant: "thinking effort" },
        { model: "openai_o3", iou: 12.18 },
        { model: "moonshot_v1_128k", iou: 1.60 },
        { model: "moonshot_v1_8k", iou: 1.27 },
        { model: "qwen3_vl_2b", iou: 0.05 },
        { model: "gpt4o", iou: 6.98, variant: "control: blank images" },
        { model: "grok_46", iou: 35.10, variant: "high effort" }
      ]
    },
    {
      id: "benchcad-vision2code-vendor",
      task: "cad",
      benchmark: "benchcad",
      track: "Design",
      metric: "IoU-score x100, as reported by the vendor",
      provenance: "model",
      reporter: "Model vendors (Anthropic system cards, OpenAI launch tables), listed on BenchCAD",
      source: "BenchCAD leaderboard, Vision2Code task, rows marked * (self-reported, not re-graded)",
      sourceUrl: "https://benchcad.com/leaderboard",
      retrieved: "2026-09-30",
      protocol: "Vendor-run; Anthropic on a random 1,000-file subset, OpenAI without tools",
      primary: "iou",
      unit: "score",
      extras: ["iouTools"],
      note: "Self-reported by the model's maker on its own set-up and subset, so a different kind of claim from the re-graded table; used only with Evidence = + paper tables.",
      rows: [
        { model: "claude_opus_55", iou: 73.00, iouTools: 96.20, variant: "max effort" },
        { model: "gpt6_astra", iouTools: 95.90 },
        { model: "claude_fable_51", iou: 60.60, iouTools: 92.60, variant: "max effort" },
        { model: "claude_opus_5", iou: 49.70, iouTools: 89.90, variant: "max effort" },
        { model: "gpt56_sol", iou: 70.60, iouTools: 83.40, variant: "max effort" },
        { model: "gpt56_terra", iou: 62.30, iouTools: 78.20, variant: "max effort" },
        { model: "gpt56_luna", iou: 63.10, iouTools: 73.90, variant: "max effort" },
        { model: "claude_mythos_5", iou: 38.40, iouTools: 65.00, variant: "max effort" },
        { model: "claude_mythos_preview", iou: 35.50, iouTools: 61.00, variant: "max effort" },
        { model: "gpt55", iou: 44.40, iouTools: 55.80, variant: "max effort" },
        { model: "claude_sonnet_5", iou: 32.20, iouTools: 51.90, variant: "max effort" },
        { model: "claude_opus_48", iou: 27.30, iouTools: 51.80, variant: "max effort" }
      ]
    },
    {
      id: "cad-arena",
      task: "cad",
      benchmark: "cadarena",
      track: "Design",
      metric: "CAD Arena score x100 (mean of geometry and editability over scored trials)",
      provenance: "benchmark",
      reporter: "Normal (runs every model on each CAD platform itself)",
      source: "CAD Arena leaderboard (12 models, updated 2026-09-25)",
      sourceUrl: "https://normal.ai/leaderboard/cad-arena",
      retrieved: "2026-09-30",
      protocol: "18 mechanical parts from engineering drawings, each rebuilt natively on 5 CAD platforms (Build123d, NX Open, SolidWorks, FeatureScript, Fusion): 90 trials per model",
      primary: "score",
      unit: "score",
      extras: ["costPerTrial", "scored"],
      note: "Harness in `variant`. Cost is the mean for one scored trial; `scored` counts trials that produced a gradable part (of 90).",
      rows: [
        { model: "claude_opus_55", score: 75.0, costPerTrial: 15.54, scored: 88, variant: "Claude Code" },
        { model: "gpt6_astra", score: 67.1, costPerTrial: 7.13, scored: 90, variant: "Codex" },
        { model: "claude_fable_51", score: 66.2, costPerTrial: 17.70, scored: 90, variant: "Claude Code" },
        { model: "gpt6_sol", score: 52.5, costPerTrial: 1.88, scored: 85, variant: "Codex" },
        { model: "gemini_38_flash", score: 41.0, costPerTrial: 8.83, scored: 90, variant: "Gemini CLI" },
        { model: "grok_46", score: 34.8, costPerTrial: 7.44, scored: 90, variant: "Grok Build" },
        { model: "muse_13", score: 31.8, costPerTrial: 3.54, scored: 87, variant: "Muse Code" },
        { model: "gpt6_luna", score: 30.1, costPerTrial: 1.85, scored: 83, variant: "Codex" },
        { model: "grok_47", score: 25.8, costPerTrial: 16.12, scored: 84, variant: "Grok Build" },
        { model: "deepseek_v4", score: 18.7, costPerTrial: 0.73, scored: 76, variant: "OpenCode" },
        { model: "inkling_small", score: 14.3, costPerTrial: 1.36, scored: 65, variant: "OpenCode" },
        { model: "inkling", score: 12.4, costPerTrial: 1.30, scored: 67, variant: "OpenCode" }
      ]
    },
    {
      id: "cadbench-mit-image",
      task: "cad",
      benchmark: "cadbench_mit",
      track: "Design",
      metric: "IoU x100, overall across 6 benchmark families",
      provenance: "benchmark",
      reporter: "CADBench team (MIT DeCoDE Lab)",
      source: "CADBench overall leaderboard, image-to-CAD systems (7 of 11)",
      sourceUrl: "https://anniedoris.github.io/CADBench/#Leaderboard",
      retrieved: "2026-09-30",
      protocol: "Overall leaderboard: IoU averaged across the six benchmark families (DeepCAD, Fusion 360, ABC, MCB, Objaverse); image-to-CAD systems",
      primary: "iou",
      unit: "score",
      extras: ["siou", "vsr"],
      note: "The board's legend splits image-to-CAD from mesh-to-CAD systems; these are the image-to-CAD ones (general vision-language models and CAD-Coder). `vsr` is the share of programs that execute; `cd` is Chamfer distance (lower is better).",
      rows: [
        { model: "claude_opus_47", iou: 41.2, siou: 10.8, vsr: 79.8, cd: 0.101 },
        { model: "gemini_31_pro", iou: 38.2, siou: 10.6, vsr: 72.9, cd: 0.087 },
        { model: "cad_coder", iou: 35.4, siou: 11.5, vsr: 94.6, cd: 0.157 },
        { model: "kimi_k26", iou: 22.4, siou: 4.2, vsr: 61.6, cd: 0.111 },
        { model: "gpt54", iou: 15.8, siou: 2.9, vsr: 51.3, cd: 0.109 },
        { model: "qwen35_27b", iou: 1.5, siou: 0.2, vsr: 33.5, cd: 0.176 },
        { model: "qwen35_9b", iou: 0.0, siou: 0.0, vsr: 9.9, cd: 0.195 }
      ]
    },
    {
      id: "cadbench-mit-mesh",
      task: "cad",
      benchmark: "cadbench_mit",
      track: "Design",
      metric: "IoU x100, overall across 6 benchmark families",
      provenance: "benchmark",
      reporter: "CADBench team (MIT DeCoDE Lab)",
      source: "CADBench overall leaderboard, mesh-to-CAD systems (4 of 11)",
      sourceUrl: "https://anniedoris.github.io/CADBench/#Leaderboard",
      retrieved: "2026-09-30",
      protocol: "Overall leaderboard: IoU averaged across the six benchmark families (DeepCAD, Fusion 360, ABC, MCB, Objaverse); mesh-to-CAD specialists, which read a 3D mesh rather than an image",
      primary: "iou",
      unit: "score",
      extras: ["siou", "vsr"],
      note: "Kept out of the CAD Index: these systems read a 3D mesh, not an image or a drawing, and none of them appears on another CAD board. The reason is also stated on the CAD Index tab.",
      rows: [
        { model: "cadfit", iou: 85.9, siou: 67.9, vsr: 98.1, cd: 0.038 },
        { model: "cadevolve", iou: 70.7, siou: 49.8, vsr: 96.7, cd: 0.062 },
        { model: "cadrille", iou: 68.7, siou: 51.7, vsr: 93.9, cd: 0.056 },
        { model: "cad_recode", iou: 67.3, siou: 50.3, vsr: 91.2, cd: 0.056 }
      ]
    },
    {
      id: "cadworld",
      task: "cad",
      benchmark: "cadworld",
      track: "Design",
      metric: "Task success (%)",
      provenance: "benchmark",
      reporter: "CADWorld authors (run every agent themselves)",
      source: "CADWorld results (7 agents)",
      sourceUrl: "https://cad-world.github.io",
      retrieved: "2026-09-30",
      protocol: "200 FreeCAD tasks in 11 workflow categories (sketch, part, assembly, CAM, FEM, drawings...), operated through screenshots, mouse and keyboard; saved project files checked by executable rules",
      primary: "success",
      unit: "%",
      extras: [],
      note: "Experts complete 87% of the tasks.",
      rows: [
        { model: "gpt54", success: 17.5, variant: "computer-use agent" },
        { model: "claude_opus_48", success: 16.0, variant: "computer-use agent" },
        { model: "kimi_k26", success: 7.5 },
        { model: "opencua", success: 1.5 },
        { model: "holo_31", success: 0.5 },
        { model: "qwen36", success: 0.0 },
        { model: "minimax_m3", success: 0.0 }
      ]
    },
    {
      id: "neuralcad-edit",
      task: "cad",
      benchmark: "neuralcad_edit",
      track: "Design",
      metric: "Expert acceptance x100 (human evaluation)",
      provenance: "benchmark",
      reporter: "Autodesk Research (runs every model; experts judge the edits)",
      source: "neuralCAD-Edit leaderboard",
      sourceUrl: "https://autodeskailab.github.io/neuralCAD-Edit/",
      retrieved: "2026-09-30",
      protocol: "Designers' edit requests on existing CAD models; experts judge whether they would accept each edit",
      primary: "accept",
      unit: "score",
      extras: ["vlmAccept", "voxelIoU"],
      note: "Edits by a human baseline are accepted 78% of the time. Kept out of the CAD Index: its three models are on no other CAD board, so it adds no comparison between models. The reason is also stated on the CAD Index tab.",
      rows: [
        { model: "gpt52", accept: 25, vlmAccept: 30, voxelIoU: 57 },
        { model: "gemini_3_pro", accept: 10, vlmAccept: 19, voxelIoU: 30 },
        { model: "claude_sonnet_45", accept: 5, vlmAccept: 15, voxelIoU: 18 }
      ]
    },

    /* ====================== BENCHMARK-RUN: RoboArena ======================== */
    {
      id: "roboarena",
      task: "generalist",
      benchmark: "roboarena",
      track: "Real",
      metric: "Pairwise-preference score (Bradley-Terry / Elo scale)",
      provenance: "benchmark",
      reporter: "RoboArena (double-blind A/B evaluations across 8 institutions)",
      source: "RoboArena official policy leaderboard (100+ A/B evals per policy)",
      sourceUrl: "https://robo-arena.github.io/leaderboard",
      retrieved: "2026-09-17",
      protocol: "Double-blind pairwise comparisons on DROID; evaluators choose their own task and scene",
      primary: "elo",
      unit: "score",
      extras: ["sd", "evals"],
      note: "There is no absolute success rate here by design - only relative preference. A higher score means evaluators preferred this policy head-to-head, not that it succeeds N% of the time. Read gaps, not levels: a 100-point gap means the higher-rated policy is preferred in about 64% of head-to-heads, a 400-point gap 10 to 1 (91%); the level around 1,500 is arbitrary.",
      rows: [
        { model: "dreamzero", elo: 1735, sd: 42.6, evals: 190 },
        { model: "pi05", elo: 1608, sd: 30.7, evals: 745, variant: "pi05_droid" },
        { model: "pi0_fast", elo: 1582, sd: 29.6, evals: 941, variant: "pi0_fast_droid" },
        { model: "paligemma_droid", elo: 1546, sd: 29.9, evals: 952, variant: "VQ" },
        { model: "paligemma_droid", elo: 1533, sd: 29.7, evals: 949, variant: "diffusion" },
        { model: "paligemma_droid", elo: 1531, sd: 29.8, evals: 1057, variant: "FAST-spec" },
        { model: "paligemma_droid", elo: 1516, sd: 29.9, evals: 1062, variant: "FAST" },
        { model: "pi0", elo: 1461, sd: 29.8, evals: 1120, variant: "pi0_droid" },
        { model: "paligemma_droid", elo: 786, sd: 50.0, evals: 629, variant: "binning" }
      ]
    },

    /* =================== SELF-REPORTED: LIBERO, OpenVLA ===================== */
    {
      id: "libero-openvla",
      task: "tabletop",
      benchmark: "libero",
      track: "Sim",
      metric: "Success rate per LIBERO suite",
      provenance: "model",
      reporter: "OpenVLA authors",
      source: "OpenVLA GitHub README, fine-tuning results table",
      sourceUrl: "https://github.com/openvla/openvla",
      retrieved: "2026-09-17",
      protocol: "3 seeds x 500 rollouts per suite",
      primary: "success",
      unit: "%",
      suites: ["Spatial", "Object", "Goal", "Long"],
      rows: [
        { model: "openvla", success: 76.5, s: [84.7, 88.4, 79.2, 53.7] }
      ]
    },

    /* ============== SELF-REPORTED: LIBERO, OpenVLA-OFT authors ============== */
    {
      id: "libero-oft",
      task: "tabletop",
      benchmark: "libero",
      track: "Sim",
      metric: "Success rate per LIBERO suite",
      provenance: "model",
      reporter: "OpenVLA-OFT authors (Stanford)",
      source: "Fine-Tuning Vision-Language-Action Models (arXiv:2502.19645v2), LIBERO task-performance table",
      sourceUrl: "https://arxiv.org/abs/2502.19645",
      retrieved: "2026-09-17",
      protocol: "LIBERO modified dataset; the 97.1% configuration adds a wrist camera and robot state to the policy inputs",
      primary: "success",
      unit: "%",
      suites: ["Spatial", "Object", "Goal", "Long"],
      rows: [
        { model: "openvla_oft", success: 97.1, s: [97.6, 98.4, 97.9, 94.5], variant: "+wrist +state" },
        { model: "openvla_oft", success: 95.3, s: [96.2, 98.3, 96.2, 90.7], variant: "third-person only" }
      ]
    },

    /* ======== THIRD-PARTY: LIBERO baseline column in the OFT paper ========== */
    {
      id: "libero-oft-baselines",
      task: "tabletop",
      benchmark: "libero",
      track: "Sim",
      metric: "Success rate per LIBERO suite",
      provenance: "thirdParty",
      reporter: "OpenVLA-OFT authors, reporting other people's models",
      source: "Fine-Tuning Vision-Language-Action Models (arXiv:2502.19645v2), LIBERO comparison table",
      sourceUrl: "https://arxiv.org/abs/2502.19645",
      retrieved: "2026-09-17",
      protocol: "Same LIBERO modified dataset as the rows above",
      primary: "success",
      unit: "%",
      suites: ["Spatial", "Object", "Goal", "Long"],
      note: "Baseline columns in a paper whose point is to beat them. We have not confirmed row by row which of these the OFT authors re-ran and which they quoted from the original reports, so they are filed as third-party rather than as the model makers' own claims.",
      rows: [
        { model: "pi0", success: 94.2, s: [96.8, 98.8, 95.8, 85.2] },
        { model: "pi0_fast", success: 85.5, s: [96.4, 96.8, 88.6, 60.2] },
        { model: "dit_policy", success: 82.4, s: [84.2, 96.3, 85.4, 63.8] },
        { model: "openvla", success: 76.5, s: [84.7, 88.4, 79.2, 53.7] },
        { model: "octo", success: 75.1, s: [78.9, 85.7, 84.6, 51.1] },
        { model: "dp", success: 72.4, s: [78.3, 92.5, 68.3, 50.5] }
      ]
    },

    /* ================== SELF-REPORTED: LIBERO, pi-0.5 ====================== */
    {
      id: "libero-pi05",
      task: "tabletop",
      benchmark: "libero",
      track: "Sim",
      metric: "Success rate per LIBERO suite",
      provenance: "model",
      reporter: "Physical Intelligence",
      source: "openpi repository, examples/libero/README.md results table (pi05_libero checkpoint at 30k steps)",
      sourceUrl: "https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/README.md",
      retrieved: "2026-09-17",
      protocol: "Reproducible from the published gs://openpi-assets/checkpoints/pi05_libero checkpoint",
      primary: "success",
      unit: "%",
      suites: ["Spatial", "Object", "Goal", "Long"],
      rows: [
        { model: "pi05", success: 96.85, s: [98.8, 98.2, 98.0, 92.4], variant: "fine-tuned 30k" }
      ]
    },

    /* ================= SELF-REPORTED: LIBERO, GR00T N1.7 =================== */
    {
      id: "libero-groot",
      task: "tabletop",
      benchmark: "libero",
      track: "Sim",
      metric: "Success rate per LIBERO suite",
      provenance: "model",
      reporter: "NVIDIA",
      source: "Isaac-GR00T repository, examples/LIBERO/README.md benchmark results",
      sourceUrl: "https://github.com/NVIDIA/Isaac-GR00T/blob/main/examples/LIBERO/README.md",
      retrieved: "2026-09-17",
      protocol: "200 rollouts per suite; all four suites fine-tuned with identical hyper-parameters",
      primary: "success",
      unit: "%",
      suites: ["Spatial", "Object", "Goal", "Long"],
      rows: [
        { model: "groot_n17", success: 96.99, s: [97.65, 98.45, 97.5, 94.35], derived: true, note: "NVIDIA publishes the four suite counts (195/200, 197/200, 195/200, 189/200) but no average. The 96.99% is our arithmetic mean of those four." }
      ]
    },

    /* =============== SELF-REPORTED: LIBERO + Meta-World, SmolVLA =========== */
    {
      id: "libero-smolvla",
      task: "tabletop",
      benchmark: "libero",
      track: "Sim",
      metric: "Success rate per LIBERO suite",
      provenance: "model",
      reporter: "Hugging Face / LeRobot",
      source: "SmolVLA paper (arXiv:2506.01844v1), simulation benchmark table",
      sourceUrl: "https://arxiv.org/abs/2506.01844",
      retrieved: "2026-09-17",
      protocol: "No VLA pre-training for the SmolVLA rows; per-suite success rate",
      primary: "success",
      unit: "%",
      suites: ["Spatial", "Object", "Goal", "Long"],
      rows: [
        { model: "smolvla", success: 88.75, s: [93, 94, 91, 77], variant: "2.25B" },
        { model: "smolvla", success: 87.3, s: [90, 96, 92, 71], variant: "0.45B" },
        { model: "smolvla", success: 82.75, s: [87, 93, 88, 63], variant: "0.24B" }
      ]
    },
    {
      id: "metaworld-smolvla",
      task: "tabletop",
      benchmark: "metaworld",
      track: "Sim",
      metric: "Success rate by difficulty tier",
      provenance: "model",
      reporter: "Hugging Face / LeRobot",
      source: "SmolVLA paper (arXiv:2506.01844v1), Meta-World rows of the simulation benchmark table",
      sourceUrl: "https://arxiv.org/abs/2506.01844",
      retrieved: "2026-09-17",
      protocol: "Averaged over Easy / Medium / Hard / Very Hard tiers",
      primary: "success",
      unit: "%",
      suites: ["Easy", "Medium", "Hard", "Very hard"],
      rows: [
        { model: "smolvla", success: 68.24, s: [87.14, 51.82, 70, 64], variant: "2.25B" },
        { model: "smolvla", success: 57.3, s: [82.5, 41.8, 45.0, 60.0], variant: "0.45B" },
        { model: "smolvla", success: 56.95, s: [86.43, 46.36, 35, 60], variant: "0.24B" }
      ]
    },
    {
      id: "metaworld-smolvla-baselines",
      task: "tabletop",
      benchmark: "metaworld",
      track: "Sim",
      metric: "Success rate by difficulty tier",
      provenance: "thirdParty",
      reporter: "SmolVLA authors, reporting other people's models",
      source: "SmolVLA paper (arXiv:2506.01844v1), Meta-World baseline rows",
      sourceUrl: "https://arxiv.org/abs/2506.01844",
      retrieved: "2026-09-17",
      protocol: "Same tiers as the rows above",
      primary: "success",
      unit: "%",
      suites: ["Easy", "Medium", "Hard", "Very hard"],
      rows: [
        { model: "pi0", success: 50.5, s: [80.4, 40.9, 36.7, 44.0], variant: "3.5B, no VLA pre-train" },
        { model: "pi0", success: 47.9, s: [71.8, 48.2, 41.7, 30.0], variant: "3.5B, VLA pre-trained" },
        { model: "tinyvla", success: 31.6, s: [77.6, 21.5, 11.4, 15.8] },
        { model: "dp", success: 10.5, s: [23.1, 10.7, 1.9, 6.1] }
      ]
    },

    /* ============ SELF-REPORTED: SimplerEnv + RoboCasa, NVIDIA ============= */
    {
      id: "simpler-bridge-groot",
      task: "tabletop",
      benchmark: "simpler_bridge",
      track: "Sim",
      metric: "Success rate, 7-task average",
      provenance: "model",
      reporter: "NVIDIA",
      source: "Isaac-GR00T repository, examples/SimplerEnv/README.md - Bridge (WidowX)",
      sourceUrl: "https://github.com/NVIDIA/Isaac-GR00T/blob/main/examples/SimplerEnv/README.md",
      retrieved: "2026-09-17",
      protocol: "~100 trials per task across 7 WidowX tasks",
      primary: "success",
      unit: "%",
      rows: [
        { model: "groot_n17", success: 62.3, note: "Per-task spread is wide: 100% on open_drawer, 2% on put_eggplant_in_sink." },
        { model: "groot_n16", success: 56.6 }
      ]
    },
    {
      id: "simpler-fractal-groot",
      task: "tabletop",
      benchmark: "simpler_fractal",
      track: "Sim",
      metric: "Success rate, 6-task average",
      provenance: "model",
      reporter: "NVIDIA",
      source: "Isaac-GR00T repository, examples/SimplerEnv/README.md - Fractal (Google Robot)",
      sourceUrl: "https://github.com/NVIDIA/Isaac-GR00T/blob/main/examples/SimplerEnv/README.md",
      retrieved: "2026-09-17",
      protocol: "~100 trials per task across 6 Google Robot tasks",
      primary: "success",
      unit: "%",
      rows: [
        { model: "groot_n17", success: 72.5 },
        { model: "groot_n16", success: 52.0, note: "N1.6 scores 0% on google_robot_open_drawer; N1.7 reaches 65% on the same task." }
      ]
    },
    {
      id: "robocasa-groot",
      task: "household",
      benchmark: "robocasa",
      track: "Sim",
      metric: "Success rate, 24-task average",
      provenance: "model",
      reporter: "NVIDIA",
      source: "Isaac-GR00T repository, examples/robocasa/README.md checkpoint results",
      sourceUrl: "https://github.com/NVIDIA/Isaac-GR00T/blob/main/examples/robocasa/README.md",
      retrieved: "2026-09-17",
      protocol: "24 RoboCasa Panda-Omron kitchen tasks",
      primary: "success",
      unit: "%",
      rows: [
        { model: "groot_n17", success: 70.8 },
        { model: "groot_n16", success: 66.22 }
      ]
    },

    /* =============== SELF-REPORTED: SmolVLA real SO-100 suite ============== */
    {
      id: "smolvla-real",
      task: "tabletop",
      benchmark: "smolvla_so100",
      track: "Real",
      metric: "Success rate, 3-task average",
      provenance: "model",
      reporter: "Hugging Face / LeRobot",
      source: "SmolVLA paper (arXiv:2506.01844v1), real-world results table",
      sourceUrl: "https://arxiv.org/abs/2506.01844",
      retrieved: "2026-09-17",
      protocol: "SO-100 arm, multi-task training unless noted; small trial counts",
      primary: "success",
      unit: "%",
      suites: ["Pick-place", "Stacking", "Sorting"],
      note: "The authors' own three-task setup, not a shared benchmark. Read it as a self-report, not as a ranking against anything above.",
      rows: [
        { model: "smolvla", success: 78.3, s: [75, 90, 70], variant: "0.45B, multi-task" },
        { model: "pi0", success: 61.7, s: [100, 40, 45], variant: "3.5B, multi-task" },
        { model: "act", success: 48.3, s: [70, 50, 25], variant: "single-task" }
      ]
    },

    /* ============= SELF-REPORTED: inference efficiency, OFT ================ */
    {
      id: "oft-efficiency",
      task: "tabletop",
      benchmark: "openvla_oft_efficiency",
      track: "Sim",
      metric: "Action-generation throughput and latency",
      provenance: "model",
      reporter: "OpenVLA-OFT authors (Stanford)",
      source: "Fine-Tuning Vision-Language-Action Models (arXiv:2502.19645v2), inference-efficiency table",
      sourceUrl: "https://arxiv.org/abs/2502.19645",
      retrieved: "2026-09-17",
      protocol: "Measured on the LIBERO-Long setup; latency is per action-chunk query",
      primary: "throughput",
      unit: "Hz",
      extras: ["latencyMs", "pairedSuccess"],
      note: "The one place on this site where a speed number and a quality number come from the same harness, so the two can honestly be plotted against each other.",
      rows: [
        { model: "openvla_oft", throughput: 109.7, latencyMs: 72.9, pairedSuccess: 90.7, variant: "PD + chunking" },
        { model: "openvla_oft", throughput: 71.4, latencyMs: 112.0, pairedSuccess: 94.5, variant: "+wrist +state" },
        { model: "openvla", throughput: 4.2, latencyMs: 239.6, pairedSuccess: 53.7, variant: "baseline" }
      ]
    },

    /* ============ SELF-REPORTED: embodied reasoning, DeepMind ============== */
    {
      id: "er-gemini",
      task: "reasoning",
      benchmark: "er_suite",
      track: "-",
      metric: "Aggregate score across 15 embodied-reasoning benchmarks",
      provenance: "model",
      reporter: "Google DeepMind",
      source: "Google DeepMind blog, Gemini Robotics 1.5 announcement",
      sourceUrl: "https://deepmind.google/discover/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/",
      retrieved: "2026-09-17",
      protocol: "ERQA, Point-Bench, RefSpatial, RoboSpatial, Where2Place, BLINK, CV-Bench, EmbSpatial, MindCube, SAT, Cosmos-Reason1, Min Video Pairs, OpenEQA, VSI-Bench",
      primary: null,
      unit: "aggregate",
      note: "The underlying benchmarks are third-party and public, but the aggregate is DeepMind's own and is published as a bar chart rather than a table, so there is no per-benchmark number here to cite. Nothing about actuation: Gemini Robotics-ER 1.5 reasons, it does not drive a robot.",
      rows: [
        { model: "gemini_er15", display: "State of the art on all 15; aggregate shown as 'over 60' on DeepMind's own chart", note: "Not transcribed further because only the chart image carries the values." }
      ]
    },

    /* ============= SELF-REPORTED: Gemini Robotics 1.5, no numbers ========== */
    {
      id: "gemini-actuation",
      task: "bimanual",
      benchmark: "er_suite",
      track: "Real",
      metric: "Manipulation success rate",
      provenance: "pending",
      reporter: "-",
      source: "Google DeepMind blog, Gemini Robotics 1.5 announcement",
      sourceUrl: "https://deepmind.google/discover/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/",
      retrieved: "2026-09-17",
      protocol: "Not stated",
      primary: null,
      unit: "%",
      note: "The acting model, as opposed to the reasoning model, is restricted to select partners and ships no public benchmark numbers at all. This row exists so the absence is visible rather than silent.",
      rows: [
        { model: "gemini_15", display: "No public benchmark number; select-partner access only" }
      ]
    },

    /* ======================= PENDING / DOCUMENTED GAPS ===================== */
    {
      id: "gaps-loco",
      task: "loco",
      benchmark: "psi0_own_suite",
      track: "Real",
      metric: "Long-horizon task completion",
      provenance: "pending",
      reporter: "-",
      source: "Psi-0 repository and paper (arXiv:2603.12263)",
      sourceUrl: "https://github.com/physical-superintelligence-lab/Psi0",
      retrieved: "2026-09-17",
      protocol: "8 long-horizon tasks x 10 rollouts on Unitree G1 + Dex3-1",
      primary: null,
      unit: "%",
      note: "Psi-0 is evaluated on its own real-robot suite, not on HumanoidBench. An earlier version of this file mislabelled it; the aggregate success rate still has not been pulled from the paper's tables.",
      rows: [
        { model: "psi0", display: "Task count and protocol confirmed; aggregate success rate not yet extracted" },
        { model: "omega0", display: "Loco-manipulation world-action model; no number extracted yet" }
      ]
    },
    {
      id: "gaps-industrial",
      task: "industrial",
      benchmark: "phail_industrial",
      track: "Real",
      metric: "Throughput (units/hour) + MTBF",
      provenance: "pending",
      reporter: "-",
      source: "PhAIL leaderboard (Positronic Robotics / Nebius / Toloka)",
      sourceUrl: "https://phail.ai/",
      retrieved: "2026-09-17",
      protocol: "Bin-to-bin picking on Franka FR3 + Robotiq 2F-85",
      primary: null,
      unit: "units/hr",
      note: "The only board we track that reports economic metrics instead of success rate. We have not transcribed its numbers yet. Unrelated to this site despite the shared acronym.",
      rows: [
        { model: "helix", display: "No published number; Figure reports 200 Hz control but no throughput or MTBF" },
        { model: "agibot", display: "No published number" }
      ]
    },
    {
      id: "gaps-world",
      task: "world",
      benchmark: "worldarena",
      track: "-",
      metric: "Embodied world-model utility",
      provenance: "pending",
      reporter: "-",
      source: "WorldArena repository (Tsinghua FIB Lab)",
      sourceUrl: "https://github.com/tsinghua-fib-lab/WorldArena",
      retrieved: "2026-09-17",
      protocol: "Perception and functional utility of embodied world models",
      primary: null,
      unit: "score",
      note: "World-model boards are the biggest hole in this ledger. WorldArena and PAI-Bench both publish through live spaces we have not transcribed.",
      rows: [
        { model: "cosmos", display: "Leaderboard not transcribed" }
      ]
    },
    {
      id: "gaps-driving",
      task: "driving",
      benchmark: "pai",
      track: "-",
      metric: "Video generation / understanding",
      provenance: "pending",
      reporter: "-",
      source: "PAI-Bench leaderboard space",
      sourceUrl: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard",
      retrieved: "2026-09-17",
      protocol: "Autonomous driving, robotics, industrial, and egocentric video domains",
      primary: null,
      unit: "score",
      note: "There is still no cross-company autonomous-driving leaderboard we would put on this page. This row is a placeholder for the closest thing we track.",
      rows: [
        { model: "cosmos", display: "Leaderboard not transcribed" }
      ]
    }
  ]
};
