/* =============================================================================
   PhAIL - scope of physical AI (data only; scope-app.js draws it)
   -----------------------------------------------------------------------------
   Last updated: 2026-09-28

   Placement rule - by what the benchmark SCORES:
     execution  an action carried out in the world (robot, car, drone)
     design     a design that gets manufactured (part, assembly, board, chip)
     support    an answer or a generated video about the physical world
                (embodied reasoning, world models). Shown as "Supporting
                capabilities", flagged `boundary: true`, kept out of the ranking.
   So a driving world model (WorldLens) sits under Supporting capabilities even
   though its domain is driving, and EmbodiedBench sits under Robotics even
   though it tests general models: its agents act in a simulator.

   Robotics is split by TASK CATEGORY - what the robot has to do - never by
   embodiment: a wheeled robot parked at a table doing pick-and-place is
   table-top manipulation. Task categories come first; capability boards
   (kind: "capability", drawn dashed) follow, each isolating one capability
   with tasks from any category.

   Tree: layer > domain > task > benchmarks. Every node has `define`, the
   plain-language definition shown on hover. Every count on the page is
   computed from this file when it loads.

   Benchmark fields
     url     the page hosting the live leaderboard where there is one; else the
             project page; arXiv / GitHub only when nothing else exists
     mode    "Sim" | "Real" | "Sim + real" | "Offline" (no closed loop)
     board   "live" | "challenge" | "paper"   (scope-app.js explains each)
     tests   "policy" | "agent" | "both"
     plain   one plain-English sentence: what the robot / model has to do
     tasks   size of the task set, as the authors count it
     models  how many models the board or paper compares, when stated
     usage   where it shows up, when that is useful to know
     ledger  benchmark id in tasks-data-new.js when we transcribe its numbers
     flag    "saturated" when the best published result is above ~95%
     added   date we added it beyond the team's first list (2026-09-19)
   ========================================================================== */

window.phailScope = {
  updated: "2026-09-28",

  layers: [
    {
      id: "execution",
      name: "Execution layer",
      icon: "zap",
      gloss: "Output is an action carried out in the physical world.",
      define: "The model's output is an action in the world - an arm moving, a car steering, a drone flying. Scored on whether the job got done, and how well.",
      domains: [
        {
          id: "robotics",
          name: "Robotics",
          icon: "bot",
          define: "A model controls a robot to get a physical job done. Split by task category - what the robot has to do - not by embodiment: a wheeled robot parked at a table doing pick-and-place counts as table-top manipulation. After the task categories come the capability boards (dashed): each tests one capability, such as memory or safety, using tasks from any category.",
          tasks: [
            {
              id: "tabletop",
              name: "Table-top manipulation",
              icon: "box",
              define: "Tasks done at one work surface while the robot's base stays put: pick and place, stack, pour, open a drawer, insert a peg. One-arm and two-arm set-ups both count - the task decides the category, not the number of arms. The most measured category in physical AI.",
              benchmarks: [
                { name: "RoboDojo", url: "https://robodojo-benchmark.com/leaderboard", mode: "Sim + real", board: "live", tests: "both", ledger: "robodojo_sim",
                  plain: "Two-armed robots do everyday table-top jobs, once in simulation and once on real arms, with five skills scored separately: generalization, precision, long-horizon, memory, open instructions.",
                  tasks: "42 sim + 18 real", models: "48 sim, 11 real (Sep 2026)", usage: "The widest public VLA board in 2026; also ranks frontier LLMs through a harness." },
                { name: "RoboChallenge", url: "https://robochallenge.ai/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "robochallenge",
                  plain: "Teams upload a policy; the operator runs it on its own real robots (UR5, Franka, ARX5, ALOHA) and publishes success and progress scores.",
                  tasks: "30 per table (Table30, Table30-v2)", models: "22 entries on Table30, 53 on Table30-v2 (29 Sep 2026)", usage: "The main real-robot board where outside teams submit." },
                { name: "RoboArena", url: "https://robo-arena.github.io/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "roboarena",
                  plain: "Evaluators at eight universities pick their own task, run two anonymous policies on a DROID robot and say which did better; the votes become a ranking.",
                  tasks: "Open - evaluators choose", models: "9 policies on the public board", usage: "Crowd-sourced, like Chatbot Arena for robots; no success rate by design." },
                { name: "RoboTwin 2.0", url: "https://robotwin-platform.github.io/leaderboard", mode: "Sim", board: "live", tests: "policy", ledger: "robotwin", added: "2026-09-27",
                  plain: "Dual-arm tasks in simulation, tested on clean scenes and again on randomised ones; the drop between the two is the point.",
                  tasks: "50", models: "20 on the board", usage: "Standard dual-arm board; listing needs public code and weights." },
                { name: "LIBERO", url: "https://libero-project.github.io/main.html", mode: "Sim", board: "paper", tests: "policy", ledger: "libero", flag: "saturated",
                  plain: "A single simulated arm follows language instructions in kitchen and table scenes, grouped into four suites (spatial, object, goal, long).",
                  tasks: "130 (four 10-task suites are standard)", usage: "Reported in almost every VLA paper; top scores now above 97%, so it no longer separates models." },
                { name: "LIBERO-Pro", url: "https://zxy-mllab.github.io/LIBERO-PRO-Webpage/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "LIBERO with objects, positions, instructions and scenes changed, to check whether high LIBERO scores survive small changes.",
                  tasks: "LIBERO tasks with perturbations", usage: "Used to show LIBERO scores are memorised." },
                { name: "LIBERO-Plus", url: "https://sylvestf.github.io/LIBERO-plus/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "LIBERO under seven kinds of disturbance - camera angle, robot start pose, wording, lighting, background, sensor noise, layout.",
                  tasks: "10,030 perturbed tasks", usage: "Robustness check for LIBERO-trained policies." },
                { name: "SimplerEnv", url: "https://simpler-env.github.io/", mode: "Sim", board: "paper", tests: "policy", ledger: "simpler_bridge", added: "2026-09-27",
                  plain: "Simulated copies of real Google Robot and WidowX setups, built so a policy's sim score tracks its real-robot score.",
                  tasks: "~10 across two robots", usage: "Standard for policies trained on Open X-Embodiment data." },
                { name: "CALVIN", url: "http://calvin.cs.uni-freiburg.de/#leaderboard", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A simulated arm at a desk must complete five language instructions in a row; the score is how many it chains before failing.",
                  tasks: "34 in 4 environments", usage: "Long-standing test for language-conditioned, multi-step policies." },
                { name: "RLBench", url: "https://sites.google.com/view/rlbench", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A large set of hand-designed tasks for a simulated Franka arm, from opening drawers to stacking blocks.",
                  tasks: "100", usage: "Common in 3D and keyframe-policy papers." },
                { name: "Meta-World", url: "https://meta-world.github.io", mode: "Sim", board: "paper", tests: "policy", ledger: "metaworld",
                  plain: "Simulated single-arm tasks such as pushing, reaching and opening, used to test learning many tasks at once.",
                  tasks: "50", usage: "Standard in multi-task and meta-RL papers." },
                { name: "ManiSkill3", url: "https://maniskill.ai/", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Fast GPU simulation with many task families across many robot types, used both to train and to test.",
                  tasks: "Dozens of families", usage: "Common for RL at scale." },
                { name: "AutoEval", url: "https://auto-eval.github.io/", mode: "Real", board: "live", tests: "policy", added: "2026-09-27",
                  plain: "Real WidowX robots that reset their own scenes and judge success automatically, so policies can be tested around the clock.",
                  tasks: "A small set of fixed real tasks", usage: "Unattended real-robot testing." },
                { name: "StationeryBench", url: "https://robocurve.github.io/stationerybench/", mode: "Real", board: "paper", tests: "both", added: "2026-09-27",
                  plain: "Two real arms handle desk stationery - uncap a marker, open a box, pour paper clips - with VLAs and LLM agents on the same harness.",
                  tasks: "5", models: "2 (GPT-6-Astra, MolmoAct2)", usage: "Robocurve's head-to-head of an agent against a VLA." },
                { name: "VLA-Arena", url: "https://vla-arena.github.io/#leaderboard", mode: "Sim", board: "live", tests: "policy", added: "2026-09-28",
                  plain: "Simulated manipulation at three difficulty levels along four axes: safety, distractors, extrapolation and long horizon.",
                  tasks: "170", usage: "New (PKU, ICML 2026)." }
              ]
            },
            {
              id: "mobile",
              name: "Mobile manipulation",
              icon: "mobile-manipulator",
              define: "Tasks that need the robot to move between places and manipulate things there: fetch a mug from the kitchen, tidy a room, load a dishwasher. Navigation and manipulation in one task. Usually a wheeled base with one or two arms.",
              benchmarks: [
                { name: "BEHAVIOR-1K", url: "https://huggingface.co/spaces/behavior-1k/2026-challenge-leaderboard", mode: "Sim", board: "challenge", tests: "policy",
                  plain: "Everyday household activities - cleaning, cooking, tidying - done by a simulated mobile robot in realistic homes.",
                  tasks: "1,000 activities, 50 scenes", usage: "Stanford's household benchmark; runs a public challenge." },
                { name: "RoboCasa", url: "https://robocasa.ai/leaderboard.html", mode: "Sim", board: "paper", tests: "policy", ledger: "robocasa", added: "2026-09-27",
                  plain: "A simulated mobile manipulator works in many generated kitchens: opening doors, moving food, using appliances.",
                  tasks: "100", usage: "GR00T and other foundation policies report on a 24-task subset." },
                { name: "HomeRobot OVMM", url: "https://ovmm.github.io/", mode: "Sim + real", board: "challenge", tests: "policy",
                  plain: "Find any named object in an unfamiliar home, pick it up and put it somewhere else.",
                  tasks: "Open-vocabulary pick-and-place, 50 scenes", usage: "Ran as a NeurIPS challenge." },
                { name: "Habitat 2.0 HAB", url: "https://aihabitat.org/docs/habitat2/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A simulated home robot tidies the house, puts away groceries and sets the table.",
                  tasks: "3 composite tasks" },
                { name: "ManiSkill-HAB", url: "https://maniskill.readthedocs.io/en/latest/tasks/external/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "The same three Habitat home tasks re-built on fast GPU simulation.",
                  tasks: "3 composite tasks" }
              ]
            },
            {
              id: "loco",
              name: "Loco-manipulation",
              icon: "person-standing",
              define: "Tasks that need walking and manipulating at the same time, with the whole body: carry a box while walking, push a cart, lift from the floor. The robot must keep its balance while in contact with objects. Mostly humanoids today.",
              benchmarks: [
                { name: "HumanoidBench", url: "https://humanoid-bench.github.io/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A simulated humanoid walks, balances and uses both hands on whole-body tasks.",
                  tasks: "27 (12 locomotion, 15 manipulation)" },
                { name: "SIMPLE", url: "https://psi-lab.ai/SIMPLE/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "Whole-body humanoid tasks in indoor scenes, built to train and evaluate humanoid policies in simulation.",
                  tasks: "60 in 50 scenes" },
                { name: "GRBench (GRUtopia)", url: "https://github.com/OpenRobotLab/GRUtopia", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A humanoid walks to objects in large simulated city-scale scenes and manipulates them.",
                  tasks: "Loco-manipulation track of three" },
                { name: "HumanoidMimicGen G1", url: "https://humanoidmimicgen.github.io/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A Unitree G1 humanoid does factory-style jobs: lifting, pushing, shelving, walking around obstacles.",
                  tasks: "9" }
              ]
            },
            {
              id: "dexterous",
              name: "Dexterous manipulation",
              icon: "hand",
              define: "Tasks that need finger-level control of an object: turn it within the hand, use a tool, press piano keys, open a faucet. Needs a multi-fingered hand; a parallel gripper cannot do them.",
              benchmarks: [
                { name: "Bi-DexHands", url: "https://pku-marl.github.io/DexterousHands/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "Two simulated Shadow hands cooperate on bimanual jobs like passing, opening and catching.",
                  tasks: "20 task families" },
                { name: "DexArt", url: "https://www.chenbao.tech/dexart/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A dexterous hand operates hinged objects: buckets, faucets, laptops, toilet lids.",
                  tasks: "4 categories" },
                { name: "Adroit / D4RL", url: "https://minari.farama.org/datasets/D4RL/index.html", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A 24-joint simulated hand spins a pen, opens a door, hammers a nail and moves a ball.",
                  tasks: "4", usage: "Standard in offline-RL papers." },
                { name: "RoboPianist", url: "https://kzakka.com/robopianist/", mode: "Sim", board: "paper", tests: "both", added: "2026-09-27",
                  plain: "Two simulated Shadow hands play the piano; scored on hitting the right notes at the right time.",
                  tasks: "Songs from a 150-piece repertoire", usage: "Frontier models now write controllers for it." },
                { name: "EmbodiedSWE-Bench", url: "https://embodiedswe.github.io/", mode: "Sim", board: "live", tests: "agent", added: "2026-09-27",
                  plain: "Coding agents write robot controllers for long, fiddly tasks - assembling furniture, tying knots, cutting - in simulation.",
                  tasks: "28 across 17 embodiments", models: "6 agent set-ups in the first results" }
              ]
            },
            {
              id: "industrial",
              name: "Industrial pick and place",
              icon: "factory",
              define: "The same pick-and-place repeated for hours, as on a production line: move items from bin to bin. Scored on throughput and reliability - units per hour, time between failures - rather than success on a few trials.",
              benchmarks: [
                { name: "PhAIL (Positronic)", url: "https://phail.ai/", mode: "Real", board: "live", tests: "policy", added: "2026-09-27",
                  plain: "A real Franka arm moves items from bin to bin for as long as it can; scored like a production line. Unrelated to this site despite the name.",
                  tasks: "1", models: "4" }
              ]
            },
            {
              id: "navigation",
              name: "Navigation",
              icon: "compass",
              define: "Tasks where the job is to move the robot itself: reach a point on a map, find a named object, or follow spoken route directions. Little or no manipulation.",
              benchmarks: [
                { name: "Habitat", url: "https://aihabitat.org/challenge/2023/", mode: "Sim", board: "challenge", tests: "policy",
                  plain: "A simulated robot finds a point or a named object in scanned real homes.",
                  tasks: "Point-goal and object-goal navigation", usage: "Annual Habitat challenge." },
                { name: "VLN-CE (R2R-CE)", url: "https://eval.ai/web/challenges/challenge-page/719/leaderboard", mode: "Sim", board: "live", tests: "both", added: "2026-09-27",
                  plain: "Follow spoken-style route directions (“go past the sofa, turn left…”) through 3D homes, moving freely rather than hopping between fixed points.",
                  tasks: "Room-to-Room instructions in continuous space" },
                { name: "Butter-Bench", url: "https://andonlabs.com/evals/butter-bench", mode: "Real", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "An LLM runs a real small robot through an office errand - find the butter, bring it over - testing judgement rather than motor control.",
                  tasks: "One errand split into sub-tasks" }
              ]
            },
            {
              id: "agents",
              name: "Embodied agent suites",
              icon: "bot",
              define: "Suites that mix several task categories - household planning, navigation, table-top manipulation - and are built to test general models (LLMs, VLMs) as the robot's controller, from high-level steps down to low-level moves. The model acts, so these sit here, not under Embodied reasoning.",
              benchmarks: [
                { name: "EmbodiedBench", url: "https://embodiedbench.github.io/", mode: "Sim", board: "live", tests: "agent", added: "2026-09-27",
                  plain: "Multimodal LLMs act as the robot's brain in four simulated worlds: household planning, navigation and table-top manipulation.",
                  tasks: "4 environments, high- and low-level" },
                { name: "Embodied Agent Interface", url: "https://embodied-agent-interface.github.io/", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "LLMs plan and execute household activities in BEHAVIOR and VirtualHome, with each step of decision-making scored separately.",
                  tasks: "Household activities in two simulators" }
              ]
            },
            {
              id: "memory",
              name: "Memory",
              icon: "history",
              kind: "capability",
              define: "Capability board. Tasks that cannot be solved from the current camera view alone: the robot must recall something it saw or did earlier - which cup the ball is under, whether the drawer was already opened, how many items it has placed.",
              benchmarks: [
                { name: "RoboMME", url: "https://robomme.github.io/leaderboard.html", mode: "Sim", board: "paper", tests: "policy",
                  plain: "Closed-loop manipulation tasks that fail unless the policy remembers what it saw or did earlier.",
                  tasks: "Memory tasks across several memory types" },
                { name: "MIKASA-Robo", url: "https://sites.google.com/view/memorybenchrobots/", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Table-top tasks built around specific memory types: remember a colour, a position, a count, an order.",
                  tasks: "90 language-conditioned tasks, 10 memory types", usage: "ICLR 2026." },
                { name: "RoboMemArena", url: "https://robomemarena.github.io/leaderboard.html", mode: "Sim + real", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Very long tasks (1,000+ steps) where most sub-tasks depend on memory, with matching real-robot versions.",
                  tasks: "26" },
                { name: "RMBench", url: "https://rmbench.github.io/", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Memory-dependent manipulation tasks, used to compare which policy designs actually help memory.",
                  tasks: "Memory-dependent task suite" },
                { name: "MEMOBench", url: "https://github.com/Collab-Gen/MEMOBench", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Checks not just whether the task succeeded but whether the policy stored, updated and compressed the right memories along the way.",
                  tasks: "30, with 4,200 checkpoints", usage: "Best VLAs average 31.9%." },
                { name: "MemoryBench (SAM2Act)", url: "https://sam2act.github.io/", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Small spatial-memory tests: reopen the drawer that was open before, put the block back where it was.",
                  tasks: "3" }
              ]
            },
            {
              id: "spatial-exec",
              name: "Spatial",
              icon: "axis-3d",
              kind: "capability",
              define: "Capability board. Tasks where success depends on getting 3D positions right - where an object is, how far away, which way it faces - and then acting on them: move the camera to find a hidden object, send an exact arm pose. Answering questions about space without acting is under Embodied reasoning.",
              benchmarks: [
                { name: "VABench", url: "https://github.com/zhangzhongbo2213/VABench", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "A model learns a task from a demonstration, moves the camera to find what it cannot see, then sends exact 3D arm commands, all in closed loop on RoboTwin.",
                  tasks: "14 task families + long-horizon tracks", models: "12 model set-ups; best 53.9%", usage: "New (DUT / NTU, Sep 2026)." }
              ]
            },
            {
              id: "longhorizon",
              name: "Long-horizon and reasoning",
              icon: "route",
              kind: "capability",
              define: "Capability board. Tasks made of many sub-tasks in sequence (up to thousands of control steps), such as clearing a table and then setting it. The robot must plan the order, keep track of progress and recover when a step fails; one early mistake can ruin the rest.",
              benchmarks: [
                { name: "RoboCerebra", url: "https://robocerebra.github.io/", mode: "Sim", board: "paper", tests: "both", added: "2026-09-28",
                  plain: "Household manipulation tasks about six times longer than usual, testing whether a planner plus a policy can keep the plan on track.",
                  tasks: "100 task variants, up to 3,000 steps each", usage: "NeurIPS 2025." },
                { name: "VLABench", url: "https://vlabench.github.io/", mode: "Sim", board: "paper", tests: "both", added: "2026-09-28",
                  plain: "Language-conditioned manipulation that needs world knowledge, implicit instructions and multi-step reasoning; tests VLAs and VLM workflows.",
                  tasks: "100 task categories (60 primitive, 40 composite)" }
              ]
            },
            {
              id: "generalization",
              name: "Generalization and robustness",
              icon: "shuffle",
              kind: "capability",
              define: "Capability board. The same task repeated after changing something the policy did not see in training - object position, colour, lighting, camera angle, distractors, a new object - scored by how much success drops.",
              benchmarks: [
                { name: "The Colosseum", url: "https://robot-colosseum.github.io/", mode: "Sim + real", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Takes RLBench tasks and changes one thing at a time - colour, texture, lighting, camera, distractors - to measure how much success drops.",
                  tasks: "20 tasks x 14 perturbation types" },
                { name: "GemBench", url: "https://www.di.ens.fr/willow/research/gembench/", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Four levels of harder generalization: new placements, new rigid objects, new articulated objects, then new long tasks.",
                  tasks: "Built from 7 action primitives" }
              ]
            },
            {
              id: "deformable",
              name: "Deformable objects",
              icon: "waves",
              kind: "capability",
              define: "Capability board. Objects whose shape changes as they are handled - cloth, rope, bags, liquids - so the robot must track the object's shape, not just its position: fold a shirt, straighten a rope, pour water.",
              benchmarks: [
                { name: "GarmentLab", url: "https://garmentlab.github.io/", mode: "Sim + real", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Fold, hang, wash and dress with simulated garments, with some real-world checks.",
                  tasks: "20 in 5 groups, 11 garment types", usage: "NeurIPS 2024." },
                { name: "SoftGym", url: "https://sites.google.com/view/softgym", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Simulated rope, cloth and liquid tasks: straighten a rope, fold a cloth, pour water.",
                  tasks: "10 environments", usage: "Classic deformable-object RL benchmark." },
                { name: "RoboFolDeX", url: "https://ai.midea.com/#/fold-challenge", mode: "Real", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Long, real-world tasks with deformable objects such as folding clothes, run on physical robots.",
                  tasks: "Long-horizon deformable tasks" }
              ]
            },
            {
              id: "safety",
              name: "Safety",
              icon: "shield-alert",
              kind: "capability",
              define: "Capability board. Scores whether the robot avoids harm while working: refuses dangerous instructions, avoids collisions with people and objects, does not drop, break or spill things. Harm is counted separately from task success.",
              benchmarks: [
                { name: "RoboHarm", url: "https://robocurve.org/roboharm/", mode: "Real", board: "paper", tests: "both",
                  plain: "Real bimanual arms receive five harmful instructions (a knife near a doll, a can near a burner...); counts refusals and completed harms separately.",
                  tasks: "5 instructions, 20 trials each", models: "3 (GPT-6-Astra, Claude Fable 5.1, MolmoAct2)" },
                { name: "SafeManip", url: "https://github.com/chengyuehuang511/SafeManip", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Checks each robot rollout against safety rules over time - no collisions, stable grasps, nothing dropped or contaminated - in RoboCasa kitchens.",
                  tasks: "50", models: "6 VLA policies (pi-0, pi-0.5, GR00T and variants)" },
                { name: "MANIGUARD", url: "https://arxiv.org/abs/2608.17386", mode: "Sim + real", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Asks whether a VLA succeeded safely by its written specification, in simulation and on a real Franka.",
                  tasks: "200 base tasks, 1,000 scenarios", usage: "23,000+ rollouts in the first release." },
                { name: "IS-Bench", url: "https://github.com/AI45Lab/IS-Bench", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "VLM-driven household agents must notice risks that appear mid-task and take the right safety step at the right time.",
                  tasks: "161 scenarios, 388 risks", usage: "AAAI 2026." },
                { name: "SafeAgentBench", url: "https://safeagentbench.github.io/", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Embodied LLM agents get household tasks, some of them hazardous, and are scored on refusing or planning safely while executing in simulation.",
                  tasks: "750 across 10 hazard types", models: "9 agent baselines" }
              ]
            },
            {
              id: "tactile",
              name: "Visuo-tactile",
              icon: "fingerprint",
              kind: "capability",
              define: "Capability board. Contact-heavy tasks where vision is not enough and the robot also reads touch sensors: insert a plug, turn a screw, grip a soft object without crushing it.",
              benchmarks: [
                { name: "ManiSkill-ViTac", url: "https://ai-workshops.github.io/maniskill-vitac-challenge-2025/#leaderboard", mode: "Sim + real", board: "challenge", tests: "policy",
                  plain: "A competition on manipulation with touch sensors: tactile-only, touch plus vision, and even designing the sensor.",
                  tasks: "3 tracks" },
                { name: "ManiFeel", url: "https://zhengtongxu.github.io/manifeel-website/", mode: "Sim + real", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Compares vision-only and vision-plus-touch policies on exploring, inserting and screwing, then transfers to a real robot.",
                  tasks: "9 sim + 3 real" },
                { name: "UniVTAC", url: "https://univtac.github.io/", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "A simulation platform for three common touch sensors, with a benchmark of contact-heavy manipulation tasks.",
                  tasks: "8" },
                { name: "TacO", url: "https://arxiv.org/abs/2605.21976", mode: "Real", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Compares four kinds of touch sensor by how well a real robot policy using each one performs.",
                  tasks: "3 (unknown-mass pick-and-place, reorientation, plug insertion)" },
                { name: "SoftVTBench", url: "https://arxiv.org/abs/2608.18701", mode: "Real", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Handle soft objects without squashing them: success only counts if deformation stays within tolerance.",
                  tasks: "50+ object assets", models: "3 (Diffusion Policy, pi-0.5, Fast-WAM)" }
              ]
            }
          ]
        },
        {
          id: "driving",
          name: "Autonomous driving",
          icon: "car",
          define: "A model drives a car: perceive the road, plan a path, and control steering and speed among other road users. Driving world models, which generate driving video rather than drive, are under Supporting capabilities.",
          tasks: [
            {
              id: "e2e",
              name: "End-to-end driving",
              icon: "route",
              define: "One model goes from camera and sensor input straight to a planned trajectory or steering and speed commands, instead of separate perception and planning modules. Scored in closed-loop simulation, where the car's moves change what happens next, or on replayed real driving logs.",
              benchmarks: [
                { name: "CARLA Leaderboard", url: "https://leaderboard.carla.org/leaderboard/", mode: "Sim", board: "live", tests: "policy",
                  plain: "Drive routes in the CARLA simulator with traffic and incidents; scored on route completed minus penalties for infractions.",
                  tasks: "Routes with scripted scenarios", usage: "The long-running public driving leaderboard." },
                { name: "Bench2Drive", url: "https://thinklab-sjtu.github.io/Bench2Drive/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "Short CARLA routes, each built around one tricky situation, so skills can be scored one by one.",
                  tasks: "220 routes, 44 scenarios" },
                { name: "NAVSIM", url: "https://huggingface.co/spaces/AGC2025/e2e-driving-navhard", mode: "Sim", board: "live", tests: "policy", added: "2026-09-27",
                  plain: "Replays real driving logs and scores the planned trajectory with simulation-based metrics, graded on the operator's server.",
                  tasks: "navtest / navhard splits", usage: "Official leaderboards on Hugging Face." },
                { name: "nuPlan", url: "https://www.nuscenes.org/nuplan", mode: "Sim", board: "challenge", tests: "policy", added: "2026-09-27",
                  plain: "A planning benchmark on 1,200 hours of real driving logs, scored open-loop and closed-loop.",
                  tasks: "Scenario-based planning" },
                { name: "Waymo Open Dataset challenges", url: "https://waymo.com/open/challenges/", mode: "Offline", board: "challenge", tests: "policy", added: "2026-09-27",
                  plain: "Yearly challenges on Waymo's logs, including vision-based end-to-end driving.",
                  tasks: "Several tracks per year" }
              ]
            },
            {
              id: "realcar",
              name: "Real vehicle",
              icon: "car",
              define: "Driving a physical car instead of a simulator or replayed logs. So far only on closed test courses, with a safety driver ready to brake.",
              benchmarks: [
                { name: "DrivingBench", url: "https://drivingbench.com/", mode: "Real", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Frontier LLMs steer a real Toyota Corolla around a cone course, one command at a time, with a human ready to brake.",
                  tasks: "1 course", models: "4 (GPT-6-Astra finished; the rest did not)" }
              ]
            },
            {
              id: "ood",
              name: "OOD generalization",
              icon: "shuffle",
              kind: "capability",
              define: "Capability board. The same driving model on pairs of scenarios - one like its training data, one it has not seen (new layouts, rare objects, unusual events) - scored by how much driving quality drops.",
              benchmarks: [
                { name: "Fail2Drive", url: "https://github.com/SimonGer/fail2drive_leaderboard", mode: "Sim", board: "live", tests: "policy",
                  plain: "Pairs each normal CARLA scenario with an unfamiliar twin to see how much driving breaks outside the training distribution.",
                  tasks: "200 routes, 17 unseen scenario classes" }
              ]
            },
            {
              id: "drivesafety",
              name: "Safety-critical driving",
              icon: "shield-alert",
              kind: "capability",
              define: "Capability board. Dangerous traffic on purpose - a car cutting in, a pedestrian stepping out, sudden braking ahead - scored on avoiding collisions while still completing the route.",
              benchmarks: [
                { name: "SafeBench", url: "https://safebench.github.io/#leaderboard", mode: "Sim", board: "live", tests: "policy",
                  plain: "Throws dangerous situations at the driving model in CARLA - cut-ins, sudden pedestrians - and scores safety and driving together.",
                  tasks: "100 routes, 8 scenario types" }
              ]
            }
          ]
        },
        {
          id: "aerial",
          name: "Aerial",
          icon: "plane",
          define: "A model flies a robot, so far small drones: map a space, navigate it, find and follow a target.",
          tasks: [
            {
              id: "drones",
              name: "Drone flight",
              icon: "plane",
              define: "Indoor drone tasks: build a map of a room, work out where the drone is on it, fly to a goal, find a person and follow them.",
              benchmarks: [
                { name: "Drone-Bench", url: "https://andonlabs.com/evals/drone-bench", mode: "Sim + real", board: "live", tests: "agent", added: "2026-09-27",
                  plain: "Models write the code that flies a real Tello drone to find and follow a person in an office, scored against a human engineer.",
                  tasks: "5 (reconstruct, localise, navigate, detect, follow)" }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "design",
      name: "Design layer",
      icon: "pencil-ruler",
      gloss: "Output is a design that gets manufactured.",
      define: "The model's output is a design that will be manufactured - a CAD part, a circuit board, a chip. Scored on whether the design is valid, editable and meets the spec.",
      domains: [
        {
          id: "mechanical",
          name: "Mechanical design",
          icon: "drafting-compass",
          define: "Mechanical parts and assemblies defined in CAD, to be machined, 3D-printed or moulded.",
          tasks: [
            {
              id: "cad",
              name: "CAD generation and editing",
              icon: "box",
              define: "Input: text, an engineering drawing, an image or a point cloud - or an existing model plus an edit request. Output: an editable (parametric) CAD model, or the code that builds it. Checked by building the part in a CAD kernel and comparing its geometry and dimensions with a reference.",
              benchmarks: [
                { name: "BenchCAD", url: "https://benchcad.com/leaderboard", mode: "Offline", board: "live", tests: "agent",
                  plain: "Models write CAD code for industrial parts, answer questions about them and edit them; the generated part is built and compared to the reference.",
                  tasks: "17,900 parts in 106 families; 4 leaderboard tasks", usage: "OpenAI and Anthropic quote it in model launches." },
                { name: "Parametric CAD Bench", url: "https://cadbench.ai/leaderboard", mode: "Offline", board: "live", tests: "agent",
                  plain: "Build a specified part in FreeCAD; geometry and every stated dimension are checked separately.",
                  tasks: "100 held-out tasks (v2)" },
                { name: "CAD Arena", url: "https://normal.ai/leaderboard/cad-arena", mode: "Offline", board: "live", tests: "agent",
                  plain: "Agents rebuild real engineering drawings natively in five commercial CAD tools; scored on geometry and on whether the model stays editable.",
                  tasks: "18 drawings x 5 CAD platforms", models: "12 (Sep 2026)" },
                { name: "neuralCAD-Edit", url: "https://autodeskailab.github.io/neuralCAD-Edit/", mode: "Offline", board: "live", tests: "agent",
                  plain: "Carry out designers' edit requests on existing CAD models, judged against edits made by experts (Autodesk Research).",
                  tasks: "192 requests, 384 expert edits" },
                { name: "CADBench", url: "https://anniedoris.github.io/CADBench/#Leaderboard", mode: "Offline", board: "live", tests: "agent",
                  plain: "Rebuild CAD models from different kinds of input - images, point clouds, text - at large scale (MIT).",
                  tasks: "18,000 samples, 6 families, 5 input types" },
                { name: "CadQueryEval", url: "https://danwahl.net/cadqueryeval/", mode: "Offline", board: "live", tests: "agent", added: "2026-09-27",
                  plain: "Turn a plain-language description into CadQuery code; the part is built and checked against a reference mesh.",
                  tasks: "25", models: "90" },
                { name: "Text2CAD", url: "https://sadilkhan.github.io/text2cad-project/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Generate a CAD construction sequence from text written at four levels, from beginner to expert.",
                  tasks: "Large text-to-CAD dataset", usage: "NeurIPS 2024." }
              ]
            },
            {
              id: "engineering",
              name: "Constrained engineering design",
              icon: "cog",
              define: "The design must meet functional requirements, not just match a shape: stay within load, weight and size limits, fit into an assembly, and pass a physics simulation.",
              benchmarks: [
                { name: "Bike-Bench", url: "https://decode.mit.edu/projects/bikebench/", mode: "Offline", board: "paper", tests: "both",
                  plain: "Design a bicycle frame that is valid, meets engineering targets and satisfies the constraints (MIT).",
                  tasks: "Parametric bike design" },
                { name: "CADEngBench", url: "https://arxiv.org/abs/2608.09296", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Asks whether generated CAD actually works: parametric design, assembly reasoning and a physics simulation of the result.",
                  tasks: "Design, assembly and simulation tasks" }
              ]
            }
          ]
        },
        {
          id: "electronics",
          name: "Electronics design",
          icon: "circuit-board",
          define: "Circuit boards and chips: lay out a printed circuit board, or write the hardware description code a chip is made from.",
          tasks: [
            {
              id: "pcb",
              name: "Printed circuit boards",
              icon: "circuit-board",
              define: "Given a circuit's list of components and connections, place the components on the board and route the copper traces between them so the board passes design-rule checks (spacing, trace width, no shorts).",
              benchmarks: [
                { name: "OmniLayout", url: "https://www.omnieda.com/#leaderboard", mode: "Offline", board: "live", tests: "both",
                  plain: "Place the components on a circuit board so it can be wired well; scored on geometry, routability and connections.",
                  tasks: "1,681 layouts, 77K placements" },
                { name: "OmniRouting", url: "https://www.omnieda.com/routing/#leaderboard", mode: "Offline", board: "live", tests: "both",
                  plain: "Draw the wires and vias between components so the board passes design-rule checks, in one shot or step by step.",
                  tasks: "1,681 designs" }
              ]
            },
            {
              id: "rtl",
              name: "Chip design (RTL)",
              icon: "cpu",
              define: "Given a plain-language spec, write the hardware description code (Verilog RTL) for a digital circuit. Checked by simulation against test benches; some boards also check power, performance and area.",
              benchmarks: [
                { name: "VerilogEval", url: "https://github.com/NVlabs/verilog-eval", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Write Verilog from a plain-language description; checked by simulation (NVIDIA).",
                  tasks: "Spec-to-RTL problems" },
                { name: "RTLLM", url: "https://github.com/hkust-zhiyao/RTLLM", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Generate RTL for complete designs; checked for syntax, function and power-performance-area (HKUST).",
                  tasks: "Design-level RTL tasks" }
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
      gloss: "Output is an answer or a generated video. Listed, not in the ranking.",
      define: "The model's output is an answer about the physical world (embodied reasoning) or a generated video of it (world models). Nothing moves and nothing gets manufactured, so these boards are listed but left out of the model ranking. They are here because they test abilities that robots and cars rely on: seeing space, predicting physics, spotting danger.",
      domains: [
        {
          id: "reasoning",
          name: "Embodied reasoning",
          icon: "brain",
          define: "Answering questions about 3D scenes, physics and safety from images or video. The model answers; no action is taken - which is why these boards sit here and not under Robotics.",
          tasks: [
            {
              id: "spatial",
              name: "Spatial, physical and safety QA",
              icon: "axis-3d",
              define: "Questions about space (where, how far, what fits), physics (what happens next) and risk (would this hurt someone), answered in text or by pointing at the image.",
              benchmarks: [
                { name: "ERQA", url: "https://github.com/embodiedreasoning/ERQA", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Multiple-choice questions about robot scenes - where things are, what will happen, what to grasp - released with Gemini Robotics.",
                  tasks: "Embodied-reasoning question set" },
                { name: "RoboSpatial", url: "https://chanh.ee/RoboSpatial/", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Questions about spatial relations from a robot's viewpoint: left of, in front of, fits in, can be placed on.",
                  tasks: "Large-scale spatial QA from images and 3D scans" },
                { name: "VSI-Bench", url: "https://vision-x-nyu.github.io/thinking-in-space.github.io/", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Watch a video walk-through of a room, then answer questions about distances, sizes and layout.",
                  tasks: "Video-based spatial QA" },
                { name: "MV-RoboBench", url: "https://aaronfengzy.github.io/MV-RoboBench-Webpage/", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Combine several camera views of a robot scene to answer spatial questions.",
                  tasks: "1.7K questions, 8 sub-tasks" },
                { name: "Embodied3DBench", url: "https://arxiv.org/abs/2605.29074", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Questions about 3D structure and where to interact - grasp points, motion paths - answered in text.",
                  tasks: "21K QA pairs, 12 sub-categories" },
                { name: "PhysBench", url: "https://physbench.github.io/#leaderboard", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Questions on physical properties, relations and dynamics from images and video.",
                  tasks: "10,002 entries" },
                { name: "ASIMOV", url: "https://asimov-benchmark.github.io", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "Would this action hurt someone? Safety questions for robot foundation models from images, text and video (Google DeepMind). The model answers; it does not act.",
                  tasks: "Injury, constraint and video subsets" }
              ]
            }
          ]
        },
        {
          id: "world",
          name: "World models",
          icon: "globe",
          define: "Models that generate or predict how the world will look next - video, 3D scenes, driving scenes - judged on realism, physics, or usefulness to a robot.",
          tasks: [
            {
              id: "videophysics",
              name: "Video generation and physics",
              icon: "activity",
              define: "Text or an image in, video out. Judged on visual quality, following the prompt, and whether the motion obeys physics - gravity, collisions, fluids.",
              benchmarks: [
                { name: "VBench", url: "https://huggingface.co/spaces/Vchitect/VBench_Leaderboard", mode: "Offline", board: "live", tests: "policy", added: "2026-09-28",
                  plain: "Scores generated video on 16 separate dimensions - subject consistency, motion smoothness, aesthetics, following the prompt and more - instead of one number.",
                  tasks: "16 dimensions", usage: "The standard evaluation suite for video generation models; “VBench 1.0” tab of the leaderboard." },
                { name: "VBench-2.0", url: "https://huggingface.co/spaces/Vchitect/VBench_Leaderboard", mode: "Offline", board: "live", tests: "policy", added: "2026-09-28",
                  plain: "Asks whether generated video is not just good-looking but faithful: 18 dimensions grouped into human fidelity, controllability, creativity, physics and commonsense.",
                  tasks: "18 dimensions in 5 groups", usage: "“VBench 2.0” tab of the same leaderboard." },
                { name: "Physics-IQ", url: "https://physics-iq.github.io/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Given the start of a real physics video, does the model predict what really happens next - in mechanics, fluids, optics, heat and magnetism?",
                  tasks: "5 physics domains", usage: "Google DeepMind and INSAIT." },
                { name: "VideoPhy-2", url: "https://videophy2.github.io/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Generated videos of everyday actions, judged on whether they follow physical commonsense.",
                  tasks: "Action-centric prompts" },
                { name: "PhyGenBench", url: "https://phygenbench123.github.io/#leaderboard", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Text prompts that each test one physical law, to see whether text-to-video models get the physics right.",
                  tasks: "Prompts over 27 physical laws, 4 domains" },
                { name: "WorldModelBench", url: "https://worldmodelbench.github.io/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Judges video models as world models across application domains, checking instruction following and five physical laws.",
                  tasks: "7 domains" },
                { name: "WM-ABench", url: "https://wm-abench.maitrix.org/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Atomic tests of world-model abilities using controlled counterfactual simulations.",
                  tasks: "Atomic perception and prediction tests" },
                { name: "WorldScore", url: "https://huggingface.co/spaces/Howieeeee/WorldScore_Leaderboard", mode: "Offline", board: "live", tests: "policy", added: "2026-09-27",
                  plain: "Scores 3D, 4D and video world generation on the same next-scene tasks: controllability, quality, dynamics (Stanford).",
                  tasks: "Next-scene generation sequences" },
                { name: "PAI-Bench", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard", mode: "Offline", board: "live", tests: "policy",
                  plain: "Video generation and understanding for physical-AI domains: driving, robotics, industrial and egocentric scenes.",
                  tasks: "4 domains" }
              ]
            },
            {
              id: "interactive",
              name: "Interactive and embodied world models",
              icon: "bot",
              define: "Predicting what a camera or robot will see next as actions come in - judged on realism, controllability, or on whether a robot can plan with it.",
              benchmarks: [
                { name: "WorldArena", url: "https://huggingface.co/spaces/WorldArena/WorldArena", mode: "Offline", board: "live", tests: "policy",
                  plain: "Embodied world models judged both on how real their predictions look and on how useful they are for downstream robot tasks.",
                  tasks: "Perception and functional-utility tests" },
                { name: "World-in-World", url: "https://world-in-world.github.io/subpages/leaderboard.html", mode: "Sim", board: "live", tests: "policy", added: "2026-09-28",
                  plain: "Plugs a world model into an agent's planning loop and scores it by whether the agent completes the task - not by how nice the video looks.",
                  tasks: "4 closed-loop tasks" },
                { name: "EWMBench", url: "https://github.com/AgibotTech/EWMBench", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Robot-manipulation videos generated from language, scored on scene consistency, motion correctness and matching the instruction (AgiBot).",
                  tasks: "Robot manipulation video prompts" },
                { name: "1X World Model Challenge", url: "https://github.com/1x-technologies/1xgpt", mode: "Offline", board: "challenge", tests: "policy", added: "2026-09-28",
                  plain: "Predict what 1X's EVE humanoid will see next from its own logged data.",
                  tasks: "Future-frame prediction" },
                { name: "WBench", url: "https://meituan-longcat.github.io/WBench/#leaderboard", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Multi-turn interaction with a video world model - move, act, edit events, switch view - scored on quality, following the input, consistency and physics.",
                  tasks: "289 cases, 1,058 turns", models: "20" }
              ]
            },
            {
              id: "drivingworld",
              name: "Driving world models",
              icon: "car",
              define: "Generated driving scenes, scored for realism, geometry, physics and usefulness downstream - not for driving. What is scored is video, so it sits here, not under Autonomous driving.",
              benchmarks: [
                { name: "WorldLens", url: "https://huggingface.co/spaces/worldbench/WorldLens", mode: "Offline", board: "live", tests: "policy", added: "2026-09-28",
                  plain: "Driving world models scored on generation, 3D reconstruction, following actions, usefulness for downstream driving tasks and human preference.",
                  tasks: "5 evaluation aspects", models: "10 in the paper; open leaderboard", usage: "CVPR 2026 oral." }
              ]
            }
          ]
        }
      ]
    }
  ]
};
