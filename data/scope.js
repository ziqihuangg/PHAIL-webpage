/* =============================================================================
   PhAIL - scope of physical AI (data only; js/pages/scope.js draws it)
   -----------------------------------------------------------------------------
   Last updated: 2026-10-06

   Placement rule - by what the benchmark SCORES:
     execution  an action carried out in the world (robot, car, drone)
     design     a design that gets manufactured (part, assembly, board, chip)
     support    an answer or a generated video about the physical world
                (embodied reasoning, video world models), or the commands of a
                general model (LLM, VLM) that a simulator or a fixed
                controller carries out - no trained robot policy is tested.
                Shown as "Supporting capabilities", flagged `boundary: true`,
                kept out of the ranking.
   So a driving world model (WorldLens) sits under Supporting capabilities even
   though its domain is driving, and so do EmbodiedBench and VABench even
   though their agents act in a simulator: they test no policy.

   Robotics is split in two steps. First by what the TASK needs: manipulation
   with the base fixed, manipulation with the base moving, or moving without
   manipulating (Navigation). A robot parked at a table doing pick-and-place
   is fixed-base, whatever its body. Then fixed-base tasks by three checks in
   order - industrial (scored like a production line), dexterous (written for
   a hand with fingers), table-top (the rest) - and moving-base tasks by
   EMBODIMENT: wheels (mobile manipulation) or legs (loco-manipulation).
   Task nodes carry `group` ("fixed" | "moving" | "capability"), named in the
   domain's `groups`; Navigation has none. Capability boards (kind:
   "capability", drawn dashed) come last, grouped under "Capability boards",
   each isolating one capability with tasks from any category.

   Boards that span categories: a board whose sub-benchmarks are scored
   separately and fall in different categories is listed once per part
   (`part` names it; every count counts the board once). Any other board sits
   where most of its tasks are, and `placed` says so.

   Tree: layer > domain > task > benchmarks. Every node has `define`, the
   plain-language definition shown on hover. Every count on the page is
   computed from this file when it loads.

   Benchmark fields
     url     the page hosting the live leaderboard where there is one; else the
             project page; arXiv / GitHub only when nothing else exists
     mode    "Sim" | "Real" | "Sim + real" | "Offline" (no closed loop)
     board   "live" | "challenge" | "paper" | "archived"   (js/pages/scope.js explains each)
     tests   "policy" | "agent" | "both"
     plain   one plain-English sentence: what the robot / model has to do
     tasks   size of the task set, as the authors count it
     models  how many models the board or paper compares, when stated
     usage   where it shows up, when that is useful to know
     ledger  benchmark id in data/ledger.js when we transcribe its numbers
     flag    "saturated" when the best published result is above ~95%
     part    the sub-benchmark(s) this entry covers, when a board is split
     placed  why a board that spans categories sits here (shown on hover)
     added   date we added it beyond the team's first list (2026-09-19)

   metrics: how boards score, one row per scoring method. `usedIn` names
   boards exactly as this file does; the page flags any name it cannot find.
   `link` is [label, href] for a page with more detail.
   ========================================================================== */

window.phailScope = {
  updated: "2026-10-06",

  metrics: [
    { name: "Binary success rate", usedIn: ["Meta-World", "RLBench", "LIBERO", "RoboTwin 2.0", "ManiSkill3"],
      measures: "Did the task complete?", limit: "Coarse - hides near-misses, smoothness, safety" },
    { name: "Chain / sequential success rate", usedIn: ["CALVIN"],
      measures: "Average consecutive subtasks completed (0-5)", limit: "Only for explicitly chained task designs" },
    { name: "Partial-completion / progress score", usedIn: ["RoboChallenge", "BEHAVIOR-1K", "RoboDojo", "WEB-1K (RSS 2026 challenge)"],
      measures: "Credit for partial progress, not just pass/fail", limit: "Scoring rubric differs per benchmark" },
    { name: "Success-rate drop under perturbation", usedIn: ["The Colosseum"],
      measures: "Robustness across 14 environment-perturbation axes", limit: "Measures robustness, not raw capability" },
    { name: "Sim-real correlation (Pearson / MMRV)", usedIn: ["SimplerEnv"],
      measures: "Whether sim ranking predicts real-robot ranking", limit: "Does not score capability directly" },
    { name: "Pairwise preference / Elo", usedIn: ["RoboArena"],
      measures: "Head-to-head human preference across policies. Only gaps mean anything: 100 points higher = preferred in about 64% of head-to-heads, 400 points = 10 to 1",
      link: ["details", "robotics-index.html#method"], limit: "Expensive, hard to scale, no absolute success number" },
    { name: "Lifelong-learning transfer (FWT / NBT / AUC)", usedIn: ["LIBERO"],
      measures: "Transfer over a task sequence", limit: "Specific to continual-learning setups" },
    { name: "Throughput (units/hour) + MTBF", usedIn: ["PhAIL (Positronic)"],
      measures: "Industrial productivity and reliability", limit: "Economic metrics remain rare in real-world evaluation" }
  ],
  metricsMissing: "Not yet standardized: cost per successful rollout, longitudinal reliability drift, contamination auditing, safety incidents, and robustness to ambiguous instructions.",

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
          define: "A model controls a robot to get a physical job done. Split first by what the task needs: manipulation with the base fixed, manipulation with the base moving, or moving without manipulating. A robot parked at a table doing pick-and-place is fixed-base, whatever its body. Moving-base tasks are then split by what moves the robot: wheels or legs. A board whose separately scored sub-benchmarks fall in different categories is listed under each. Boards that test only general models (LLMs, VLMs), with no trained policy, sit under Supporting capabilities. Last come the capability boards (dashed, grouped): each tests one capability, such as memory or safety, using tasks from any category.",
          groups: [
            { id: "fixed", name: "Fixed-base manipulation",
              define: "The robot manipulates without moving its base: everything is within reach of where it stands. A board is checked in this order: industrial (scored like a production line), then dexterous (its tasks are written for a hand with fingers), then table-top for the rest." },
            { id: "moving", name: "Moving-base manipulation",
              define: "The robot has to move to other places and manipulate things there. Split by what moves it: wheels (mobile manipulation) or legs (loco-manipulation)." },
            { id: "capability", name: "Capability boards", kind: "capability",
              define: "Boards that each isolate one capability - memory, long-horizon planning, generalization, deformable objects, safety, touch - using tasks from any category above, so a result says how well a model does that one thing." }
          ],
          tasks: [
            {
              id: "tabletop",
              name: "Table-top manipulation",
              icon: "box",
              group: "fixed",
              define: "Fixed-base tasks at one work surface, scored per trial: pick and place, stack, pour, open a drawer, insert a peg. One-arm and two-arm set-ups both count - the task decides the category, not the number of arms. Everything fixed-base that is neither industrial nor dexterous; the most measured category in physical AI.",
              benchmarks: [
                { name: "RoboDojo", url: "https://robodojo-benchmark.com/leaderboard", mode: "Sim + real", board: "live", tests: "both", ledger: "robodojo_sim",
                  plain: "Two-armed robots do everyday table-top jobs, once in simulation and once on real arms, with five skills scored separately: generalization, precision, long-horizon, memory, open instructions.",
                  tasks: "42 sim + 18 real", models: "48 sim, 11 real (Sep 2026)", usage: "The widest public VLA board in 2026; also ranks frontier LLMs through a harness." },
                { name: "RoboChallenge", url: "https://robochallenge.ai/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "robochallenge",
                  plain: "Teams upload a policy; the operator runs it on its own real robots (UR5, Franka, ARX5, ALOHA) and publishes success and progress scores.",
                  tasks: "30 per table (Table30, Table30-v2)", models: "22 entries on Table30, 53 on Table30-v2 (29 Sep 2026)", usage: "The main real-robot board where outside teams submit. Also ran a CVPR 2026 competition on a Table30-v2 variant (in the Ledger, not the index) and is building an Isaac Lab simulation of Table30-v2 with Lightwheel, Dexmal and NVIDIA." },
                { name: "RoboArena", url: "https://robo-arena.github.io/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "roboarena",
                  plain: "Evaluators at eight universities pick their own task, run two anonymous policies on a DROID robot and say which did better; the votes become a ranking.",
                  tasks: "Open - evaluators choose", models: "9 policies on the public board", usage: "Crowd-sourced, like Chatbot Arena for robots; no success rate by design." },
                { name: "RoboTwin 2.0", url: "https://robotwin-platform.github.io/leaderboard", mode: "Sim", board: "live", tests: "policy", ledger: "robotwin", added: "2026-09-27",
                  plain: "Dual-arm tasks in simulation, tested on clean scenes and again on randomised ones; the drop between the two is the point.",
                  tasks: "50", models: "20 on the board", usage: "Standard dual-arm board; listing needs public code and weights. Also ran the RoboTwin Dual-Arm Collaboration Challenge at CVPR 2025: 17 tasks, two simulation rounds, then a final round on real AgileX COBOT-Magic arms." },
                { name: "PAW-GEN-10", url: "https://pokeandwiggle.com/leaderboard", mode: "Real", board: "live", tests: "policy", ledger: "paw_gen_10", added: "2026-09-30",
                  plain: "Two real Franka FR3 arms at one station do 10 workshop jobs - sort screws, plug in a DC jack, route a cable through hoops, open a toolbox with a screwdriver. The operator fine-tunes every model itself on ~10, ~100 and ~300 demonstrations and tests on seen and unseen object placements.",
                  tasks: "10 environments, 5 of them held out", models: "4 (Sep 2026); best 28% success", usage: "Poke & Wiggle's Reality Check board; also reports speed, smoothness, contact force and safe failures." },
                { name: "WEB-1K (RSS 2026 challenge)", url: "https://posttraining-for-robotics.github.io/#challenge-leaderboard", mode: "Real", board: "challenge", tests: "policy", ledger: "web1k_rss26", added: "2026-10-06",
                  plain: "Two real YAM arms at a table put a battery into a mouse, play a two-ring Tower of Hanoi and cap and tighten a bottle. Teams train offline on expert demos plus a pi-0.5 baseline's failed and human-corrected rollouts; the organisers run every policy on their own robots and score progress per step and success.",
                  tasks: "3, taken from WEB-1K's 90 recorded tasks", models: "19 teams single-task, 20 multi-task; best 76.7% and 66.7% average success", usage: "Post-Training for Robotics Foundation Models workshop, RSS 2026 (WorldEngine AI, USC). WEB-1K itself is a dataset: 923 h, 50,266 bimanual episodes, gated on Hugging Face; arXiv not out. Phase 2 lets the top 3 teams post-train on their own rollouts for 3 rounds. Phase 1, both tracks, is in the Ledger, not in the index." },
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
                  tasks: "Dozens of families", usage: "Common for RL at scale.",
                  placed: "Most of its tasks are table-top. Its home tasks have their own entry, ManiSkill-HAB (Mobile manipulation); its humanoid and dexterous-hand families are not scored as separate benchmarks." },
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
              id: "dexterous",
              name: "Dexterous manipulation",
              icon: "hand",
              group: "fixed",
              define: "Fixed-base tasks written for a hand with several fingers: turn an object within the hand, use a tool, press piano keys, open a faucet. A parallel gripper cannot do them; a task a gripper could also do stays table-top, even when a hand does it.",
              benchmarks: [
                {"name": "Shadow Hand (Gymnasium)", "url": "https://robotics.farama.org/envs/shadow_dexterous_hand/", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Fingertip reaching and in-hand block, egg and pen manipulation; dense/sparse and goal variants.", "tasks": "Goal-conditioned hand environment family", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "DexMimicGen", "url": "https://dexmimicgen.github.io/", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Nine bimanual task families with coordination, sequential manipulation and precision; robot/task variants expand the evaluation.", "tasks": "6 hand tasks of 9 total", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms.", "part": "Dexterous-hand tracks", "placed": "The other 3 tasks use parallel grippers; the humanoid hand track is fixed-base manipulation, not walking."},
                {"name": "DexJoCo", "url": "https://dexjoco.github.io/", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "11 functional tasks: tool use, reasoning, bimanual coordination and long-horizon execution.", "tasks": "11", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "DexVerse", "url": "https://arxiv.org/html/2607.08751v1", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "100 task definitions; experiments on 19. Grasp/relocate, articulation, tools, non-prehensile, precision and bimanual skills.", "tasks": "100 definitions; 19 evaluated", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "Bench2Dex", "url": "https://bench2dex.github.io/", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "26 bimanual tasks: tools/devices, articulated objects and multi-stage manipulation; seven robustness perturbations.", "tasks": "26", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "DexGraspBench", "url": "https://github.com/JYChen18/DexGraspBench", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Grasp-pose/trajectory replay, lifting, force closure, penetration and diversity. Grasp synthesis evaluation, not long-horizon control.", "tasks": "Grasp synthesis and lifting evaluation", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "DexGraspNet 2.0", "url": "https://arxiv.org/abs/2410.23004", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Cluttered dexterous grasp proposal from single-view depth, followed by simulated lifting.", "tasks": "Cluttered grasping; 8,270 scene arrangements", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
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
                  tasks: "Songs from a 150-piece repertoire", usage: "Frontier models now write controllers for it." }
              ]
            },
            {
              id: "industrial",
              name: "Industrial production runs",
              icon: "factory",
              group: "fixed",
              define: "Placed by how it is scored: the same job repeated on a real robot for hours, as on a production line, and scored on throughput and reliability - units per hour, time between failures - rather than success on a few trials. The same bin-to-bin picking scored per trial would be table-top.",
              benchmarks: [
                { name: "PhAIL (Positronic)", url: "https://phail.ai/", mode: "Real", board: "live", tests: "policy", added: "2026-09-27",
                  plain: "A real Franka arm moves items from bin to bin for as long as it can; scored like a production line. Unrelated to this site despite the name.",
                  tasks: "1", models: "4" }
              ]
            },
            {
              id: "mobile",
              name: "Mobile manipulation",
              icon: "mobile-manipulator",
              group: "moving",
              define: "Moving-base tasks on wheels: the robot drives between places and manipulates things there - fetch a mug from the kitchen, tidy a room, restock a shelf. A wheeled base with one or two arms (Stretch, Fetch), or a humanoid upper body on wheels.",
              benchmarks: [
                {"name": "RoboCasa365", "url": "https://robocasa.ai/leaderboard.html", "mode": "Sim", "board": "live", "tests": "policy", "plain": "365 kitchen tasks: 65 atomic plus composite tasks. Public multi-task board evaluates 50 tasks in three splits.", "tasks": "365 library tasks; 50 on the board", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms.", "models": "14 entries (23 Sep 2026)"},
                {"name": "MoMaGen", "url": "https://arxiv.org/html/2510.18316v1", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Four household tasks: Pick Cup, Tidy Table, Put Dishes Away, Clean Frying Pan; three randomization levels.", "tasks": "4", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "MoMani / EchoVLA", "url": "https://arxiv.org/html/2511.18112v2", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Four RoboCasa manipulation tasks with distant starts / follow-up navigation, plus navigation-only tests; real mobile tasks separately.", "tasks": "4 simulation tasks", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                { name: "BEHAVIOR-1K", url: "https://huggingface.co/spaces/behavior-1k/2026-challenge-leaderboard", mode: "Sim", board: "challenge", tests: "policy",
                  plain: "Everyday household activities - cleaning, cooking, tidying - done by a simulated mobile robot in realistic homes.",
                  tasks: "1,000 library activities / 50 scenes; 2026 challenge: 100 tasks / 7 scenes", usage: "2026 challenge uses R1Pro; starter baselines: π0.5 and GR00T N1.7." },
                { name: "RoboCasa", url: "https://arxiv.org/abs/2406.02523", mode: "Sim", board: "paper", tests: "policy", ledger: "robocasa", added: "2026-09-27",
                  plain: "A simulated mobile manipulator works in many generated kitchens: opening doors, moving food, using appliances.",
                  tasks: "100 (original suite)", usage: "Original RoboCasa; GR00T and other policies also report on a 24-task subset. RoboCasa365 and its 50-task board are listed separately." },
                { name: "HomeRobot OVMM", url: "https://ovmm.github.io/", mode: "Sim + real", board: "challenge", tests: "policy",
                  plain: "Find any named object in an unfamiliar home, pick it up and put it somewhere else.",
                  tasks: "Open-vocabulary pick-and-place, 50 scenes", usage: "Ran as a NeurIPS challenge." },
                { name: "Habitat 2.0 HAB", url: "https://aihabitat.org/docs/habitat2/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A simulated home robot tidies the house, puts away groceries and sets the table.",
                  tasks: "3 composite tasks" },
                { name: "ManiSkill-HAB", url: "https://maniskill.readthedocs.io/en/latest/tasks/external/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "The three Habitat home tasks rebuilt for GPU manipulation training; sequential evaluation can use teleport navigation.",
                  tasks: "3 composite tasks" },
                { name: "M3Bench", url: "https://zeyuzhang.com/papers/m3bench", mode: "Sim", board: "paper", tests: "policy", added: "2026-09-30",
                  plain: "Given a 3D home scene, a wheeled robot with an arm must plan one whole-body motion - base and arm together - to pick up or place an object; the motion is checked in physics simulation.",
                  tasks: "30,000 in 119 scenes" },
                { name: "RoboChallenge ICRA 2026", url: "https://robochallenge.ai/competition/icra", mode: "Real", board: "challenge", tests: "policy", ledger: "robochallenge_icra26", added: "2026-09-29",
                  plain: "Real AgiBot G2 robots (two arms on a wheeled base) in a supermarket scene follow instructions to navigate, pick up and load goods and restock shelves; a whole-body-control track run with Dexmal.",
                  tasks: "2 (weighted 0.4 and 0.6)", models: "11 teams; best 94% success", usage: "Closed 28 May 2026. In the Ledger, not in the index: 2 tasks, and its entrants are on no other board." }
              ]
            },
            {
              id: "loco",
              name: "Loco-manipulation",
              icon: "person-standing",
              group: "moving",
              define: "Moving-base tasks on legs: humanoids, and legged robots with an arm. Walking and manipulating often happen at once - carry a box while walking, push a cart, lift from the floor - so the robot must keep its balance while in contact with objects.",
              benchmarks: [
                {"name": "HumanoidArena", "url": "https://arxiv.org/html/2606.17833v1", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Seven leg-critical human–object / human–scene interaction tasks; balance, posture, foot placement and whole-body reorientation.", "tasks": "7", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                {"name": "FetchMan-Bench", "url": "https://arxiv.org/html/2608.17027v1", "mode": "Sim", "board": "paper", "tests": "policy", "plain": "Reach-and-pick; separate terminal manipulation and full locomotion-to-grasp success. 100 held-out initializations.", "tasks": "Reach-and-pick; 100 evaluation initializations", "added": "2026-09-30", "usage": "Detailed robots, evaluated models, assets and sources: Internal Work in Progress → Mobile Manipulation Platforms."},
                { name: "HumanoidBench", url: "https://humanoid-bench.github.io/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A simulated humanoid walks, balances and uses both hands on whole-body tasks.",
                  tasks: "27 (12 locomotion, 15 manipulation)",
                  placed: "Listed here for its 15 whole-body manipulation tasks. Its 12 locomotion-only tasks (walk, run, climb stairs...) have no category yet: Navigation is about reaching a goal." },
                { name: "SIMPLE", url: "https://psi-lab.ai/SIMPLE/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "Whole-body humanoid tasks in indoor scenes, built to train and evaluate humanoid policies in simulation.",
                  tasks: "60 designed tasks / 50 scenes; preliminary model table: 6 tasks" },
                { name: "GRBench (GRUtopia)", part: "Loco-Manipulation", url: "https://github.com/OpenRobotLab/GRUtopia", mode: "Sim", board: "paper", tests: "policy",
                  plain: "An AlienGo quadruped with a Z1 arm navigates to objects and rearranges them; high-level agents use supplied control APIs.",
                  tasks: "300 episodes (100 validation / 200 test); 1 of 3 tracks",
                  placed: "GRBench's other two benchmarks, Object and Social Loco-Navigation, sit under Navigation." },
                { name: "HumanoidMimicGen G1", url: "https://humanoidmimicgen.github.io/", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A Unitree G1 humanoid does factory-style jobs: lifting, pushing, shelving, walking around obstacles.",
                  tasks: "9" }
              ]
            },
            {
              id: "navigation",
              name: "Navigation",
              icon: "compass",
              define: "Tasks where the job is to move the robot itself to a goal: reach a point on a map, find a named object, or follow spoken route directions. Nothing is manipulated. Wheeled and legged robots both count.",
              benchmarks: [
                { name: "Habitat", url: "https://aihabitat.org/challenge/2023/", mode: "Sim", board: "challenge", tests: "policy",
                  plain: "A simulated robot finds a point or a named object in scanned real homes.",
                  tasks: "Point-goal and object-goal navigation", usage: "Annual Habitat challenge." },
                { name: "VLN-CE (R2R-CE)", url: "https://eval.ai/web/challenges/challenge-page/719/leaderboard", mode: "Sim", board: "live", tests: "both", added: "2026-09-27",
                  plain: "Follow spoken-style route directions (“go past the sofa, turn left…”) through 3D homes, moving freely rather than hopping between fixed points.",
                  tasks: "Room-to-Room instructions in continuous space" },
                { name: "Quadruped VLN 2026", url: "https://robochallenge.ai/competition/quadruped-vln", mode: "Real", board: "challenge", tests: "policy", added: "2026-09-29",
                  plain: "Quadruped robots follow language instructions over rough terrain - stairs, narrow passages, low openings, stepping stones, gullies - choosing footholds and gaits as well as the route.",
                  tasks: "12 tracks: 10 single-skill, 2 combined long-horizon", usage: "Tsinghua EE on RoboChallenge; first season not started (Sep 2026)." },
                { name: "GRBench (GRUtopia)", part: "Object and Social Loco-Navigation", url: "https://github.com/OpenRobotLab/GRUtopia", mode: "Sim", board: "paper", tests: "policy",
                  plain: "A simulated humanoid walks through large city-scale scenes to find a named object, or asks the people there for directions.",
                  tasks: "2 of 3 benchmarks",
                  placed: "GRBench's third benchmark, Loco-Manipulation, sits under Loco-manipulation." }
              ]
            },
            {
              id: "memory",
              name: "Memory",
              icon: "history",
              group: "capability",
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
              id: "longhorizon",
              name: "Long-horizon and reasoning",
              icon: "route",
              group: "capability",
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
              group: "capability",
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
              group: "capability",
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
              group: "capability",
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
                  tasks: "200 base tasks, 1,000 scenarios", usage: "23,000+ rollouts in the first release." }
              ]
            },
            {
              id: "tactile",
              name: "Visuo-tactile",
              icon: "fingerprint",
              group: "capability",
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
          define: "A model drives a car: perceive the road, plan a path, and control steering and speed among other road users. Driving world models, which generate driving video rather than drive, are under Supporting capabilities › Video world models.",
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
          define: "A model designs mechanical parts and assemblies that will be machined, 3D-printed or moulded - mostly as CAD models, sometimes as a product's design parameters. Split by task category, as in Robotics; the dashed node checks whether a design physically works. Circuit boards and chips are under Electronics design.",
          tasks: [
            {
              id: "cad-part",
              name: "CAD part generation",
              icon: "box",
              define: "Create one part from text, an engineering drawing, an image or a point cloud. Output: an editable (parametric) CAD model, or the code that builds it. Checked by building the part in a CAD kernel and comparing its geometry and dimensions with a reference. The most measured mechanical task, and the closest to saturated: narrow protocols are near full marks.",
              benchmarks: [
                { name: "BenchCAD", url: "https://benchcad.com/leaderboard", mode: "Offline", board: "live", tests: "agent", ledger: "benchcad", part: "Vision2Code and the two QA tasks",
                  plain: "Models turn four views of an industrial part into CadQuery code, in one shot or with a Python sandbox, and answer questions about the part; the generated part is built and compared with the reference. BenchCAD 2.0 (preview, no scores yet) adds assembly drawings and circuit boards.",
                  tasks: "17,900 parts in 106 families; 4 leaderboard tasks", usage: "OpenAI and Anthropic quote it in model launches; most frontier rows on the board are vendor-reported." },
                { name: "CADGenBench", url: "https://huggingface.co/spaces/HuggingAI4Engineering/CADGenBench", mode: "Offline", board: "live", tests: "agent", ledger: "cadgenbench", part: "Generation", added: "2026-10-07",
                  plain: "From one A2 engineering drawing with no dimensions in text, build the part as a STEP model; scored on shape, on hand-drawn keep-in and keep-out volumes (does the bolt still pass) and on topology. Anyone can submit; the organisers validate some runs by hand.",
                  tasks: "49 generation + 32 editing fixtures", models: "25 validated runs, about 600 not validated (Oct 2026)", usage: "Hugging Face's board; most runs are submitters' own harnesses around a frontier model, plus CAD products." },
                { name: "Parametric CAD Bench", url: "https://cadbench.ai/leaderboard", mode: "Offline", board: "live", tests: "agent", ledger: "paramcad",
                  plain: "Agents build parts in FreeCAD from text or engineering drawings, and some tasks then ask for an edit; geometry and every stated dimension are scored.",
                  tasks: "100 in V3: 30 from text, 30 create-then-edit, 40 from drawings", usage: "V3 since Sep 2026; best overall 61%, V1 and V2 kept as historical boards." },
                { name: "CAD Arena", url: "https://normal.ai/leaderboard/cad-arena", mode: "Offline", board: "live", tests: "agent", ledger: "cadarena",
                  plain: "Agents rebuild real engineering drawings natively in five commercial CAD tools; scored on geometry and on whether the model stays editable.",
                  tasks: "18 drawings x 5 CAD platforms", models: "12 (Sep 2026)" },
                { name: "CADBench", url: "https://anniedoris.github.io/CADBench/#Leaderboard", mode: "Offline", board: "live", tests: "agent", ledger: "cadbench_mit",
                  plain: "Rebuild CAD models from different kinds of input - images, point clouds, text - at large scale (MIT).",
                  tasks: "18,000 samples, 6 families, 5 input types" },
                { name: "RealCADBench", url: "https://arxiv.org/abs/2609.03773", mode: "Offline", board: "paper", tests: "agent", ledger: "realcadbench", part: "Parts", added: "2026-10-07",
                  plain: "Build parts in FreeCAD Python from text, engineering drawings, real photographs or renders; scored on whether the program runs, solid and surface overlap with the reference, and a rubric judge.",
                  tasks: "1,745 parts in four input regimes", models: "9", usage: "The only set with real product photographs as input." },
                { name: "CadQueryEval", url: "https://danwahl.net/cadqueryeval/", mode: "Offline", board: "archived", tests: "agent", flag: "saturated", added: "2026-09-27",
                  plain: "Turn a plain-language description into CadQuery code; the part is built and checked against a reference mesh.",
                  tasks: "25", models: "90", usage: "Archived Sep 2026: four models score 1.00 on all 25 tasks." },
                { name: "Text2CAD", url: "https://sadilkhan.github.io/text2cad-project/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-27",
                  plain: "Generate a CAD construction sequence from text written at four levels, from beginner to expert.",
                  tasks: "Large text-to-CAD dataset", usage: "NeurIPS 2024." }
              ]
            },
            {
              id: "cad-edit",
              name: "CAD editing and engineering change",
              icon: "wrench",
              define: "Start from an existing CAD model and a change request - enlarge a bore, move a hole, carry out a designer's note. Output: the modified model. Scored on whether the change was made and nothing else broke: the rest of the geometry, the constraints and the design intent must survive. Far from saturated.",
              benchmarks: [
                { name: "neuralCAD-Edit", url: "https://autodeskailab.github.io/neuralCAD-Edit/", mode: "Offline", board: "live", tests: "agent", ledger: "neuralcad_edit",
                  plain: "Carry out designers' edit requests on existing CAD models, judged against edits made by experts (Autodesk Research).",
                  tasks: "192 requests, 384 expert edits", usage: "Expert edits are accepted 78% of the time, the best model's 25%." },
                { name: "CAD-Preserve", url: "https://huggingface.co/datasets/harrrshall/cad-preserve", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-29",
                  plain: "Given a part (STEP) and a change order, write a function that makes the change for any parameter value; graded at a nominal value and three hidden ones, and nothing else in the part may move.",
                  tasks: "80 parts x 4 parameter values", usage: "The closest thing to SWE-bench for CAD, still small." },
                { name: "HistCAD", url: "https://arxiv.org/abs/2602.19171", mode: "Offline", board: "paper", tests: "both", added: "2026-09-29",
                  plain: "Apply parameter edits to CAD models built with explicit constraints; scores whether the edit could be made at all and whether the constraints (concentric, tangent, parallel) still hold afterwards.",
                  tasks: "170,236 constraint-aware modelling sequences" },
                { name: "CADGenBench", url: "https://huggingface.co/spaces/HuggingAI4Engineering/CADGenBench", mode: "Offline", board: "live", tests: "agent", ledger: "cadgenbench", part: "Editing", added: "2026-10-07",
                  plain: "Apply a drawing revision to a supplied STEP model and hand back the edited model; scored like its generation part.",
                  tasks: "32 editing fixtures" },
                { name: "BenchCAD", url: "https://benchcad.com/leaderboard", mode: "Offline", board: "live", tests: "agent", ledger: "benchcad", part: "Code Edit",
                  plain: "Given a CadQuery program and a plain-language edit instruction, return a minimally changed program; scored by how much of the gap to the target part the edit closes.",
                  tasks: "748 program-edit pairs, 5 edit types" }
              ]
            },
            {
              id: "cad-assembly",
              name: "CAD assembly",
              icon: "layers",
              define: "Put many parts together: place each part, work out which parts mate and how, or build a whole machine from a kit of parts. Scored today on geometric placement - position, orientation, gaps between mating faces; tolerances and small fasteners are barely checked.",
              benchmarks: [
                { name: "RealCADBench", url: "https://arxiv.org/abs/2609.03773", mode: "Offline", board: "paper", tests: "agent", ledger: "realcadbench", part: "Assemblies", added: "2026-10-07",
                  plain: "Build whole assemblies in FreeCAD Python, single shot or as an agent in Codex or Claude Code; scored like its part track.",
                  tasks: "25 stratified assemblies", models: "6 models, 2 agent set-ups" },
                { name: "MUSE", url: "https://arxiv.org/abs/2605.28579", mode: "Offline", board: "paper", tests: "agent", ledger: "muse", added: "2026-10-07",
                  plain: "From a structured product spec, generate an assemblable multi-part design; the code must run and the geometry be valid, then a vision-language model judges function, manufacturability and assembly.",
                  tasks: "106 design specs", models: "15 in the main table", usage: "The judge (Gemini 3.1 Pro) is also among the models judged." },
                { name: "MARB", url: "https://huggingface.co/spaces/SunnydayTech/marb-leaderboard", mode: "Offline", board: "live", tests: "agent", added: "2026-09-29",
                  plain: "Build a whole machine from a blind kit of about 100 parts; an open grader (CADCLAW) checks every part's position, orientation and interface gaps against the target. It measures the exported geometry, not whether the machine could really be built.",
                  tasks: "1 founding kit, ~100 parts", usage: "Mechanical Assembly Readiness Benchmark; no submitted run is buildable yet." },
                { name: "OmniCAD", url: "https://arxiv.org/abs/2608.22637", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-29",
                  plain: "VLMs look at renderings of industrial assemblies and must give each part's position and orientation, recover which parts mate and how, and assemble step by step with tools.",
                  tasks: "25k assemblies, ~12 parts each, 21 mate types", usage: "Code and data announced, not yet released." }
              ]
            },
            {
              id: "cad-workflow",
              name: "Full CAD workflow",
              icon: "cog",
              define: "An agent drives real CAD software through its interface for a whole job - sketch, model, assemble, generate a toolpath, run a simulation, make a drawing - and the saved project file is checked. Mixes the categories above, like Embodied agent suites in Robotics.",
              benchmarks: [
                { name: "CADWorld", url: "https://cad-world.github.io", mode: "Offline", board: "paper", tests: "agent", ledger: "cadworld", added: "2026-09-29",
                  plain: "Computer-use agents operate FreeCAD through screenshots, mouse and keyboard to sketch, model, assemble, make toolpaths, run simulations and draw; the saved project file is checked by executable rules.",
                  tasks: "200 in 11 workflow categories", models: "7 agents; best 17.5%, experts 87%" }
              ]
            },
            {
              id: "design-opt",
              name: "Design optimization",
              icon: "scale",
              define: "Given requirements and constraints, choose a design's parameters - a bicycle frame's tube sizes, a beam's material layout, an airfoil's shape - to do as well as possible on several objectives. The output is design parameters, not a CAD model; scored on how many constraints are met and on objective values from a simulator.",
              benchmarks: [
                { name: "Bike-Bench", url: "https://decode.mit.edu/projects/bikebench/", mode: "Offline", board: "paper", tests: "both",
                  plain: "Design a bicycle frame that is valid, meets engineering targets and satisfies the constraints (MIT).",
                  tasks: "Parametric bike design", usage: "Scores constraint satisfaction and multi-objective hypervolume." },
                { name: "EngiBench", url: "https://engibench.ethz.ch/", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-29",
                  plain: "A common interface to engineering design problems - airfoils, beams, heat conduction, thermo-elastic parts, photonics, power electronics - each with its own simulator, for comparing optimizers and generative design models.",
                  tasks: "10 problems, 2D and 3D", usage: "NeurIPS 2025; reaches beyond mechanical design." }
              ]
            },
            {
              id: "cad-physics",
              name: "Physics and function",
              icon: "flask-conical",
              kind: "capability",
              define: "Capability board. Checks whether a design works, not just whether it looks right: manufacturability rules (DFM), stress under load (finite-element analysis), stability, and whether parts can move and be assembled along a feasible path. Applies to parts and assemblies alike.",
              benchmarks: [
                { name: "CADEngBench", url: "https://arxiv.org/abs/2608.09296", mode: "Offline", board: "paper", tests: "agent", ledger: "cadengbench", added: "2026-09-27",
                  plain: "Parametric parts checked for valid geometry, manufacturability rules and stress under load (finite-element analysis), plus assembly pairs checked for joints and motion.",
                  tasks: "600 part tasks on 300 parts + 150 assembly pairs", models: "8" },
                { name: "AssemblyBench", url: "https://arxiv.org/abs/2605.12845", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-29",
                  plain: "From an instruction manual and 3D parts, predict the assembly order and each part's 6-DoF motion; the motions are checked for physical feasibility in simulation.",
                  tasks: "2,789 synthetic industrial objects" }
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
      gloss: "Output is an answer, a generated video, or an LLM agent's commands. Listed, not in the ranking.",
      define: "The model's output is an answer about the physical world, a general model's commands that a simulator or fixed controller carries out (embodied reasoning), or a generated video of the world (video world models). No trained robot policy is tested and nothing gets manufactured, so these boards are listed but left out of the model ranking. They are here because they test abilities that robots and cars rely on: seeing space, predicting physics, spotting danger.",
      domains: [
        {
          id: "reasoning",
          name: "Embodied reasoning",
          icon: "brain",
          define: "General models (LLMs, VLMs) reasoning about the physical world: answering questions about 3D scenes, physics and safety, or deciding what a robot does while a simulator or fixed controller carries it out. No trained robot policy is tested - which is why these boards sit here and not under Robotics.",
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
                  tasks: "Injury, constraint and video subsets" },
                { name: "WM-ABench", url: "https://wm-abench.maitrix.org/", mode: "Offline", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Asks vision-language models questions about controlled simulated scenes, to test whether they hold a world model: perception (space, time, motion, quantity) and prediction (what happens next).",
                  tasks: "Atomic perception and prediction tests", models: "15 VLMs in the paper" },
                { name: "PAI-Bench", part: "PAI-Bench-U", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard", mode: "Offline", board: "live", tests: "agent",
                  plain: "Multiple-choice questions about physical-AI videos - common sense and embodied reasoning in driving, robot, industrial and egocentric scenes - answered by multimodal LLMs from 16 frames.",
                  tasks: "1 of 3 tracks: about 1,200 questions", models: "21 MLLMs; humans 93.2%",
                  placed: "PAI-Bench scores its three tracks separately; the two generation tracks (G, C) sit under Video world models." }
              ]
            },
            {
              id: "agents",
              name: "LLM and VLM agents",
              icon: "bot",
              define: "A general model (LLM or VLM) decides what a robot does - the next household step, a fixed move, a gripper pose, or the controller code itself - and the simulator or a fixed controller carries it out. No trained robot policy is tested, which is why these boards sit here and not under Robotics. They measure planning, spatial judgement and safety calls, not motor control.",
              benchmarks: [
                { name: "EmbodiedBench", url: "https://embodiedbench.github.io/", mode: "Sim", board: "live", tests: "agent", added: "2026-09-27",
                  plain: "Multimodal LLMs act as the robot's brain in four simulated worlds - household planning (EB-ALFRED, EB-Habitat), navigation and table-top manipulation - issuing high-level steps, fixed moves or gripper poses that the simulator carries out.",
                  tasks: "4 environments, high- and low-level", models: "24 MLLMs in the paper" },
                { name: "Embodied Agent Interface", url: "https://embodied-agent-interface.github.io/", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "LLMs plan and execute household activities in BEHAVIOR and VirtualHome, with each step of decision-making scored separately.",
                  tasks: "Household activities in two simulators" },
                { name: "VABench", url: "https://github.com/zhangzhongbo2213/VABench", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Tests general multimodal LLMs (GPT, Claude, Gemini, Qwen...), not trained robot policies. The LLM watches a demonstration, moves the camera to find what it cannot see, and writes step commands - move 30 mm along x, turn the gripper 15 degrees, close it; a fixed controller turns them into arm motion in RoboTwin. Nothing is trained on robot data.",
                  tasks: "14 task families + long-horizon tracks", models: "12 LLMs; best 53.9% success", usage: "New (DUT / NTU, Sep 2026). The same kind of entry as GPT-6-Astra driving the arm on RoboDojo. The LLMs locate targets almost perfectly in diagnostics yet fail half the tasks: the gap is execution." },
                { name: "EmbodiedSWE-Bench", url: "https://embodiedswe.github.io/", mode: "Sim", board: "live", tests: "agent", added: "2026-09-27",
                  plain: "Coding agents write robot controllers for long, fiddly tasks - assembling furniture, tying knots, cutting - in simulation.",
                  tasks: "28 across 17 embodiments", models: "6 agent set-ups in the first results" },
                { name: "Butter-Bench", url: "https://andonlabs.com/evals/butter-bench", mode: "Real", board: "paper", tests: "agent", added: "2026-09-27",
                  plain: "An LLM runs a real small robot through an office errand - find the butter, bring it over - testing judgement rather than motor control.",
                  tasks: "One errand split into sub-tasks" },
                { name: "IS-Bench", url: "https://github.com/AI45Lab/IS-Bench", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "VLM-driven household agents must notice risks that appear mid-task and take the right safety step at the right time.",
                  tasks: "161 scenarios, 388 risks", usage: "AAAI 2026." },
                { name: "SafeAgentBench", url: "https://safeagentbench.github.io/", mode: "Sim", board: "paper", tests: "agent", added: "2026-09-28",
                  plain: "Embodied LLM agents get household tasks, some of them hazardous, and are scored on refusing or planning safely while executing in simulation.",
                  tasks: "750 across 10 hazard types", models: "9 agent baselines" }
              ]
            }
          ]
        },
        {
          id: "world",
          name: "Video world models",
          icon: "globe",
          define: "Models that generate video of the physical world - from a prompt, or frame by frame as actions come in - judged on realism, physics, and whether a robot or car could use what they predict. What is scored is the video, so these boards sit here, not under Robotics or Autonomous driving.",
          tasks: [
            {
              id: "prompt-video",
              name: "Prompt to video",
              icon: "activity",
              define: "Text, an image or the first frames in; a video clip out. Judged on visual quality, following the prompt, and whether the motion obeys physics - gravity, collisions, fluids. Includes robot clips generated from an instruction (EWMBench) and 3D or 4D scene generators judged on rendered video (WorldScore).",
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
                { name: "WorldScore", url: "https://huggingface.co/spaces/Howieeeee/WorldScore_Leaderboard", mode: "Offline", board: "live", tests: "policy", added: "2026-09-27",
                  plain: "Scores 3D, 4D and video world generation on the same next-scene tasks: controllability, quality, dynamics (Stanford).",
                  tasks: "Next-scene generation sequences" },
                { name: "PAI-Bench", part: "PAI-Bench-G, PAI-Bench-C", url: "https://huggingface.co/spaces/shi-labs/physical-ai-bench-leaderboard", mode: "Offline", board: "live", tests: "policy",
                  plain: "Video generation for physical-AI scenes - driving, robotics, industry, everyday egocentric: from a text prompt (G), or following a blurred, edge, depth or segmentation video (C).",
                  tasks: "2 of 3 tracks: 1,044 prompts (G), 600 videos (C)", models: "15 (G), 4 (C)",
                  placed: "PAI-Bench scores its three tracks separately; the third, video understanding (PAI-Bench-U), asks multimodal LLMs questions, so it sits under Embodied reasoning." },
                { name: "EWMBench", url: "https://github.com/AgibotTech/EWMBench", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Robot-manipulation videos generated from language, scored on scene consistency, motion correctness and matching the instruction (AgiBot).",
                  tasks: "Robot manipulation video prompts" }
              ]
            },
            {
              id: "action-video",
              name: "Actions to video",
              icon: "bot",
              define: "The model predicts the next frames step by step as a robot, car, camera or player acts. Judged on realism, on following the actions, or on whether an agent can plan with the predictions. Driving world models (WorldLens) sit here, not under Autonomous driving: what is scored is video, not driving.",
              benchmarks: [
                { name: "WorldArena", url: "https://huggingface.co/spaces/WorldArena/WorldArena", mode: "Offline", board: "live", tests: "policy",
                  plain: "Embodied world models judged both on how real their predictions look and on how useful they are for downstream robot tasks.",
                  tasks: "Perception and functional-utility tests" },
                { name: "World-in-World", url: "https://world-in-world.github.io/subpages/leaderboard.html", mode: "Sim", board: "live", tests: "policy", added: "2026-09-28",
                  plain: "Plugs a world model into an agent's planning loop and scores it by whether the agent completes the task - not by how nice the video looks.",
                  tasks: "4 closed-loop tasks" },
                { name: "1X World Model Challenge", url: "https://github.com/1x-technologies/1xgpt", mode: "Offline", board: "challenge", tests: "policy", added: "2026-09-28",
                  plain: "Predict what 1X's EVE humanoid will see next from its own logged data.",
                  tasks: "Future-frame prediction" },
                { name: "WBench", url: "https://meituan-longcat.github.io/WBench/#leaderboard", mode: "Offline", board: "paper", tests: "policy", added: "2026-09-28",
                  plain: "Multi-turn interaction with a video world model - move, act, edit events, switch view - scored on quality, following the input, consistency and physics.",
                  tasks: "289 cases, 1,058 turns", models: "20" },
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
