// PhAIL Notes — benchmark/model database
// Updated 2026-09-08. See inline `source` / `sourceUrl` fields — every value
// either has a citation or is explicitly "Not reported" / "Pending".
// IMPORTANT: this file previously contained several fabricated-looking
// RoboDojo numbers that did not match the real paper. They have been
// replaced with verified numbers below (see the "verified" comments).
// Do not add a number here without a source you can point to.

window.phailDatabase = {
  tasks: [
    { id: "tabletop", family: "Robotics", name: "Tabletop manipulation", detail: "Pick-place, insertion, and tool use on a fixed base." },
    { id: "bimanual", family: "Robotics", name: "Bimanual manipulation", detail: "Coordinated two-arm tasks." },
    { id: "mobile", family: "Robotics", name: "Mobile manipulation", detail: "Manipulation combined with base movement." },
    { id: "loco", family: "Robotics", name: "Loco-manipulation", detail: "Whole-body humanoid control while manipulating." },
    { id: "household", family: "Robotics", name: "Long-horizon household", detail: "Multi-step activities in changing scenes." },
    { id: "driving", family: "Autonomous driving", name: "Autonomous driving", detail: "Perception, planning, and vehicle control." },
    { id: "world", family: "World models", name: "World-model prediction", detail: "Predict physical-world video without directly acting." },
    { id: "industrial", family: "Industrial robotics", name: "Bin-picking and assembly", detail: "Throughput, reliability, and recovery on production-like tasks." },
    { id: "locomotion", family: "Robotics", name: "Whole-body locomotion", detail: "Balance, gait, contact, and disturbance rejection." }
  ],

  benchmarks: [
    { id: "libero", name: "LIBERO", type: "Simulation", year: "2023", url: "https://libero-project.github.io/" },
    { id: "rlbench", name: "RLBench", type: "Simulation", year: "2019", url: "https://sites.google.com/view/rlbench" },
    { id: "metaworld", name: "Meta-World", type: "Simulation", year: "2019", url: "https://meta-world.github.io/" },
    { id: "robotwin", name: "RoboTwin 2.0", type: "Sim + real", year: "2025", url: "https://robotwin-benchmark.github.io/" },
    { id: "behavior", name: "BEHAVIOR-1K", type: "Sim + transfer", year: "2023", url: "https://behavior.stanford.edu/" },
    { id: "simpler", name: "SIMPLER", type: "Sim-real paired", year: "2024", url: "https://simpler-env.github.io/" },
    { id: "humanoid", name: "HumanoidBench", type: "Simulation", year: "2024", url: "https://humanoid-bench.github.io/" },
    { id: "psi0_own_suite", name: "Psi-0 own suite", type: "Real robot", year: "2026", url: "https://github.com/physical-superintelligence-lab/Psi0" },
    { id: "pai", name: "PAI-Bench", type: "Video-based", year: "2026", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard" },
    { id: "phail", name: "PhAIL", type: "Real robot", year: "2026", url: "https://phail.ai/" },
    { id: "robocasa", name: "RoboCasa", type: "Simulation", year: "2024", url: "https://robocasa.ai/" },
    { id: "maniskill", name: "ManiSkill3", type: "GPU simulation", year: "2024", url: "https://maniskill.ai/" },
    { id: "calvin", name: "CALVIN", type: "Simulation", year: "2022", url: "https://calvin-rl.github.io/" },
    { id: "robochallenge", name: "RoboChallenge", type: "Real robot", year: "2025", url: "https://robochallenge.ai/leaderboard" },
    { id: "worldarena", name: "WorldArena", type: "World-model evaluation", year: "2026", url: "https://github.com/tsinghua-fib-lab/WorldArena" },
    { id: "robodojo", name: "RoboDojo", type: "Sim + real", year: "2026", url: "https://arxiv.org/html/2607.04434v1" }
  ],

  models: [
    // --- existing entries, unchanged unless noted ---
    { id: "openvla", name: "OpenVLA", maker: "Open-source community", open: "Open", embodiment: "Cross-embodiment", size: "7B params", runtime: "Consumer GPU", license: "Apache-2.0" },
    { id: "openvla_oft", name: "OpenVLA-OFT", maker: "Stanford (Moo Jin Kim et al.)", open: "Open", embodiment: "Cross-embodiment", size: "7B params (OpenVLA backbone)", runtime: "Consumer GPU", license: "Apache-2.0", note: "Optimized fine-tuning of OpenVLA; 26x faster action generation, 3x lower latency per authors' own site." },
    { id: "pi0", name: "pi0 / pi0.5 / pi0.7", maker: "Physical Intelligence", open: "Open", embodiment: "Single/dual-arm, mobile", size: "~3B params (est., not officially disclosed)", runtime: ">8GB VRAM", license: "openpi" },
    { id: "octo", name: "Octo", maker: "UC Berkeley", open: "Open", embodiment: "Tabletop", size: "27M-93M params", runtime: "Consumer GPU", license: "Open research" },
    { id: "smolvla", name: "SmolVLA", maker: "Hugging Face / LeRobot", open: "Open", embodiment: "Tabletop", size: "450M params", runtime: "RTX / Mac", license: "Open" },
    { id: "groot", name: "GR00T N1.7", maker: "NVIDIA", open: "Open weights", embodiment: "Humanoid", size: "Not reported", runtime: "NVIDIA GPU", license: "Model terms" },
    { id: "gemini", name: "Gemini Robotics 1.5", maker: "Google DeepMind", open: "Closed", embodiment: "Bi-arm", size: "Not reported", runtime: "Partner access", license: "Closed" },
    { id: "psi0", name: "Psi-0", maker: "USC PSI Lab + NVIDIA + WorldEngine", open: "Open", embodiment: "Humanoid loco-manipulation", size: "~500M action expert + Qwen3-VL-2B VLM backbone", runtime: "Robot GPU", license: "GitHub", note: "Evaluated on Psi-0's own 8-task real-robot suite (Unitree G1 + Dex3-1), NOT on HumanoidBench — a prior version of this data file mislabeled this; fixed in results[] below." },
    { id: "cosmos", name: "NVIDIA Cosmos", maker: "NVIDIA", open: "-", embodiment: "World model", size: "Not reported", runtime: "GPU-hours", license: "Model terms" },
    { id: "helix", name: "Helix", maker: "Figure AI", open: "Closed", embodiment: "Humanoid upper body", size: "Not reported", runtime: "Embedded GPU (onboard)", license: "Closed", note: "200Hz whole-upper-body control per Figure's own announcement." },
    { id: "agibot", name: "AGIBOT BFM / GCFM", maker: "AGIBOT (Shanghai)", open: "-", embodiment: "Commercial/household", size: "Not reported" },
    { id: "omega0", name: "Omega-0", maker: "Org TBD (11 authors, arXiv 2608.06375)", open: "-", embodiment: "Humanoid loco-manipulation", size: "Not reported" },
    { id: "dreamzero", name: "GR00T-Dreams", maker: "NVIDIA", open: "-", embodiment: "World model / synthetic data", size: "Not reported" },
    { id: "dreamwaq", name: "DreamWaQ", maker: "Research model", open: "Open research", embodiment: "Humanoid", size: "Not reported", runtime: "Robot GPU", license: "Research" },
    { id: "diffusion_policy", name: "Diffusion Policy", maker: "Columbia / TRI", open: "Open research", embodiment: "Single-arm", size: "Not reported", runtime: "GPU", license: "Research" },
    { id: "act", name: "ACT", maker: "Columbia / TRI", open: "Open research", embodiment: "Bimanual", size: "Not reported", runtime: "GPU", license: "Research" },
    { id: "rdt1b", name: "RDT-1B", maker: "Tsinghua (thu-ml)", open: "Open", embodiment: "Bimanual (diffusion foundation model)", size: "1B params", runtime: "GPU", license: "Open" },

    // --- NEW: found via RoboDojo leaderboard table (arXiv 2607.04434 HTML), not previously in this file ---
    { id: "hy_embodied_05_vla", name: "Hy-Embodied-0.5-VLA", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "Not reported", note: "Top scorer on RoboDojo Sim leaderboard as of the paper's snapshot — needs its own source lookup." },
    { id: "spatial_forcing", name: "Spatial Forcing", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "x_vla", name: "X-VLA", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "x_wam", name: "X-WAM", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "xiaomi_robotics_0", name: "Xiaomi-Robotics-0", maker: "Xiaomi", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "starvla_alpha", name: "StarVLA-α", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "gigaworld_policy", name: "GigaWorld-Policy", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "internvla_a1", name: "InternVLA-A1", maker: "Shanghai AI Lab (InternVLA family)", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "lda1b", name: "LDA-1B", maker: "Not reported", open: "Not reported", embodiment: "Not reported", size: "1B params (per name)" },
    { id: "galaxea_g0", name: "GalaxeaVLA (G0)", maker: "Galaxea", open: "Not reported", embodiment: "Not reported", size: "Not reported" },
    { id: "human_baseline", name: "Human (expert / teleoperator)", maker: "—", open: "—", embodiment: "—", size: "—", note: "Reference baseline reported directly in the RoboDojo paper, not a model." }
  ],

  results: [
    // --- verified: OpenVLA on LIBERO, from openvla/openvla GitHub README ---
    { task: "tabletop", benchmark: "libero", model: "openvla", metric: "Success rate (LIBERO-Spatial / Object / Goal / Long / Avg)", value: "84.7% / 88.4% / 79.2% / 53.7% / 76.5% avg", latency: "Not reported", cost: "Not reported", source: "OpenVLA GitHub README, fine-tuning results table (3 seeds x 500 rollouts)", sourceUrl: "https://github.com/openvla/openvla", verified: true },
    { task: "tabletop", benchmark: "libero", model: "pi0", metric: "Success rate", value: "Reported per task in openpi repo — not yet compiled into a single number here", latency: "Not reported", cost: "Not reported", source: "openpi reports", sourceUrl: "https://github.com/Physical-Intelligence/openpi", verified: false },
    { task: "tabletop", benchmark: "libero", model: "openvla_oft", metric: "Average success rate across 4 LIBERO suites", value: "97.1% (claimed, authors' own summary; per-suite breakdown is in an image on their site, not yet transcribed)", latency: "26x faster action generation, 3x lower latency than base OpenVLA (claimed)", cost: "Not reported", source: "OpenVLA-OFT project page", sourceUrl: "https://openvla-oft.github.io/", verified: "partial — average number stated in text, per-suite numbers not yet extracted from image" },
    { task: "tabletop", benchmark: "rlbench", model: "octo", metric: "Success rate", value: "62%", latency: "120 ms", cost: "Not reported", source: "Octo paper, RLBench tasks", sourceUrl: "https://octo-models.github.io/", verified: false, note: "Carried over from prior version of this file — not re-verified this pass." },
    { task: "tabletop", benchmark: "metaworld", model: "smolvla", metric: "Success rate", value: "Pending", latency: "Not reported", cost: "Not reported", source: "LeRobot model card", sourceUrl: "https://huggingface.co/blog/smolvla" },
    { task: "bimanual", benchmark: "robotwin", model: "pi0", metric: "Easy / Hard success", value: "Reported per task", latency: "Not reported", cost: "Not reported", source: "RoboTwin 2.0 + openpi", sourceUrl: "https://robotwin-benchmark.github.io/" },
    { task: "bimanual", benchmark: "robotwin", model: "gemini", metric: "Success rate", value: "Select partners", latency: "Not reported", cost: "Not reported", source: "Google DeepMind release", sourceUrl: "https://deepmind.google/discover/blog/" },
    { task: "mobile", benchmark: "behavior", model: "pi0", metric: "Predicate Q-score", value: "Pending", latency: "Not reported", cost: "Not reported", source: "BEHAVIOR-1K benchmark", sourceUrl: "https://behavior.stanford.edu/" },

    // --- CORRECTED: Psi-0 was mismatched to "humanoid" (HumanoidBench). Psi-0 was evaluated on its own
    // 8-task real-robot suite, not HumanoidBench. Kept under a new `benchmark: "psi0_own_suite"` label
    // rather than pretending it's HumanoidBench. HumanoidBench itself has no Psi-0 number to report. ---
    { task: "loco", benchmark: "psi0_own_suite", model: "psi0", metric: "Long-horizon task completion", value: "8 tasks, 10 rollouts each — aggregate success rate not yet extracted from paper", latency: "Not reported", cost: "Robot-hour required", source: "Psi-0 paper (arXiv 2603.12263) and repository", sourceUrl: "https://github.com/physical-superintelligence-lab/Psi0", verified: "partial — task count confirmed, exact success-rate numbers not yet pulled from the paper's tables" },
    { task: "loco", benchmark: "humanoid", model: "groot", metric: "Task success", value: "Pending — not confirmed GR00T is evaluated on HumanoidBench specifically", latency: "Not reported", cost: "Not reported", source: "GR00T technical report", sourceUrl: "https://developer.nvidia.com/isaac/gr00t" },

    { task: "household", benchmark: "behavior", model: "gemini", metric: "Activity success", value: "Select partners", latency: "Not reported", cost: "Not reported", source: "Google DeepMind release", sourceUrl: "https://deepmind.google/discover/blog/" },
    { task: "driving", benchmark: "simpler", model: "cosmos", metric: "Sim-real correlation", value: "Not comparable", latency: "Not reported", cost: "Not reported", source: "SIMPLER benchmark", sourceUrl: "https://simpler-env.github.io/" },
    { task: "world", benchmark: "pai", model: "cosmos", metric: "Video utility", value: "Benchmark pending — leaderboard is a live HF Space, needs a rendering-capable fetch, see note in README", latency: "Not reported", cost: "GPU-hours required", source: "PAI-Bench project", sourceUrl: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard" },
    { task: "tabletop", benchmark: "robocasa", model: "openvla", metric: "Success rate", value: "Pending", latency: "190 ms", cost: "Not reported", source: "RoboCasa benchmark page", sourceUrl: "https://robocasa.ai/" },
    { task: "mobile", benchmark: "maniskill", model: "pi0", metric: "Success rate", value: "Pending", latency: "Not reported", cost: "GPU-hours required", source: "ManiSkill3 benchmark page", sourceUrl: "https://maniskill.ai/" },
    { task: "household", benchmark: "calvin", model: "openvla", metric: "Chain success", value: "Pending", latency: "190 ms", cost: "Not reported", source: "CALVIN benchmark page", sourceUrl: "https://calvin-rl.github.io/" },
    { task: "industrial", benchmark: "phail", model: "helix", metric: "Throughput / MTBF", value: "Not reported", latency: "200 Hz control", cost: "Robot-hour required", source: "PhAIL leaderboard", sourceUrl: "https://phail.ai/" },
    { task: "industrial", benchmark: "robochallenge", model: "pi0", metric: "Progress score", value: "Pending — leaderboard page is JS-rendered, static fetch returned no table data", latency: "Not reported", cost: "Robot-hour required", source: "RoboChallenge system", sourceUrl: "https://robochallenge.ai/leaderboard" },
    { task: "locomotion", benchmark: "humanoid", model: "psi0", metric: "Disturbance recovery", value: "Pending", latency: "Not reported", cost: "Robot-hour required", source: "Psi-0 repository", sourceUrl: "https://github.com/physical-superintelligence-lab/Psi0" },
    { task: "world", benchmark: "worldarena", model: "dreamzero", metric: "World-model utility", value: "Pending", latency: "Not reported", cost: "GPU-hours required", source: "WorldArena project", sourceUrl: "https://github.com/tsinghua-fib-lab/WorldArena" },

    // --- REPLACED: the 6 RoboDojo rows below previously had specific decimal scores (82.4, 79.1, 65.8,
    // 71.2, 68.7, 54.3) that do NOT match the real paper and could not be traced to any source — almost
    // certainly fabricated by a prior pass. Replaced with the real Table 1 (Sim) / Table 2 (Real) numbers,
    // verified directly from the paper's HTML. Format: value = "Score / Success rate". ---
    { task: "tabletop", benchmark: "robodojo", model: "hy_embodied_05_vla", track: "Sim", metric: "Capability score / Success rate", value: "13.07 / 8.80%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "spatial_forcing", track: "Sim", metric: "Capability score / Success rate", value: "12.38 / 8.04%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "pi0", track: "Sim", metric: "Capability score / Success rate", value: "11.41 / 6.91% (pi0.5)", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "x_vla", track: "Sim", metric: "Capability score / Success rate", value: "10.13 / 6.52%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "x_wam", track: "Sim", metric: "Capability score / Success rate", value: "7.69 / 3.83%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "xiaomi_robotics_0", track: "Sim", metric: "Capability score / Success rate", value: "6.93 / 4.18%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "starvla_alpha", track: "Sim", metric: "Capability score / Success rate", value: "6.40 / 3.24%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "gigaworld_policy", track: "Sim", metric: "Capability score / Success rate", value: "6.20 / 3.27%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "groot", track: "Sim", metric: "Capability score / Success rate", value: "2.85 / 1.31%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "internvla_a1", track: "Sim", metric: "Capability score / Success rate", value: "2.48 / 1.08%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "lda1b", track: "Sim", metric: "Capability score / Success rate", value: "1.58 / 0.51%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "openvla_oft", track: "Sim", metric: "Capability score / Success rate", value: "0.21 / 0.02%", source: "RoboDojo paper, Table 1 (Sim)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true, note: "Strikingly low despite OpenVLA-OFT's strong LIBERO numbers above — a good example of why cross-benchmark scores are not comparable (different task set, different distribution)." },
    { task: "tabletop", benchmark: "robodojo", model: "human_baseline", track: "Sim", metric: "Capability score / Success rate", value: "80.42 / 76.03%", source: "RoboDojo paper, Table 1 (Sim), human expert reference", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },

    { task: "tabletop", benchmark: "robodojo", model: "pi0", track: "Real", metric: "Score / Success rate (overall avg)", value: "22.9 / 12.8% (pi0.5)", source: "RoboDojo paper, Table 2 (Real)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "internvla_a1", track: "Real", metric: "Score / Success rate (overall avg)", value: "12.0 / 7.2%", source: "RoboDojo paper, Table 2 (Real)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "galaxea_g0", track: "Real", metric: "Score / Success rate (overall avg)", value: "9.0 / 4.4%", source: "RoboDojo paper, Table 2 (Real)", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true },
    { task: "tabletop", benchmark: "robodojo", model: "human_baseline", track: "Real", metric: "Score / Success rate (overall avg)", value: "100.0 / 100.00%", source: "RoboDojo paper, Table 2 (Real), human teleoperator reference", sourceUrl: "https://arxiv.org/html/2607.04434v1", verified: true }
  ]
};