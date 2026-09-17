/* =============================================================================
   PhAIL - Physical AI Ledger : evaluation database
   -----------------------------------------------------------------------------
   Last updated: 2026-09-17

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
    updated: "2026-09-17",
    note: "Numbers are copied from the cited table and not renormalised. Scores from different benchmarks are not comparable and are never averaged together on this site."
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
     one group across the charts. `mark` is the monogram drawn in the badge under
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
    robochallenge: { name: "RoboChallenge", mark: "RC", color: "#46607a", site: "https://robochallenge.ai/", logo: "logos/robochallenge.png" },
    unconfirmed:   { name: "Affiliation not confirmed", mark: "?", color: "#8a949b" },
    reference:     { name: "Reference baseline", mark: "H", color: "#aeb7bd" }
  },

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
    { id: "locomotion", family: "Robotics", name: "Whole-body locomotion", detail: "Balance, gait, contact, and disturbance rejection." }
  ],

  /* --- benchmarks ----------------------------------------------------------- */
  benchmarks: [
    { id: "libero", name: "LIBERO", type: "Simulation", year: "2023", url: "https://libero-project.github.io/", operator: "Lifelong Robot Learning (UT Austin)", runsPolicies: false },
    { id: "metaworld", name: "Meta-World", type: "Simulation", year: "2019", url: "https://meta-world.github.io/", operator: "Stanford / UC Berkeley", runsPolicies: false },
    { id: "rlbench", name: "RLBench", type: "Simulation", year: "2019", url: "https://sites.google.com/view/rlbench", operator: "Imperial College London", runsPolicies: false },
    { id: "calvin", name: "CALVIN", type: "Simulation", year: "2022", url: "https://calvin-rl.github.io/", operator: "University of Freiburg", runsPolicies: false },
    { id: "robocasa", name: "RoboCasa", type: "Simulation", year: "2024", url: "https://robocasa.ai/", operator: "UT Austin / NVIDIA", runsPolicies: false },
    { id: "maniskill", name: "ManiSkill3", type: "GPU simulation", year: "2024", url: "https://maniskill.ai/", operator: "UC San Diego (Hillbot)", runsPolicies: false },
    { id: "behavior", name: "BEHAVIOR-1K", type: "Sim + transfer", year: "2023", url: "https://behavior.stanford.edu/", operator: "Stanford Vision & Learning Lab", runsPolicies: false },
    { id: "simpler_bridge", name: "SimplerEnv (Bridge / WidowX)", type: "Sim-real paired", year: "2024", url: "https://simpler-env.github.io/", operator: "UC San Diego / Google DeepMind", runsPolicies: false },
    { id: "simpler_fractal", name: "SimplerEnv (Fractal / Google Robot)", type: "Sim-real paired", year: "2024", url: "https://simpler-env.github.io/", operator: "UC San Diego / Google DeepMind", runsPolicies: false },
    { id: "robotwin", name: "RoboTwin 2.0", type: "Sim + real alignment", year: "2025-2026", url: "https://robotwin-platform.github.io/leaderboard", operator: "MMLab@HKU / THU (RoboTwin Team)", runsPolicies: true },
    { id: "robodojo_sim", name: "RoboDojo (Sim)", type: "Simulation", year: "2026", url: "https://arxiv.org/abs/2607.04434", operator: "RoboDojo Team", runsPolicies: true },
    { id: "robodojo_real", name: "RoboDojo (Real)", type: "Real robot", year: "2026", url: "https://arxiv.org/abs/2607.04434", operator: "RoboDojo Team (RoboDojo-RealEval)", runsPolicies: true },
    { id: "robochallenge", name: "RoboChallenge Table30", type: "Real robot", year: "2025", url: "https://robochallenge.ai/leaderboard", operator: "RoboChallenge", runsPolicies: true },
    { id: "robochallenge_v2", name: "RoboChallenge Table30-v2", type: "Real robot", year: "2026", url: "https://robochallenge.ai/leaderboard", operator: "RoboChallenge", runsPolicies: true },
    { id: "roboarena", name: "RoboArena", type: "Real robot, distributed", year: "2025-2026", url: "https://robo-arena.github.io/leaderboard", operator: "Berkeley / Stanford + 6 universities", runsPolicies: true },
    { id: "humanoid", name: "HumanoidBench", type: "Simulation", year: "2024", url: "https://humanoid-bench.github.io/", operator: "KAIST / UC Berkeley", runsPolicies: false },
    { id: "psi0_own_suite", name: "Psi-0 own real suite", type: "Real robot", year: "2026", url: "https://github.com/physical-superintelligence-lab/Psi0", operator: "USC PSI Lab", runsPolicies: false },
    { id: "smolvla_so100", name: "SmolVLA own SO-100 suite", type: "Real robot", year: "2025", url: "https://arxiv.org/abs/2506.01844", operator: "Hugging Face / LeRobot", runsPolicies: false },
    { id: "er_suite", name: "Embodied-reasoning suite (15 benchmarks)", type: "Vision-language", year: "2025", url: "https://deepmind.google/discover/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/", operator: "Various academic benchmarks", runsPolicies: false },
    { id: "pai", name: "PAI-Bench", type: "Video-based", year: "2026", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard", operator: "SHI Labs", runsPolicies: false },
    { id: "worldarena", name: "WorldArena", type: "World-model evaluation", year: "2026", url: "https://github.com/tsinghua-fib-lab/WorldArena", operator: "Tsinghua FIB Lab", runsPolicies: false },
    { id: "phail_industrial", name: "PhAIL (Positronic)", type: "Real robot, industrial", year: "2026", url: "https://phail.ai/", operator: "Positronic Robotics / Nebius / Toloka", runsPolicies: true },
    { id: "openvla_oft_efficiency", name: "OpenVLA-OFT inference profile", type: "Efficiency measurement", year: "2025", url: "https://openvla-oft.github.io/", operator: "Stanford (Kim et al.)", runsPolicies: false }
  ],

  /* --- models ---------------------------------------------------------------
     `maker: "Not confirmed"` is deliberate: for several 2026 entries the only
     source we have is a leaderboard row, which gives a name and a citation key
     but no affiliation. We leave it blank rather than guess.
     ------------------------------------------------------------------------ */
  models: [
    { id: "openvla", name: "OpenVLA", maker: "Stanford / UC Berkeley / TRI", org: "stanford", open: "Open", embodiment: "Cross-embodiment", size: "7B params", runtime: "RTX 4090 (15GB bf16)", license: "MIT", note: "970k Open X-Embodiment demonstrations; ~6 Hz on one RTX 4090 per the authors." },
    { id: "openvla_oft", name: "OpenVLA-OFT", maker: "Stanford (Kim et al.)", org: "stanford", open: "Open", embodiment: "Cross-embodiment", size: "7B params (OpenVLA backbone)", runtime: "Consumer GPU", license: "MIT", note: "Optimised fine-tuning recipe: parallel decoding, action chunking, L1 regression." },
    { id: "pi0", name: "pi-0", maker: "Physical Intelligence", org: "physical_intelligence", open: "Open", embodiment: "Single/dual-arm, mobile", size: "~3.3B params", runtime: ">8GB VRAM", license: "Apache-2.0 (openpi)" },
    { id: "pi0_fast", name: "pi-0-FAST", maker: "Physical Intelligence", org: "physical_intelligence", open: "Open", embodiment: "Single/dual-arm", size: "~3B params", runtime: ">8GB VRAM", license: "Apache-2.0 (openpi)", note: "Autoregressive FAST action-tokeniser variant of pi-0." },
    { id: "pi05", name: "pi-0.5", maker: "Physical Intelligence", org: "physical_intelligence", open: "Open", embodiment: "Mobile manipulation, dual-arm", size: "Not officially disclosed", runtime: ">8GB VRAM", license: "Apache-2.0 (openpi)", note: "Headline claims in the pi-0.5 paper are qualitative (cleaning unseen homes), not benchmark numbers." },
    { id: "octo", name: "Octo", maker: "UC Berkeley (RAIL)", org: "berkeley", open: "Open", embodiment: "Tabletop", size: "27M-93M params", runtime: "Consumer GPU", license: "MIT" },
    { id: "smolvla", name: "SmolVLA", maker: "Hugging Face / LeRobot", org: "huggingface", open: "Open", embodiment: "Tabletop", size: "0.24B / 0.45B / 2.25B params", runtime: "Consumer GPU or CPU", license: "Apache-2.0", note: "Trainable on a single GPU; asynchronous inference decouples action prediction from execution." },
    { id: "groot_n16", name: "GR00T N1.6", maker: "NVIDIA", org: "nvidia", open: "Open weights", embodiment: "Cross-embodiment", size: "3B params", runtime: "NVIDIA GPU", license: "NVIDIA model terms" },
    { id: "groot_n17", name: "GR00T N1.7", maker: "NVIDIA", org: "nvidia", open: "Open weights", embodiment: "Cross-embodiment", size: "3B params", runtime: "NVIDIA GPU", license: "NVIDIA model terms", note: "N1.7 refreshes documented results across RoboCasa, SimplerEnv, LIBERO, and real Unitree G1." },
    { id: "gemini_15", name: "Gemini Robotics 1.5", maker: "Google DeepMind", org: "deepmind", open: "Closed", embodiment: "Bi-arm", size: "Not reported", runtime: "Partner access", license: "Closed (select partners)" },
    { id: "gemini_er15", name: "Gemini Robotics-ER 1.5", maker: "Google DeepMind", org: "deepmind", open: "Closed", embodiment: "World model", size: "Not reported", runtime: "Gemini API", license: "Closed", note: "Reasons about the physical world; does not drive actuators." },
    { id: "helix", name: "Helix", maker: "Figure AI", org: "figure", open: "Closed", embodiment: "Humanoid", size: "Not reported", runtime: "Embedded GPU (onboard)", license: "Closed", note: "200 Hz whole-upper-body control per Figure's own announcement; no public benchmark number." },
    { id: "rdt1b", name: "RDT-1B", maker: "Tsinghua (TSAIL)", org: "tsinghua", open: "Open", embodiment: "Bi-arm", size: "1B params", runtime: "GPU", license: "MIT" },
    { id: "h_rdt", name: "H-RDT", maker: "Tsinghua", org: "tsinghua", open: "Open", embodiment: "Bi-arm", size: "Not reported", runtime: "GPU", license: "Open research" },
    { id: "act", name: "ACT", maker: "Stanford (Zhao et al.)", org: "stanford", open: "Open", embodiment: "Bi-arm", size: "~80M params", runtime: "GPU", license: "MIT", note: "Single-task imitation baseline, not a generalist policy." },
    { id: "dp", name: "Diffusion Policy", maker: "Columbia / TRI", org: "columbia_tri", open: "Open", embodiment: "Tabletop", size: "Not reported", runtime: "GPU", license: "MIT", note: "Single-task imitation baseline." },
    { id: "dp3", name: "DP3 (3D Diffusion Policy)", maker: "Shanghai Qi Zhi / Tsinghua", org: "qizhi", open: "Open", embodiment: "Bi-arm", size: "Not reported", runtime: "GPU", license: "MIT" },
    { id: "dit_policy", name: "DiT Policy", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "Tabletop", size: "Not reported" },
    { id: "tinyvla", name: "TinyVLA", maker: "Midea Group / ECNU (Wen et al.)", org: "midea_ecnu", open: "Open", embodiment: "Tabletop", size: "Sub-1B params", runtime: "Consumer GPU" },
    { id: "cogact", name: "CogACT", maker: "Microsoft Research", org: "microsoft", open: "Open", embodiment: "Cross-embodiment", size: "Not reported" },
    { id: "go1", name: "GO-1", maker: "AgiBot", org: "agibot", open: "Open weights", embodiment: "Humanoid", size: "Not reported" },
    { id: "galaxea_g0", name: "GalaxeaVLA (G0)", maker: "Galaxea", org: "galaxea", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "internvla_a1", name: "InternVLA-A1", maker: "Shanghai AI Laboratory", org: "shanghai_ai_lab", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "x_vla", name: "X-VLA", maker: "Tsinghua AIR", org: "tsinghua", open: "Open", embodiment: "Cross-embodiment", size: "0.9B params", cite: "Zheng et al., arXiv:2510.10274 (ICLR 2026); affiliation read off the THU-AIR-DREAM repository, not stated on the leaderboard" },
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
    { id: "lda1b", name: "LDA-1B", maker: "Galbot (with Peking University, CASIA, BAAI)", org: "galbot", open: "Not reported", embodiment: "Not reported", size: "1B params (per name)", cite: "Lyu et al., arXiv:2602.12215 (RSS 2026)" },
    { id: "dexora", name: "Dexora-1B", maker: "Tsinghua University / BAAI", org: "tsinghua", open: "Not reported", embodiment: "Not reported", size: "1B params (per name)", cite: "Zhang et al., arXiv:2605.18722 (ICRA 2026)" },
    { id: "a1_model", name: "A1", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported", cite: "Zhang et al., arXiv:2604.05672 - the HTML version does not expose author affiliations, so this one stays unattributed" },
    { id: "spirit15", name: "Spirit v1.5", maker: "Spirit AI", org: "spirit_ai", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "dm0", name: "DM0", maker: "Dexmal", org: "dexmal", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "dm05", name: "VLA-DM0.5", maker: "Submitted by KDDI Research", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "era0", name: "Era0", maker: "Robotera", org: "robotera", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "lira", name: "Lira", maker: "Atlas", org: "atlas", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "atlas_generalist", name: "Atlas generalist", maker: "Atlas", org: "atlas", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "zr0", name: "ZR-0", maker: "Atlas", org: "atlas", open: "Not reported", embodiment: "Bi-arm", size: "Not reported" },
    { id: "wall_oss", name: "WALL-OSS v0.1", maker: "X Square Robot", org: "xsquare", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "vlo", name: "VLO", maker: "Not confirmed", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "ola_sem", name: "OLA-Sem", maker: "OLA-HKUSTGZ", org: "ola", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "ola_geo", name: "OLA-Geo", maker: "OLA-HKUSTGZ", org: "ola", open: "Open", embodiment: "Bi-arm", size: "Not reported" },
    { id: "dreamzero", name: "DreamZero", maker: "NVIDIA", org: "nvidia", open: "Open", embodiment: "Tabletop", size: "Not reported", note: "World-action model on a video-diffusion backbone; the DROID checkpoint is trained on DROID alone. All authors listed under NVIDIA on the project page." },
    { id: "paligemma_droid", name: "PaliGemma-DROID", maker: "RoboArena team", org: "roboarena", open: "Open", embodiment: "Tabletop", size: "3B (PaliGemma backbone)", note: "Five action-representation variants trained by the RoboArena authors as reference policies." },
    { id: "magicbot", name: "MagicBot", maker: "MagicBot", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "jv0", name: "JV0", maker: "JIIOV", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "mc_brains", name: "mc", maker: "mcBrains", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "my16", name: "my16", maker: "Submitted by Tymtbo", org: "unconfirmed", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "rc_baseline", name: "RoboChallenge baseline model", maker: "RoboChallenge", org: "robochallenge", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "psi0", name: "Psi-0", maker: "USC PSI Lab + NVIDIA + WorldEngine", org: "usc_psi", open: "Open", embodiment: "Humanoid", size: "~500M action expert + Qwen3-VL-2B backbone", runtime: "Robot GPU", license: "GitHub" },
    { id: "omega0", name: "Omega-0", maker: "Not confirmed (arXiv 2608.06375)", org: "unconfirmed", open: "Not reported", embodiment: "Humanoid", size: "Not reported" },
    { id: "agibot", name: "AGIBOT BFM / GCFM", maker: "AgiBot (Shanghai)", org: "agibot", open: "Not reported", embodiment: "Humanoid", size: "Not reported" },
    { id: "cosmos", name: "NVIDIA Cosmos", maker: "NVIDIA", org: "nvidia", open: "Open weights", embodiment: "World model", size: "Not reported", runtime: "GPU-hours" },
    { id: "human", name: "Human expert (teleoperator)", maker: "Reference baseline", org: "reference", open: "-", embodiment: "-", size: "-", note: "Not a model. Included because both RoboDojo tracks report it, and it is the only honest ceiling on those boards." }
  ],

  /* --- results, grouped one block per cited table ---------------------------- */
  resultGroups: [

    /* ====================== BENCHMARK-RUN: RoboDojo Sim ===================== */
    {
      id: "robodojo-sim",
      task: "tabletop",
      benchmark: "robodojo_sim",
      track: "Sim",
      metric: "Capability score / Success rate",
      provenance: "benchmark",
      reporter: "RoboDojo Team",
      source: "RoboDojo paper (arXiv:2607.04434v3), Table 1 - simulation leaderboard",
      sourceUrl: "https://arxiv.org/abs/2607.04434",
      retrieved: "2026-09-17",
      protocol: "42 tasks x 50 episodes x 3 seeds (2,100 episodes per policy)",
      primary: "score",
      unit: "score",
      secondary: "success",
      secondaryUnit: "%",
      dims: ["Generalization", "Precision", "Long-horizon", "Memory", "Open-vocab"],
      note: "Every policy scores far below the human teleoperation reference on every dimension. RoboDojo is hard by design; these are not general capability numbers.",
      rows: [
        { model: "hy_embodied", score: 13.07, success: 8.80, d: [11.77, 13.81, 25.74, 13.37, 0.65] },
        { model: "spatial_forcing", score: 12.38, success: 8.04, d: [14.12, 17.33, 23.26, 5.43, 1.78] },
        { model: "pi05", score: 11.41, success: 6.91, d: [13.37, 12.40, 23.54, 5.78, 1.98] },
        { model: "x_vla", score: 10.13, success: 6.52, d: [10.48, 18.32, 16.53, 4.76, 0.55] },
        { model: "x_wam", score: 7.69, success: 3.83, d: [7.39, 6.72, 17.47, 6.32, 0.57] },
        { model: "xiaomi_r0", score: 6.93, success: 4.18, d: [7.43, 8.42, 13.51, 5.07, 0.22] },
        { model: "starvla", score: 6.40, success: 3.24, d: [3.93, 9.90, 14.15, 3.34, 0.68] },
        { model: "gigaworld_policy", score: 6.20, success: 3.27, d: [5.34, 6.15, 15.51, 3.46, 0.54] },
        { model: "galaxea_g0", score: 5.82, success: 2.96, d: [4.53, 8.10, 12.60, 3.17, 0.70] },
        { model: "lingbot", score: 5.50, success: 2.96, d: [6.71, 5.33, 10.89, 3.82, 0.72] },
        { model: "eventvla", score: 4.97, success: 2.81, d: [3.94, 10.13, 5.05, 4.92, 0.80] },
        { model: "aha_wam", score: 4.82, success: 2.39, d: [5.79, 5.86, 8.61, 2.97, 0.88] },
        { model: "abot_m0", score: 3.67, success: 1.73, d: [5.73, 5.50, 3.96, 2.44, 0.72] },
        { model: "fast_wam", score: 3.48, success: 2.03, d: [2.34, 1.96, 9.14, 3.55, 0.42] },
        { model: "pi0", score: 3.48, success: 1.53, d: [3.94, 3.56, 6.19, 3.47, 0.25] },
        { model: "groot_n17", score: 2.85, success: 1.31, d: [2.16, 2.54, 8.30, 1.06, 0.18] },
        { model: "internvla_a1", score: 2.48, success: 1.08, d: [2.87, 3.00, 4.79, 1.58, 0.17] },
        { model: "smolvla", score: 1.83, success: 0.85, d: [1.69, 2.87, 1.22, 3.35, 0.00], variant: "single-task" },
        { model: "lda1b", score: 1.58, success: 0.51, d: [0.71, 3.21, 1.92, 2.08, 0.00] },
        { model: "molmoact2", score: 1.02, success: 0.38, d: [0.39, 0.45, 2.32, 1.02, 0.91] },
        { model: "go1", score: 0.99, success: 0.53, d: [1.58, 1.45, 1.13, 0.70, 0.08] },
        { model: "act", score: 0.98, success: 0.32, d: [0.69, 0.85, 1.73, 1.65, 0.00], variant: "single-task" },
        { model: "h_rdt", score: 0.67, success: 0.12, d: [0.49, 0.41, 2.23, 0.12, 0.08] },
        { model: "rdt1b", score: 0.51, success: 0.13, d: [0.56, 0.38, 1.13, 0.49, 0.00] },
        { model: "dm0", score: 0.45, success: 0.05, d: [0.49, 0.61, 0.97, 0.20, 0.00], note: "Near zero here, but second on the RoboChallenge Table30 real-robot board. Same name, different task distribution." },
        { model: "dexora", score: 0.38, success: 0.02, d: [0.49, 0.49, 0.82, 0.12, 0.01] },
        { model: "a1_model", score: 0.28, success: 0.02, d: [0.16, 0.09, 1.07, 0.00, 0.08] },
        { model: "spirit15", score: 0.23, success: 0.14, d: [0.80, 0.03, 0.11, 0.22, 0.00] },
        { model: "tinyvla", score: 0.22, success: 0.07, d: [0.03, 0.05, 0.67, 0.11, 0.25] },
        { model: "openvla_oft", score: 0.21, success: 0.02, d: [0.04, 0.20, 0.70, 0.00, 0.08], note: "97.1% on LIBERO, 0.02% here. Both numbers are real and both are cited; they describe different task distributions." },
        { model: "human", score: 80.42, success: 76.03, d: [90.05, 68.06, 83.63, 75.25, 85.13], reference: true }
      ]
    },

    /* ====================== BENCHMARK-RUN: RoboDojo Real ==================== */
    {
      id: "robodojo-real",
      task: "tabletop",
      benchmark: "robodojo_real",
      track: "Real",
      metric: "Score / Success rate (overall average)",
      provenance: "benchmark",
      reporter: "RoboDojo Team",
      source: "RoboDojo paper (arXiv:2607.04434v3), Table 2 - real-robot leaderboard",
      sourceUrl: "https://arxiv.org/abs/2607.04434",
      retrieved: "2026-09-17",
      protocol: "18 tasks x 10 trials across ARX X5, Piper, and Piper X (180 trials per policy)",
      primary: "score",
      unit: "score",
      secondary: "success",
      secondaryUnit: "%",
      rows: [
        { model: "pi05", score: 22.9, success: 12.8 },
        { model: "internvla_a1", score: 12.0, success: 7.2 },
        { model: "galaxea_g0", score: 9.0, success: 4.4 },
        { model: "xiaomi_r0", score: 7.9, success: 3.9 },
        { model: "x_vla", score: 7.6, success: 3.3 },
        { model: "groot_n17", score: 5.9, success: 1.7 },
        { model: "pi0", score: 5.8, success: 1.7 },
        { model: "starvla", score: 4.1, success: 1.7 },
        { model: "spirit15", score: 1.6, success: 0.6 },
        { model: "dm0", score: 0.0, success: 0.0 },
        { model: "human", score: 100.0, success: 100.0, reference: true, note: "Teleoperation reference confirming every task is physically achievable under the same setup." }
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
      source: "RoboChallenge live leaderboard, table-30 board",
      sourceUrl: "https://robochallenge.ai/leaderboard",
      retrieved: "2026-09-17",
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
      source: "RoboChallenge live leaderboard, table-30-v2 board (top 6 of 50 entries)",
      sourceUrl: "https://robochallenge.ai/leaderboard",
      retrieved: "2026-09-17",
      protocol: "30 tasks x 10 rollouts, refreshed task set",
      primary: "success",
      unit: "%",
      secondary: "score",
      secondaryUnit: "progress",
      note: "v2 is markedly harder than v1: the top entry drops from 64.3% to 40.7%. Most v2 entries are submitted under team handles with no public model card, so the maker field is often just the submitter.",
      rows: [
        { model: "dm05", success: 40.67, score: 54.42, submitter: "KDDI Research" },
        { model: "my16", success: 30.67, score: 41.27, submitter: "Tymtbo" },
        { model: "jv0", success: 16.00, score: 27.58, submitter: "JIIOV" },
        { model: "mc_brains", success: 15.33, score: 23.63, submitter: "mcBrains" },
        { model: "magicbot", success: 14.67, score: 20.82, submitter: "MagicBot" },
        { model: "rc_baseline", success: 14.33, score: 31.48, submitter: "RoboChallenge" }
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
      note: "There is no absolute success rate here by design - only relative preference. A higher score means evaluators preferred this policy head-to-head, not that it succeeds N% of the time.",
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
      note: "The only board we track that reports economic metrics instead of success rate. We have not transcribed its numbers yet. Unrelated to this site despite the shared acronym - see About.",
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
