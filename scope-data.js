/* =============================================================================
   PhAIL - scope of physical AI (data only; scope-app.js draws it)
   -----------------------------------------------------------------------------
   Last updated: 2026-09-27

   Two layers, split by what the model's output IS once it leaves the model:
     execution  an action carried out in the physical world (robot, car, drone)
     planning   a design that gets manufactured (part, assembly, board, chip)
   plus a boundary branch for capabilities that feed both but produce neither
   (world models, embodied reasoning). The boundary branch is not ranked.

   Tree: layer > domain > task > benchmarks.

   Benchmark fields
     url     the page hosting the live leaderboard where there is one; else the
             project page; arXiv / GitHub only when nothing else exists
     mode    "Sim" | "Real" | "Sim + real" | "Offline" (no closed loop at all)
     board   "live" (public leaderboard that takes new entries) | "challenge"
             (time-boxed competition board) | "paper" (results live in papers)
     tests   what can be entered: "policy" (a trained controller), "agent" (a
             general model driving a harness), "both"
     ledger  benchmark id in tasks-data-new.js when we transcribe its numbers
     flag    "saturated" when the best published result is above ~95%
     added   true when we added it to the team's first list (2026-09-19)
   ========================================================================== */

window.phailScope = {
  updated: "2026-09-27",

  layers: [
    {
      id: "execution",
      name: "Execution layer",
      icon: "zap",
      gloss: "Output is an action carried out in the physical world.",
      domains: [
        {
          id: "robotics",
          name: "Robotics",
          icon: "bot",
          tasks: [
            {
              id: "tabletop",
              name: "Table-top manipulation",
              icon: "box",
              gloss: "Fixed-base arms, single or dual. Arm count changes the task list more than the difficulty, so the two sit together.",
              benchmarks: [
                { name: "RoboDojo", url: "https://robodojo-benchmark.com/leaderboard", mode: "Sim + real", board: "live", tests: "both", ledger: "robodojo_sim", note: "42 sim + 18 real bimanual tasks; scores generalization, precision, long-horizon, memory and open-vocabulary separately. 48 sim / 11 real entries." },
                { name: "RoboChallenge", url: "https://robochallenge.ai/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "robochallenge", note: "Online real-robot board (Dexmal / Hugging Face). Table30: 30 tasks on UR5, Franka, ARX5, ALOHA; Table30-v2 is markedly harder." },
                { name: "RoboArena", url: "https://robo-arena.github.io/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "roboarena", note: "Double-blind pairwise A/B evaluations on DROID at 8 institutions, pooled into a Bradley-Terry ranking. No success rate by design." },
                { name: "RoboTwin 2.0", url: "https://robotwin-platform.github.io/leaderboard", mode: "Sim", board: "live", tests: "policy", ledger: "robotwin", added: true, note: "50 dual-arm tasks; clean and domain-randomised scenes reported separately - the gap between them is the finding." },
                { name: "LIBERO", url: "https://libero-project.github.io/", mode: "Sim", board: "paper", tests: "policy", ledger: "libero", flag: "saturated", note: "130 tasks in 4 suites (Spatial / Object / Goal / Long). Top reports sit above 97%." },
                { name: "LIBERO-Pro", url: "https://zxy-mllab.github.io/LIBERO-PRO-Webpage/", mode: "Sim", board: "paper", tests: "policy", note: "Perturbs objects, positions, instructions and environments to test whether LIBERO scores survive small changes." },
                { name: "LIBERO-Plus", url: "https://sylvestf.github.io/LIBERO-plus/", mode: "Sim", board: "paper", tests: "policy", note: "10,030 perturbed LIBERO tasks over 7 dimensions: camera, robot state, language, light, background, noise, layout." },
                { name: "SimplerEnv", url: "https://simpler-env.github.io/", mode: "Sim", board: "paper", tests: "policy", ledger: "simpler_bridge", added: true, note: "Sim replicas of Google Robot and WidowX setups, built so sim rankings track real ones." },
                { name: "CALVIN", url: "http://calvin.cs.uni-freiburg.de", mode: "Sim", board: "paper", tests: "policy", note: "34 tasks in 4 environments; scored on chains of 5 language instructions." },
                { name: "RLBench", url: "https://sites.google.com/view/rlbench", mode: "Sim", board: "paper", tests: "policy", note: "100 hand-designed tasks for a Franka Panda in CoppeliaSim." },
                { name: "Meta-World", url: "https://meta-world.github.io", mode: "Sim", board: "paper", tests: "policy", ledger: "metaworld", note: "50 tasks for a Sawyer arm in MuJoCo; multi-task and meta-RL." },
                { name: "The Colosseum", url: "https://robot-colosseum.github.io/", mode: "Sim + real", board: "paper", tests: "policy", added: true, note: "20 RLBench tasks under 14 perturbation axes; reports how far success drops." },
                { name: "ManiSkill3", url: "https://maniskill.ai/", mode: "Sim", board: "paper", tests: "policy", added: true, note: "GPU-parallel SAPIEN simulation; dozens of task families across many embodiments." },
                { name: "AutoEval", url: "https://auto-eval.github.io/", mode: "Real", board: "live", tests: "policy", added: true, note: "Unattended real-robot evaluation on WidowX, with automatic resets and success detection." },
                { name: "StationeryBench", url: "https://github.com/robocurve/stationerybench", mode: "Real", board: "paper", tests: "both", added: true, note: "Five bimanual desk tasks on I2RT YAM arms through Inspect Robots - VLAs and LLM agents on one harness." }
              ]
            },
            {
              id: "mobile",
              name: "Mobile manipulation",
              icon: "house",
              gloss: "A moving base plus arms, mostly in homes; long-horizon by construction.",
              benchmarks: [
                { name: "BEHAVIOR-1K", url: "https://behavior.stanford.edu/", mode: "Sim", board: "challenge", tests: "policy", note: "1,000 household activities, 50 interactive scenes, 10,000+ objects." },
                { name: "RoboCasa", url: "https://robocasa.ai/", mode: "Sim", board: "paper", tests: "policy", ledger: "robocasa", added: true, note: "Large-scale kitchen tasks and scenes for a mobile manipulator." },
                { name: "HomeRobot OVMM", url: "https://arxiv.org/abs/2407.06939", mode: "Sim + real", board: "challenge", tests: "policy", note: "Open-vocabulary pick-and-place across 50 scenes." },
                { name: "Habitat 2.0 HAB", url: "https://aihabitat.org/docs/habitat2/", mode: "Sim", board: "paper", tests: "policy", note: "Three composite household tasks: Tidy House, Prepare Groceries, Set Table." },
                { name: "ManiSkill-HAB", url: "https://maniskill.readthedocs.io/en/latest/tasks/external/", mode: "Sim", board: "paper", tests: "policy", note: "GPU-parallel re-implementation of the Habitat Home Assistant Benchmark." }
              ]
            },
            {
              id: "loco",
              name: "Loco-manipulation (humanoid)",
              icon: "person-standing",
              gloss: "Whole-body control while manipulating: balance and contact matter as much as the grasp.",
              benchmarks: [
                { name: "HumanoidBench", url: "https://humanoid-bench.github.io/", mode: "Sim", board: "paper", tests: "policy", note: "27 tasks: 12 locomotion, 15 whole-body manipulation." },
                { name: "SIMPLE", url: "https://arxiv.org/abs/2606.08278", mode: "Sim", board: "paper", tests: "policy", note: "60 whole-body humanoid tasks, 50 indoor scenes, 1,000+ object assets." },
                { name: "GRBench (GRUtopia)", url: "https://arxiv.org/abs/2407.10943", mode: "Sim", board: "paper", tests: "policy", note: "Loco-manipulation track of GRUtopia, alongside object and social loco-navigation." },
                { name: "HumanoidMimicGen G1", url: "https://arxiv.org/abs/2605.27724", mode: "Sim", board: "paper", tests: "policy", note: "Nine industrial loco-manipulation tasks for the Unitree G1: lifting, pushing, shelving, obstacles." }
              ]
            },
            {
              id: "dexterous",
              name: "Dexterous manipulation",
              icon: "hand",
              gloss: "Multi-finger hands and contact-rich skills.",
              benchmarks: [
                { name: "Bi-DexHands", url: "https://github.com/PKU-MARL/DexterousHands", mode: "Sim", board: "paper", tests: "policy", note: "20 bimanual task families with two Shadow Hands and 2,000+ objects." },
                { name: "DexArt", url: "https://www.chenbao.tech/dexart/", mode: "Sim", board: "paper", tests: "policy", note: "Dexterous manipulation of articulated objects: bucket, faucet, laptop, toilet." },
                { name: "Adroit / D4RL", url: "https://minari.farama.org/datasets/D4RL/index.html", mode: "Sim", board: "paper", tests: "policy", note: "Offline-RL standard with a 24-DoF hand." },
                { name: "RoboPianist", url: "https://kzakka.com/robopianist/", mode: "Sim", board: "paper", tests: "both", added: true, note: "Two simulated Shadow hands playing piano, scored by note-onset F1. Frontier models now write controllers for it." },
                { name: "EmbodiedSWE-Bench", url: "https://embodiedswe.github.io/", mode: "Sim", board: "live", tests: "agent", added: true, note: "Coding agents build controllers for 28 long-horizon dexterous tasks (assembly, cutting, knots) across 17 embodiments." }
              ]
            },
            {
              id: "industrial",
              name: "Industrial pick and place",
              icon: "factory",
              gloss: "Production-style tasks scored on throughput and reliability, not on a success rate.",
              benchmarks: [
                { name: "PhAIL (Positronic)", url: "https://phail.ai/", mode: "Real", board: "live", tests: "policy", added: true, note: "Bin-to-bin picking on a Franka FR3; units per hour and mean time between failures. Unrelated to this site despite the name." }
              ]
            },
            {
              id: "navigation",
              name: "Navigation",
              icon: "compass",
              gloss: "Moving the robot itself to a goal, with little or no manipulation.",
              benchmarks: [
                { name: "Habitat", url: "https://ai.meta.com/research/publications/habitat-a-platform-for-embodied-ai-research/", mode: "Sim", board: "challenge", tests: "policy", note: "Point-goal and object-goal navigation, instruction following and QA in photorealistic scans." },
                { name: "VLN-CE (R2R-CE)", url: "https://jacobkrantz.github.io/vlnce/", mode: "Sim", board: "live", tests: "both", added: true, note: "Language-guided navigation in continuous 3D environments." },
                { name: "Butter-Bench", url: "https://andonlabs.com/evals/butter-bench", mode: "Real", board: "paper", tests: "agent", added: true, note: "LLMs orchestrate a real mobile robot through a delivery errand; checks practical intelligence, not low-level control." }
              ]
            },
            {
              id: "memory",
              name: "Memory",
              icon: "history",
              kind: "capability",
              gloss: "Capability board: tasks that fail unless the policy remembers earlier steps. Needs closed loop and long horizon.",
              benchmarks: [
                { name: "RoboMME", url: "https://robomme.github.io", mode: "Sim", board: "paper", tests: "policy", note: "Memory benchmark for generalist policies; closed-loop, long-horizon tasks." },
                { name: "MIKASA-Robo", url: "https://sites.google.com/view/memorybenchrobots/", mode: "Sim", board: "paper", tests: "policy", added: true, note: "90 language-conditioned tabletop tasks covering 10 memory types (ICLR 2026)." },
                { name: "RoboMemArena", url: "https://github.com/OpenHelix-Team/RoboMemArena", mode: "Sim + real", board: "paper", tests: "policy", added: true, note: "26 tasks averaging 1,000+ steps; 69% of subtasks memory-dependent; paired real-robot evaluation." },
                { name: "RMBench", url: "https://arxiv.org/abs/2603.01229", mode: "Sim", board: "paper", tests: "policy", added: true, note: "Memory-dependent manipulation tasks with an analysis of which policy designs help." }
              ]
            },
            {
              id: "safety",
              name: "Safety",
              icon: "shield-alert",
              kind: "capability",
              gloss: "Capability board: does the system refuse, or avoid, harmful actions.",
              benchmarks: [
                { name: "RoboHarm", url: "https://robocurve.org/roboharm/", mode: "Real", board: "paper", tests: "both", note: "Five harmful instructions on real bimanual arms; counts refusals and completed harms separately." },
                { name: "ASIMOV", url: "https://asimov-benchmark.github.io", mode: "Offline", board: "paper", tests: "agent", added: true, note: "Semantic-safety datasets for robot foundation models: injury risk, embodiment constraints, video." }
              ]
            },
            {
              id: "tactile",
              name: "Visuo-tactile",
              icon: "fingerprint",
              kind: "capability",
              gloss: "Capability board: contact-rich skills that need touch as well as vision.",
              benchmarks: [
                { name: "ManiSkill-ViTac", url: "https://ai-workshops.github.io/maniskill-vitac-challenge-2025/", mode: "Sim + real", board: "challenge", tests: "policy", added: true, note: "Tactile manipulation, tactile-vision fusion and sensor-design tracks." }
              ]
            }
          ]
        },
        {
          id: "driving",
          name: "Autonomous driving",
          icon: "car",
          tasks: [
            {
              id: "e2e",
              name: "End-to-end driving",
              icon: "route",
              gloss: "Sensors in, trajectory or controls out; scored in closed-loop simulation or on replayed logs.",
              benchmarks: [
                { name: "CARLA Leaderboard", url: "https://leaderboard.carla.org/leaderboard/", mode: "Sim", board: "live", tests: "policy", note: "Closed-loop CARLA driving; SENSORS and MAP tracks; driving score, route completion, infractions." },
                { name: "Bench2Drive", url: "https://thinklab-sjtu.github.io/Bench2Drive/", mode: "Sim", board: "paper", tests: "policy", note: "220 routes over 44 interactive scenarios in CARLA." },
                { name: "NAVSIM", url: "https://huggingface.co/spaces/AGC2025/e2e-driving-navhard", mode: "Sim", board: "live", tests: "policy", added: true, note: "Pseudo-simulation on real driving logs; server-side scoring on an official leaderboard." },
                { name: "nuPlan", url: "https://www.nuscenes.org/nuplan", mode: "Sim", board: "challenge", tests: "policy", added: true, note: "Planning benchmark on 1,200 hours of real driving logs, open- and closed-loop." },
                { name: "Waymo Open Dataset challenges", url: "https://waymo.com/open/challenges/", mode: "Offline", board: "challenge", tests: "policy", added: true, note: "Annual challenges including vision-based end-to-end driving on Waymo's logs." }
              ]
            },
            {
              id: "ood",
              name: "OOD generalisation",
              icon: "shuffle",
              kind: "capability",
              gloss: "Capability board: paired in- and out-of-distribution scenarios.",
              benchmarks: [
                { name: "Fail2Drive", url: "https://simonger.github.io/fail2drive/", mode: "Sim", board: "live", tests: "policy", note: "100 paired ID / OOD scenarios over 17 unseen classes in CARLA." }
              ]
            },
            {
              id: "drivesafety",
              name: "Safety-critical driving",
              icon: "shield-alert",
              kind: "capability",
              gloss: "Capability board: adversarial and near-miss scenarios.",
              benchmarks: [
                { name: "SafeBench", url: "https://safebench.github.io/", mode: "Sim", board: "live", tests: "policy", note: "100 routes over 8 safety-critical scenario templates in CARLA (CMU / UIUC)." }
              ]
            },
            {
              id: "realcar",
              name: "Real vehicle",
              icon: "car",
              gloss: "A real car on a closed course.",
              benchmarks: [
                { name: "DrivingBench", url: "https://drivingbench.com/", mode: "Real", board: "paper", tests: "agent", added: true, note: "Frontier LLMs steer a real Toyota Corolla through a cone course via openpilot and MCP tools; scored on progress." }
              ]
            }
          ]
        },
        {
          id: "aerial",
          name: "Aerial",
          icon: "plane",
          tasks: [
            {
              id: "drones",
              name: "Drones",
              icon: "plane",
              gloss: "Small drones indoors.",
              benchmarks: [
                { name: "Drone-Bench", url: "https://andonlabs.com/evals/drone-bench", mode: "Sim + real", board: "live", tests: "agent", added: true, note: "Models write code that flies a real Tello drone to find and follow a person; scored against a human baseline." }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "planning",
      name: "Planning layer",
      icon: "pencil-ruler",
      gloss: "Output is a design that gets manufactured.",
      domains: [
        {
          id: "mechanical",
          name: "Mechanical design",
          icon: "drafting-compass",
          tasks: [
            {
              id: "cad",
              name: "CAD generation and editing",
              icon: "box",
              gloss: "Text, drawings or images in; parametric CAD out, checked by executing it.",
              benchmarks: [
                { name: "BenchCAD", url: "https://benchcad.com/", mode: "Offline", board: "live", tests: "agent", note: "Programmatic CAD generation, QA and editing: 17,900 CadQuery parts in 106 families; execution-based grading." },
                { name: "Parametric CAD Bench", url: "https://cadbench.ai/", mode: "Offline", board: "live", tests: "agent", note: "100 held-out FreeCAD part tasks; isolated geometry and spec verification." },
                { name: "CAD Arena", url: "https://normal.ai/leaderboard/cad-arena", mode: "Offline", board: "live", tests: "agent", note: "Native CAD agents across 5 CAD platforms on 18 real engineering drawings; geometry and editability." },
                { name: "neuralCAD-Edit", url: "https://autodeskailab.github.io/neuralCAD-Edit/", mode: "Offline", board: "live", tests: "agent", note: "192 multimodal CAD editing requests with 384 expert edits (Autodesk Research)." },
                { name: "CADBench", url: "https://anniedoris.github.io/CADBench/", mode: "Offline", board: "live", tests: "agent", note: "18,000 CAD reconstruction samples over 6 families and 5 input modalities (MIT)." },
                { name: "CadQueryEval", url: "https://github.com/danwahl/cadqueryeval", mode: "Offline", board: "live", tests: "agent", added: true, note: "25 natural-language CAD tasks; generated CadQuery is run and checked against reference STLs." },
                { name: "Text2CAD", url: "https://sadilkhan.github.io/text2cad-project/", mode: "Offline", board: "paper", tests: "policy", added: true, note: "Parametric CAD sequences from beginner- to expert-level text prompts." }
              ]
            },
            {
              id: "engineering",
              name: "Constrained engineering design",
              icon: "cog",
              gloss: "The design has to work, not just look right: constraints, assemblies, physics.",
              benchmarks: [
                { name: "Bike-Bench", url: "https://decode.mit.edu/projects/bikebench/", mode: "Offline", board: "paper", tests: "both", note: "Parametric bicycle design scored on validity, engineering objectives and constraint satisfaction (MIT)." },
                { name: "CADEngBench", url: "https://arxiv.org/abs/2608.09296", mode: "Offline", board: "paper", tests: "agent", added: true, note: "Checks whether generated CAD works: parametric design, assembly reasoning and physics simulation." }
              ]
            }
          ]
        },
        {
          id: "electronics",
          name: "Electronics design",
          icon: "circuit-board",
          tasks: [
            {
              id: "pcb",
              name: "Printed circuit boards",
              icon: "circuit-board",
              gloss: "Placement and routing that pass design-rule checks.",
              benchmarks: [
                { name: "OmniLayout", url: "https://www.omnieda.com/", mode: "Offline", board: "live", tests: "both", note: "PCB component placement: 1,681 layouts, 77K placement instances; geometry, routability, connectivity." },
                { name: "OmniRouting", url: "https://www.omnieda.com/routing/", mode: "Offline", board: "live", tests: "both", note: "Trace and via routing on 1,681 designs; DRC-clean connectivity, wirelength, runtime; one-shot and agentic." }
              ]
            },
            {
              id: "rtl",
              name: "Chip design (RTL)",
              icon: "cpu",
              gloss: "Hardware description code that simulates, synthesises and meets spec.",
              benchmarks: [
                { name: "VerilogEval", url: "https://github.com/NVlabs/verilog-eval", mode: "Offline", board: "paper", tests: "agent", added: true, note: "Natural-language spec to Verilog, checked by simulation (NVIDIA)." },
                { name: "RTLLM", url: "https://github.com/hkust-zhiyao/RTLLM", mode: "Offline", board: "paper", tests: "agent", added: true, note: "RTL generation from design descriptions; syntax, function and PPA (HKUST)." }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "support",
      name: "Supporting capabilities",
      icon: "eye",
      boundary: true,
      gloss: "Perceive, reason about or predict the physical world, without acting or producing. Not ranked.",
      domains: [
        {
          id: "reasoning",
          name: "Embodied reasoning",
          icon: "brain",
          tasks: [
            {
              id: "spatial",
              name: "Spatial and physical reasoning",
              icon: "axis-3d",
              gloss: "Question answering, pointing and planning about 3D scenes; no actuation.",
              benchmarks: [
                { name: "ERQA", url: "https://github.com/embodiedreasoning/ERQA", mode: "Offline", board: "paper", tests: "agent", added: true, note: "Embodied-reasoning QA released with Gemini Robotics." },
                { name: "RoboSpatial", url: "https://chanh.ee/RoboSpatial/", mode: "Offline", board: "paper", tests: "agent", added: true, note: "Spatial relations from a robot's viewpoint: configuration, context, compatibility." },
                { name: "VSI-Bench", url: "https://vision-x-nyu.github.io/thinking-in-space.github.io/", mode: "Offline", board: "paper", tests: "agent", added: true, note: "Visual-spatial intelligence from egocentric video." },
                { name: "EmbodiedBench", url: "https://embodiedbench.github.io/", mode: "Sim", board: "live", tests: "agent", added: true, note: "MLLMs as embodied agents, from high-level planning down to low-level manipulation." }
              ]
            }
          ]
        },
        {
          id: "world",
          name: "World models",
          icon: "globe",
          tasks: [
            {
              id: "prediction",
              name: "Physical-world prediction",
              icon: "activity",
              gloss: "Generate or predict what happens next, judged on physics and usefulness downstream.",
              benchmarks: [
                { name: "WorldArena", url: "https://github.com/tsinghua-fib-lab/WorldArena", mode: "Offline", board: "live", tests: "policy", note: "Perception quality and functional utility of embodied world models." },
                { name: "PAI-Bench", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard", mode: "Offline", board: "live", tests: "policy", note: "Video generation and understanding across driving, robotics, industrial and egocentric domains." },
                { name: "WorldScore", url: "https://haoyi-duan.github.io/WorldScore/", mode: "Offline", board: "live", tests: "policy", added: true, note: "Unified evaluation of world generation: controllability, quality, dynamics." }
              ]
            }
          ]
        }
      ]
    }
  ]
};
