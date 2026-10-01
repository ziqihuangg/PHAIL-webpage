/* Research snapshot: 2026-09-30. Data only; counts retain source/version units. */
window.phailBenchmarkLandscape = {
  "updated": "2026-09-30",
  "rows": [
    {
      "id": "behavior",
      "name": "BEHAVIOR-1K",
      "group": "mobile",
      "status": "Existing · version clarified",
      "version": "Full library / 2026 challenge",
      "tasks": "Household search, rearrangement, cleaning, cooking and object state changes. Library: 1,000 activities; 2026 challenge: 100 tasks.",
      "body": "2026 challenge: Galaxea R1Pro wheeled dual-arm robot. Other library robots are separate configurations.",
      "models": "2026 starter baselines: π0.5 and GR00T N1.7. These are provided baseline pipelines, not a claim of full-library evaluation.",
      "sim": "OmniGibson / Isaac Sim (PhysX)",
      "origin": "Authored / reconstructed",
      "assets": "Library: 50 scenes, 9,000+ object models in the 2024 paper (current homepage: 10,000+). Challenge: 7 scenes; 20,000 teleoperated demos / 1,950 h. Interactive authored assets; some homes reconstruct real spaces.",
      "reuse": "BDDL task definitions, articulated objects, scene states, thermal/liquid interactions and challenge demonstrations.",
      "caveat": "Library counts and challenge counts are different. Asset download terms and OmniGibson versions apply; the changing knowledgebase has a different scene count.",
      "sources": [
        {
          "label": "Library paper",
          "url": "https://arxiv.org/abs/2403.09227"
        },
        {
          "label": "2026 track",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/main/docs/challenge/index.md"
        },
        {
          "label": "Baseline / robot",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/main/docs/challenge/baselines.md"
        },
        {
          "label": "Asset sourcing documentation",
          "url": "https://github.com/StanfordVL/BEHAVIOR-1K/blob/main/docs/getting_started/important_concepts.md"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Licensed external assets + simulation adaptation: chiefly ShapeNet and TurboSquid; BEHAVIOR adds physical properties, semantic annotations and scene assembly. Commercial licensing is confirmed; per-vendor purchase counts are not disclosed.",
      "deformable": "Yes — cloth/deformable assets in the full library; unique model count not reported. Challenge subset count unverified.",
      "articulated": "Yes — doors, drawers and appliances; unique articulated model count not reported."
    },
    {
      "id": "robocasa",
      "name": "RoboCasa (original)",
      "group": "mobile",
      "status": "Existing · version clarified",
      "version": "2024 / original 100-task suite",
      "tasks": "Kitchen pick/place, appliances, doors, drawers and composed cooking/cleaning. 100 task definitions; later papers use their own subsets.",
      "body": "Mobile Panda arm with parallel gripper in the original kitchen setup.",
      "models": "BC-Transformer; Diffusion Policy comparison in the original appendix. Training-data scaling and generalization experiments use separately defined task subsets.",
      "sim": "robosuite / MuJoCo",
      "origin": "Procedural + mixed objects",
      "assets": "Original release: 120 kitchen environments (layout/style combinations), 2,500+ object assets. Generated kitchens combine authored fixtures and object collections.",
      "reuse": "Kitchen fixtures, articulated appliances, task templates and demonstration generation.",
      "caveat": "Original 100-task results, GR00T 24-task subset and RoboCasa365 scores are separate protocols.",
      "sources": [
        {
          "label": "Original paper",
          "url": "https://arxiv.org/abs/2406.02523"
        },
        {
          "label": "Repository",
          "url": "https://github.com/robocasa/robocasa"
        },
        {
          "label": "Original policy appendix",
          "url": "https://arxiv.org/html/2406.02523v1"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "External reuse + generated assets: Objaverse objects and text-to-3D objects; authored kitchen fixtures and procedural scene assembly. Asset purchase details not reported.",
      "deformable": "Not established — no deformable-object inventory reported for this evaluated suite.",
      "articulated": "Yes — articulated kitchen fixtures/appliances; unique model count not reported."
    },
    {
      "id": "robocasa365",
      "name": "RoboCasa365",
      "group": "mobile",
      "status": "Added",
      "version": "2026 / board updated 2026-09-23",
      "tasks": "365 kitchen tasks: 65 atomic plus composite tasks. Public multi-task board evaluates 50 tasks in three splits.",
      "body": "Mobile Panda with parallel gripper; match the released benchmark robot configuration.",
      "models": "14 board entries: Paimon-0, Xiaomi-Robotics-1, Phasor-m7, ABot-M0.6, ABot-M0.5, PRTS, RLDX-1, WorldDreamer, GR00T N1.5/N1.6, GigaWorld-Policy 0.1, π0.5, π0, Diffusion Policy.",
      "sim": "robosuite / MuJoCo",
      "origin": "Procedural + mixed objects",
      "assets": "2,500 kitchen environments; 600+ h human demos and 1,600+ h synthetic demos. Procedural layouts/styles with curated and generated objects; no claim that all meshes are scans.",
      "reuse": "Large kitchen variation, compositional task splits, human/synthetic data, public policy adapters.",
      "caveat": "50 evaluated tasks ≠ 365 library tasks. Board horizon changed for GR00T N1.5 in v1.0.1; preserve protocol when comparing.",
      "sources": [
        {
          "label": "Paper",
          "url": "https://arxiv.org/abs/2603.04356"
        },
        {
          "label": "Board / model list",
          "url": "https://robocasa.ai/leaderboard.html"
        },
        {
          "label": "Platform",
          "url": "https://robocasa.ai/docs/build/html/introduction/overview.html"
        },
        {
          "label": "Current object sources (versioned docs)",
          "url": "https://robocasa.ai/docs/build/html/assets/objects.html"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "RoboCasa ecosystem: Objaverse, LightWheel AI and Luma.ai-generated objects in current asset docs; curated fixtures and procedural kitchens. Supplier named; purchase/commission terms not disclosed.",
      "deformable": "Not established — no deformable-object inventory reported.",
      "articulated": "Yes — cabinets, drawers and appliances; unique articulated model count not reported."
    },
    {
      "id": "ovmm",
      "name": "HomeRobot OVMM",
      "group": "mobile",
      "status": "Existing",
      "version": "2023 initial benchmark",
      "tasks": "Open-vocabulary object search → navigation → grasp → navigation → placement. Seen/unseen object categories and instances.",
      "body": "Hello Robot Stretch in simulation and real experiments.",
      "models": "Original RL skill baseline and heuristic/model-based baseline; perception and navigation modules form a complete system.",
      "sim": "Habitat-Sim / Habitat-Lab (Bullet)",
      "origin": "Authored scenes + scanned objects",
      "assets": "Initial benchmark: 50 HSSD homes, thousands of episodes. HSSD is human-authored synthetic housing; movable objects include scanned object collections. Benchmark-specific unique mesh count not verified.",
      "reuse": "HSSD room layouts, receptacle annotations, open-vocabulary episodes and Stretch stack.",
      "caveat": "50 is the initial OVMM subset, not the entire HSSD library. Real tests do not turn synthetic houses into real scans.",
      "sources": [
        {
          "label": "Project / baselines",
          "url": "https://ovmm.github.io/"
        },
        {
          "label": "Paper / assets",
          "url": "https://aihabitat.org/static/challenge/home_robot_ovmm_2023/ovmm-compressed.pdf"
        },
        {
          "label": "Code",
          "url": "https://github.com/facebookresearch/home-robot"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses HSSD authored indoor scenes and scanned movable-object collections; benchmark assembles episodes. Scene authoring is upstream, not new real scans by HomeRobot. Purchase details not reported.",
      "deformable": "Not established — scanned appearance does not imply deformable simulation.",
      "articulated": "Not established for the OVMM evaluation subset; do not count static cabinets as active articulations."
    },
    {
      "id": "hab",
      "name": "Habitat 2.0 HAB",
      "group": "mobile",
      "status": "Existing",
      "version": "2021 Home Assistant Benchmark",
      "tasks": "Tidy House, Prepare Groceries, Set Table: navigation, pick/place and articulated furniture.",
      "body": "Fetch mobile manipulator.",
      "models": "Monolithic RL (DD-PPO), task planning with RL skills (TP-SRL); compare skill sequencing versus end-to-end learning.",
      "sim": "Habitat-Sim / Habitat-Lab (Bullet)",
      "origin": "Scan-informed CAD reconstruction",
      "assets": "ReplicaCAD: 105 layout variations; public download has 84, with 21 held out. 90+ object assets, 6+ articulated URDFs; YCB objects. Artist recreation of scanned Replica apartment, not raw scan geometry.",
      "reuse": "Interactive apartment furniture, receptacle metadata, navmeshes and task planning definitions.",
      "caveat": "105 layouts do not mean 105 independently scanned homes. ReplicaCAD materials: CC BY 4.0; other datasets retain separate terms.",
      "sources": [
        {
          "label": "Tasks / baseline",
          "url": "https://aihabitat.org/docs/habitat2/"
        },
        {
          "label": "Asset inventory / license",
          "url": "https://aihabitat.org/datasets/replica_cad/"
        },
        {
          "label": "ReplicaCAD asset inventory",
          "url": "https://aihabitat.org/datasets/replica_cad/"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "ReplicaCAD: artists rebuilt geometry from Replica FRL apartment scans and added joints/physics; YCB supplies scanned movable objects. Reconstructed CAD, not raw scan meshes.",
      "deformable": "No — 0 simulated deformable objects in HAB rigid/articulated-body tasks.",
      "articulated": "Yes — 6+ articulated URDF assets in the upstream ReplicaCAD library; per-split unique count not reported."
    },
    {
      "id": "mshab",
      "name": "ManiSkill-HAB",
      "group": "mobile",
      "status": "Existing · protocol clarified",
      "version": "MS-HAB released benchmark",
      "tasks": "Tidy House, Prepare Groceries, Set Table; emphasizes low-level manipulation. Sequential evaluation can use teleport navigation.",
      "body": "Fetch mobile manipulator.",
      "models": "SAC, PPO, behavior cloning and Diffusion Policy: released training configurations/checkpoints.",
      "sim": "ManiSkill / SAPIEN (PhysX)",
      "origin": "Scan-informed CAD reconstruction",
      "assets": "Reuses ReplicaCAD and YCB assets from HAB; a port, not a new collection of scanned houses. Exact benchmark split is set in HAB configs.",
      "reuse": "GPU manipulation training, task/subtask plans and reusable spawn data.",
      "caveat": "Teleport navigation does not evaluate continuous base control. Pin the repository environment; this implementation uses a ManiSkill3 beta stack.",
      "sources": [
        {
          "label": "Code / protocol / assets",
          "url": "https://github.com/arth-shukla/mshab"
        },
        {
          "label": "ManiSkill entry",
          "url": "https://maniskill.readthedocs.io/en/latest/tasks/external/"
        },
        {
          "label": "Upstream ReplicaCAD inventory",
          "url": "https://aihabitat.org/datasets/replica_cad/"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Ports HAB’s ReplicaCAD and YCB assets into ManiSkill/SAPIEN; reuses upstream artist-built CAD and scans rather than building a new asset corpus.",
      "deformable": "No — 0 in the ported rigid/articulated HAB task suite.",
      "articulated": "Yes — uses ReplicaCAD articulated furniture (upstream library: 6+ URDF assets); port-specific unique count not reported."
    },
    {
      "id": "m3bench",
      "name": "M3Bench",
      "group": "mobile",
      "status": "Existing · source clarified",
      "version": "RA-L 2025 paper / released data",
      "tasks": "Whole-body pick and place trajectory generation; collisions, limits, final success and generalization. About 30k trajectories.",
      "body": "7-DoF Kinova Gen3 + parallel gripper on an omnidirectional base.",
      "models": "ModularMP, MπNet and MπFormer (three adapted baselines).",
      "sim": "Isaac Sim for execution evaluation",
      "origin": "Procedural synthetic",
      "assets": "119 PhyScene scenes; 588 objects / 32 types (paper table). Synthetic scene URDFs render the input point clouds; these are not captured real-world scans.",
      "reuse": "Scene/robot URDFs, expert joint trajectories, task metadata and pick/place evaluation.",
      "caveat": "Trajectory generation protocol is different from closed-loop VLA rollout. Paper conclusion has an inconsistent scene count; use dataset table and released README.",
      "sources": [
        {
          "label": "Paper §§IV–V",
          "url": "https://arxiv.org/html/2410.06678v2"
        },
        {
          "label": "Released 119-scene data",
          "url": "https://github.com/TooSchoolForCool/M3Bench"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses PhyScene-generated synthetic scenes; benchmark converts scene assets to URDF and generates point clouds. Upstream per-mesh vendor/purchase provenance not verified.",
      "deformable": "Not established — no deformable simulation inventory reported.",
      "articulated": "Not established — object count 588 is not an articulated-object count."
    },
    {
      "id": "icra",
      "name": "RoboChallenge ICRA 2026",
      "group": "mobile",
      "status": "Existing",
      "version": "Real competition; closed May 2026",
      "tasks": "Supermarket navigation and goods handling / restocking; 2 scored tasks.",
      "body": "AgiBot G2 wheeled dual-arm robot.",
      "models": "11 team entries recorded in the existing Ledger; team names are not verified model checkpoint identities.",
      "sim": "Real robot; no benchmark simulator verified",
      "origin": "Real only",
      "assets": "Physical supermarket setup. No reusable simulation scene pack or mesh count confirmed.",
      "reuse": "Task protocol and real execution requirements; use the existing Ledger for scores.",
      "caveat": "This entry is retained for real evaluation coverage. Do not treat it as a source of downloadable simulation assets.",
      "sources": [
        {
          "label": "Official competition",
          "url": "https://robochallenge.ai/competition/icra"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Physical supermarket setup; object procurement and a reusable simulation asset source are not documented in the checked competition material.",
      "deformable": "N/A for simulation — physical-object material/count not verified.",
      "articulated": "N/A for simulation — physical articulated-object count not verified."
    },
    {
      "id": "humanoidbench",
      "name": "HumanoidBench",
      "group": "loco",
      "status": "Existing",
      "version": "2024 original suite",
      "tasks": "27 tasks: 12 locomotion and 15 manipulation, including carrying, pushing and object interaction.",
      "body": "Evaluated: Unitree H1 with two Shadow Hands. Supported alternatives include Digit and Robotiq grippers.",
      "models": "DreamerV3, TD-MPC2, SAC and PPO; hierarchical policies with pretrained reach/walk skills in separate experiments.",
      "sim": "MuJoCo; MJX for low-level skill training",
      "origin": "Authored task scenes",
      "assets": "27 task environments built from robot/object models and task-specific geometry. No scanned indoor-scene collection; unique object mesh count not reported on project page.",
      "reuse": "Whole-body task rewards, high-DoF robot models, tactile sensor setup and skill hierarchy.",
      "caveat": "Not every manipulation task requires walking. Keep the locomotion-only part separate when selecting tasks.",
      "sources": [
        {
          "label": "Project / embodiment",
          "url": "https://humanoid-bench.github.io/"
        },
        {
          "label": "Code",
          "url": "https://github.com/carlosferrazza/humanoid-bench"
        },
        {
          "label": "Paper §V",
          "url": "https://arxiv.org/html/2403.10506v1"
        },
        {
          "label": "Released task list",
          "url": "https://github.com/carlosferrazza/humanoid-bench/blob/main/README.md"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Project task MJCF geometry and robot/object models assembled into authored environments. Per-mesh upstream sources and purchase details are not fully inventoried.",
      "deformable": "Not established — no deformable-object count reported.",
      "articulated": "Yes — door, cabinet and window tasks; unique articulated models not inventoried (task names are not model counts)."
    },
    {
      "id": "simple",
      "name": "SIMPLE",
      "group": "loco",
      "status": "Existing · version clarified",
      "version": "2026 paper / preliminary results",
      "tasks": "60 designed whole-body tasks; published baseline table covers 6 tasks and 3 perturbation levels. Pick/place, bending, handover and non-prehensile interaction.",
      "body": "Unitree G1; whole-body control with AMO / SONIC.",
      "models": "Published six-task table: Ψ0, GR00T N1.6, π0.5, InternVLA. DreamZero integration is not evidence of a result in that table.",
      "sim": "MuJoCo physics + Isaac Sim rendering",
      "origin": "Authored scenes + mixed objects",
      "assets": "50 HSSD scenes; 1,500+ Objaverse objects and GraspNet scans. Main text says 53 GraspNet objects; appendix says 75. 6,000+ trajectories.",
      "reuse": "Dual-format collision/render meshes, scene loading, grasp cache, teleoperation and motion-planning pipelines.",
      "caveat": "Paper library scale ≠ six-task evaluated release. GraspNet count conflict is unresolved; Objaverse meshes have mixed provenance.",
      "sources": [
        {
          "label": "Paper §§3–4 / appendix",
          "url": "https://arxiv.org/html/2606.08278v1"
        },
        {
          "label": "Release / preliminary table",
          "url": "https://github.com/physical-superintelligence-lab/SIMPLE"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses HSSD authored scenes, Objaverse meshes and GraspNet scanned objects; SIMPLE assembles task scenes. No separately purchased collection identified in the paper.",
      "deformable": "Not established — no deformable-object count reported.",
      "articulated": "Not established — articulated assets in the evaluated subset are not separately counted."
    },
    {
      "id": "grbench",
      "name": "GRBench (GRUtopia)",
      "group": "loco",
      "status": "Existing · embodiment corrected",
      "version": "2024 original loco-manipulation track",
      "tasks": "Language-conditioned pick and place after navigation; 300 episodes (100 validation, 200 test). Navigation tracks are separate.",
      "body": "Loco-manipulation: AlienGo quadruped + Unitree Z1 arm. H1 is used for navigation in the original paper.",
      "models": "GPT-4o, InternVL-Chat-1.5, Qwen, Llama-3 8B, InternLM-2-Chat and ChatGLM3 high-level agents over supplied control APIs; low-level controller evaluation is separate.",
      "sim": "GRUtopia / Isaac Sim",
      "origin": "Designer-authored synthetic",
      "assets": "GRScenes: initial curated release of 100 scenes (70 homes / 30 commercial). The paper’s 100k source pool is not 100k downloadable benchmark scenes.",
      "reuse": "Interactive USD scenes beyond homes, semantic annotations and legged robot control APIs.",
      "caveat": "High-level agent benchmark with controller dependencies. Repository now redirects to InternUtopia; keep the original paper protocol pinned.",
      "sources": [
        {
          "label": "Original paper §§3–4",
          "url": "https://arxiv.org/html/2407.10943v1"
        },
        {
          "label": "Current code",
          "url": "https://github.com/InternRobotics/InternUtopia"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "GRScenes derives from professionally designed indoor scenes, then undergoes physics/semantic processing. Commercial-source purchase or commissioning terms not verified.",
      "deformable": "Not established — no deformable-object inventory verified.",
      "articulated": "Not established for the loco-manipulation subset; interactive does not necessarily mean articulated."
    },
    {
      "id": "hmg",
      "name": "HumanoidMimicGen G1",
      "group": "loco",
      "status": "Existing",
      "version": "Nine-task simulated G1 benchmark",
      "tasks": "Lift from floor/table, press button, push shelf, drill pick/place, shelving and obstacle-aware picking: 9 tasks.",
      "body": "Unitree G1 humanoid.",
      "models": "GR00T N1.6 fine-tuning with different datasets; compare human demos, DexMimicGen+ and HumanoidMimicGen generated data. Policy architecture ablations are separate.",
      "sim": "robosuite / MuJoCo",
      "origin": "Authored task scenes",
      "assets": "9 task setups; 1,000 generated demonstrations per task from one source demo in the main comparison. Distinct object/scene asset count and mesh provenance not established by project page.",
      "reuse": "Whole-body demonstration adaptation, obstacle layout variation and skill annotations.",
      "caveat": "Data-generation methods are not model names. Four real transfer tasks are separate from the nine simulated tasks.",
      "sources": [
        {
          "label": "Project / task and data table",
          "url": "https://humanoidmimicgen.github.io/"
        },
        {
          "label": "Paper §§5–6 / appendix",
          "url": "https://arxiv.org/html/2605.27724v1"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "HumanoidMimicGen task environments use robosuite; dataset generation reuses task setups. Per-object origin and purchase details not reported in the checked overview.",
      "deformable": "Not established — unique deformable models not reported.",
      "articulated": "Not established — unique articulated models not reported."
    },
    {
      "id": "adroit",
      "name": "Adroit / D4RL",
      "group": "dexterous",
      "status": "Existing",
      "version": "Adroit tasks; D4RL offline datasets",
      "tasks": "Pen reorientation, door opening, hammering and object relocation: 4 tasks.",
      "body": "24-DoF Adroit hand (task-dependent arm/base joints).",
      "models": "DAPG in the original Adroit work; D4RL evaluates offline-RL algorithms on human, cloned and expert datasets. Newer IQL/CQL results require their own citations.",
      "sim": "MuJoCo / Gymnasium-Robotics; Minari for offline data",
      "origin": "Authored task scenes",
      "assets": "Four small task setups; pen, door, hammer/nail and relocation object. Demonstrations are task datasets, not a large object asset corpus.",
      "reuse": "Compact contact-rich sanity checks; demonstration-driven and offline-RL protocols.",
      "caveat": "Adroit environment success and D4RL normalized return are different metrics; identify dataset variant and environment version.",
      "sources": [
        {
          "label": "Environment",
          "url": "https://robotics.farama.org/envs/adroit_hand/"
        },
        {
          "label": "Original method",
          "url": "https://arxiv.org/abs/1709.10087"
        },
        {
          "label": "Offline data",
          "url": "https://minari.farama.org/datasets/D4RL/index.html"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses the authored Adroit/MJRL MuJoCo task assets, distributed through D4RL/Gymnasium Robotics; no scan corpus. Purchase details not reported.",
      "deformable": "No — 0 in the four standard rigid-body tasks.",
      "articulated": "Yes — 1 door assembly in the Door task; Hammer also includes a sliding nail mechanism, not an additional door model."
    },
    {
      "id": "bidex",
      "name": "Bi-DexHands",
      "group": "dexterous",
      "status": "Existing",
      "version": "Original 20-task study",
      "tasks": "Bimanual passing, catching, opening, stacking and tool/object cooperation; 20 task families.",
      "body": "Two Shadow Hands in standard configurations.",
      "models": "PPO, SAC, MAPPO, HAPPO on 20 tasks; BC, BCQ, TD3+BC, IQL on two offline tasks; multi-task PPO and ProMP in separate protocols.",
      "sim": "Isaac Gym (PhysX)",
      "origin": "Authored + dataset objects",
      "assets": "20 task setups; repository includes task assets and object dataset integrations. Unique mesh count and scan/CAD composition not verified.",
      "reuse": "Bimanual rewards, multi-agent action partitioning, offline datasets and training code.",
      "caveat": "Supported algorithms are not all evaluated. Isaac Gym is the original runtime; migration to Isaac Lab changes implementation details.",
      "sources": [
        {
          "label": "Original results",
          "url": "https://pku-marl.github.io/DexterousHands/"
        },
        {
          "label": "Code / assets",
          "url": "https://github.com/PKU-MARL/DexterousHands"
        },
        {
          "label": "Asset integrations / tasks",
          "url": "https://github.com/PKU-MARL/DexterousHands"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Project task assets plus external YCB scans and SAPIEN/PartNet-Mobility objects. Repository advertises >2,000 available target objects, not >2,000 evaluated articulated models.",
      "deformable": "Not established — no deformable-object inventory verified.",
      "articulated": "Yes — door / bottle-cap task assets; unique articulated model count not reported."
    },
    {
      "id": "dexart",
      "name": "DexArt",
      "group": "dexterous",
      "status": "Existing",
      "version": "CVPR 2023",
      "tasks": "Four articulated categories: faucet, laptop, bucket and toilet. Generalization to unseen object instances.",
      "body": "xArm6 (6 DoF) with Allegro Hand (16 DoF).",
      "models": "PPO + PointNet; visual encoder / pretraining ablations, including ResNet-18 comparison. Later DP3 evaluations belong to later papers.",
      "sim": "SAPIEN (PhysX)",
      "origin": "CAD articulated objects",
      "assets": "82 PartNet-Mobility CAD objects: faucet 18 (11 seen / 7 unseen), bucket 19 (11 / 8), laptop 17 (11 / 6), toilet 28 (17 / 11). Total 50 seen / 32 unseen; manually selected articulated models.",
      "reuse": "Articulated meshes, joint definitions, held-out object split and point-cloud observation pipeline.",
      "caveat": "Useful for object generalization; not a broad household scene library.",
      "sources": [
        {
          "label": "Project / models",
          "url": "https://www.chenbao.tech/dexart/"
        },
        {
          "label": "Paper",
          "url": "https://www.chenbao.tech/dexart/static/paper/dexart.pdf"
        },
        {
          "label": "Code",
          "url": "https://github.com/Kami-code/dexart-release"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses 82 PartNet-Mobility CAD models, manually selected and annotated for the benchmark. No new scan collection; no purchase declared.",
      "deformable": "No — 0; benchmark uses rigid links with joints.",
      "articulated": "Yes — 82 models: faucet 18, bucket 19, laptop 17, toilet 28; 50 seen / 32 unseen."
    },
    {
      "id": "pianist",
      "name": "RoboPianist",
      "group": "dexterous",
      "status": "Existing",
      "version": "CoRL 2023 original evaluation",
      "tasks": "Bimanual timed piano playing. Repertoire-150; primary paper experiments on Etude-12 subset.",
      "body": "Two Shadow Hands; each has 24 DoF.",
      "models": "DroQ-based RL with reward / fingering ablations. This row describes original policy experiments.",
      "sim": "MuJoCo / dm_control",
      "origin": "Authored instrument + MIDI",
      "assets": "One 88-key keyboard setup plus two hand models; 150 MIDI pieces with PIG fingering annotations. Songs are task data, not scenes.",
      "reuse": "Fine finger coordination, timing metrics and musical task generator.",
      "caveat": "Code, hand assets, MIDI and soundfonts have separate licenses. A model writing a controller is a separate evaluation harness.",
      "sources": [
        {
          "label": "Project / protocol",
          "url": "https://kzakka.com/robopianist/"
        },
        {
          "label": "Code / licenses",
          "url": "https://github.com/google-research/robopianist"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Project-authored MuJoCo piano model plus Shadow Hand models; PIG/MIDI supplies music, not object meshes. No asset purchase reported.",
      "deformable": "No — 0 in the piano benchmark.",
      "articulated": "Yes — 1 keyboard assembly with 88 moving keys; 88 joints are not 88 distinct object models."
    },
    {
      "id": "shadow",
      "name": "Shadow Hand (Gymnasium)",
      "group": "dexterous",
      "status": "Added",
      "version": "Goal-conditioned hand environment family",
      "tasks": "Fingertip reaching and in-hand block, egg and pen manipulation; dense/sparse and goal variants.",
      "body": "Shadow Dexterous Hand.",
      "models": "HER + DDPG in the original environment study; later algorithms use the same task family under separate protocols.",
      "sim": "MuJoCo / Gymnasium-Robotics",
      "origin": "Authored primitives",
      "assets": "Four core task families; block/egg/pen models and hand geometry. No scanned scene library.",
      "reuse": "Small reproducible in-hand baseline, goal-conditioned rewards and observation interfaces.",
      "caveat": "Count task families separately from position/rotation/reward variants.",
      "sources": [
        {
          "label": "Current environment",
          "url": "https://robotics.farama.org/envs/shadow_dexterous_hand/"
        },
        {
          "label": "Original benchmark",
          "url": "https://arxiv.org/abs/1802.09464"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses OpenAI Gym / Gymnasium Robotics authored MuJoCo block, egg and pen assets plus Shadow robot models; no scan dataset.",
      "deformable": "No — 0 in the standard four task families.",
      "articulated": "No — 0 task objects with internal articulation; robot hand joints excluded."
    },
    {
      "id": "dexmimicgen",
      "name": "DexMimicGen",
      "group": "dexterous",
      "status": "Added",
      "version": "ICRA 2025 data-generation benchmark",
      "tasks": "Nine bimanual task families with coordination, sequential manipulation and precision; robot/task variants expand the evaluation.",
      "body": "Dual Panda with parallel grippers; dual Panda with dexterous hands; GR-1 with dexterous hands. Three tasks per setup; only the hand tracks belong in strict Dexterous scope.",
      "models": "BC-RNN, BC-RNN-GMM and Diffusion Policy trained on generated datasets; source-demo and DemoNoise comparisons.",
      "sim": "robosuite / MuJoCo",
      "origin": "Authored task scenes",
      "assets": "Task-centric synthetic scenes and retargeted demonstrations. Mesh count is not reported on the project page; generated trajectories must not be counted as assets.",
      "reuse": "Bimanual demonstration generation, coordination constraints and transferable task setups.",
      "caveat": "Primarily evaluates a data-generation method; not a public foundation-model leaderboard.",
      "sources": [
        {
          "label": "Project",
          "url": "https://dexmimicgen.github.io/"
        },
        {
          "label": "Paper",
          "url": "https://arxiv.org/html/2410.24185v1"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses robosuite/MimicGen task assets and builds bimanual variants; demonstrated BiGym extensions are separate. Per-mesh vendor/purchase breakdown not reported.",
      "deformable": "Not established — pouring or threading task names alone do not confirm soft-body simulation.",
      "articulated": "Yes — Drawer Cleanup contains an articulated drawer; unique model total not reported."
    },
    {
      "id": "dexjoco",
      "name": "DexJoCo",
      "group": "dexterous",
      "status": "Added",
      "version": "May 2026",
      "tasks": "11 functional tasks: tool use, reasoning, bimanual coordination and long-horizon execution.",
      "body": "Franka Panda + Allegro Hand in single / bimanual configurations.",
      "models": "ACT, Diffusion Policy (CNN / Transformer), π0.5 and GR00T N1.5; object-only and full randomization.",
      "sim": "MuJoCo",
      "origin": "CAD + generated assets",
      "assets": "11 task setups / 1.1k demonstrations. RoboCasa and PartNet-Mobility objects; Hunyuan3D meshes with manually assigned physics. Unique mesh count not stated.",
      "reuse": "Functional task objects, contact/order-based success checks, visual replay augmentation and VLA evaluation adapters.",
      "caveat": "Visual water/state effects do not imply fluid simulation. Bimanual action heads require adaptation.",
      "sources": [
        {
          "label": "Project / results",
          "url": "https://dexjoco.github.io/"
        },
        {
          "label": "Paper §3 / assets",
          "url": "https://arxiv.org/html/2605.16257v1"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses RoboCasa and PartNet-Mobility; additionally generates meshes with Hunyuan3D and manually assigns physical properties. Purchase details not reported.",
      "deformable": "Not established — no deformable-model count reported.",
      "articulated": "Yes — PartNet-Mobility articulated task objects; unique count not reported."
    },
    {
      "id": "dexverse",
      "name": "DexVerse",
      "group": "dexterous",
      "status": "Added",
      "version": "July 2026 v1",
      "tasks": "100 task definitions; experiments on 19. Grasp/relocate, articulation, tools, non-prehensile, precision and bimanual skills.",
      "body": "Supports FR3 / UR10e / xArm7 and six hands. Full supported matrix is broader than evaluated configurations; per-result embodiment still to transcribe.",
      "models": "Diffusion Policy, DP3, OpenVLA and π0.5 on the evaluated subset.",
      "sim": "Isaac Lab / Isaac Sim (PhysX)",
      "origin": "CAD + mixed + generated assets",
      "assets": "3,180 demonstrations; 100 HDR skyboxes. Objects from PartNet-Mobility, ManiTwin, Isaac assets, AutoBio, Synthesis and Meshy; unique object count not stated.",
      "reuse": "Modular tasks, visual randomization, hand/arm adapters and VR data collection.",
      "caveat": "100 library tasks ≠ 19 evaluated tasks; do not infer all 18 arm–hand pairings have reported model scores.",
      "sources": [
        {
          "label": "Paper / assets / results",
          "url": "https://arxiv.org/html/2607.08751v1"
        },
        {
          "label": "Project",
          "url": "https://ycyao216.github.io/DexVerse.site/"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses PartNet-Mobility, ManiTwin, Isaac assets and AutoBio; also uses Synthesis and Meshy. Mixed external/generated sources; per-provider counts and paid procurement not disclosed.",
      "deformable": "Not established — paper does not inventory deformable simulation objects.",
      "articulated": "Yes — articulated-object tasks; unique articulated model count not reported."
    },
    {
      "id": "bench2dex",
      "name": "Bench2Dex",
      "group": "dexterous",
      "status": "Added",
      "version": "September 2026 v1",
      "tasks": "26 bimanual tasks: tools/devices, articulated objects and multi-stage manipulation; seven robustness perturbations.",
      "body": "IIWA7+Sharpa; Panda+Allegro/Orca; RM65+Revo2; UR5+RH56DFX/RH5DG2/Schunk/Shadow/Wuji; xArm7+Ability/LEAP; JAKA ZU7+DexHand021. Full per-model coverage differs by experiment.",
      "models": "ACT, Diffusion Policy, π0.5, GR00T N1.5.",
      "sim": "Isaac Lab / Isaac Sim (PhysX)",
      "origin": "Authored task scenes",
      "assets": "~1.3k demos; 60 iTHOR/USD backgrounds (50 seen / 10 unseen), 68 distractor assets (52/16), 11,824 table materials. Backgrounds are authored synthetic geometry used for rendering only. Task-mesh provenance is not fully inventoried.",
      "reuse": "Visuo-tactile observations, synchronized HDF5 data, executable metrics and cross-hand teleoperation.",
      "caveat": "Background rooms have no collision/contact simulation. Tactile maps describe simulated contact, not a validated named real sensor; mesh licenses remain source-specific.",
      "sources": [
        {
          "label": "Project / evaluation",
          "url": "https://bench2dex.github.io/"
        },
        {
          "label": "Paper",
          "url": "https://arxiv.org/html/2609.15726v1"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Backgrounds reuse iTHOR/USD resources; task objects are curated for the benchmark. Exact task-mesh supplier and self-built/purchased breakdown not reported. Background meshes are visual only.",
      "deformable": "Not established — no deformable simulation inventory reported.",
      "articulated": "Yes — articulated-object interaction tasks; unique model count not reported. The 68 distractors are not an articulation count."
    },
    {
      "id": "dexgraspbench",
      "name": "DexGraspBench",
      "group": "dexterous",
      "status": "Added",
      "version": "BODex original baseline branch / current main",
      "tasks": "Grasp-pose/trajectory replay, lifting, force closure, penetration and diversity. Grasp synthesis evaluation, not long-horizon control.",
      "body": "Allegro, Shadow, LEAP and UR10e+Shadow configurations.",
      "models": "DexGraspNet, FRoGGeR, SpringGrasp, BODex; learned CVAE, diffusion and normalizing-flow baselines.",
      "sim": "MuJoCo",
      "origin": "Mixed object meshes",
      "assets": "DGN_2k processed pack for BODex; later DGN_5k / Objaverse_5k packs are separate releases. Object-centric collections; no room scenes.",
      "reuse": "Unified grasp execution tests, processed collision meshes and hand assets from MuJoCo Menagerie.",
      "caveat": "Current main changes mass/gains from the original baseline branch. Fix the branch and contact parameters before comparing.",
      "sources": [
        {
          "label": "Code / baseline / asset packs",
          "url": "https://github.com/JYChen18/DexGraspBench"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses processed DexGraspNet and Objaverse object packs; benchmark adds evaluation / physical processing. Packs have separate versions; no original scene corpus.",
      "deformable": "No — 0 simulated deformable objects in the rigid grasp evaluation protocol.",
      "articulated": "No — 0 active articulated task objects in the rigid grasp protocol; source shapes may depict mechanisms."
    },
    {
      "id": "dexgraspnet2",
      "name": "DexGraspNet 2.0",
      "group": "dexterous",
      "status": "Added",
      "version": "CoRL 2024 benchmark",
      "tasks": "Cluttered dexterous grasp proposal from single-view depth, followed by simulated lifting.",
      "body": "LEAP Hand (16 DoF) in simulation; real transfer uses LEAP on UR5. Parallel-gripper experiments use Franka Panda separately.",
      "models": "Local-geometry diffusion (DexGraspNet 2.0), HGC-Net, adapted GraspTTA and ISAGrasp; diffusion / feature ablations.",
      "sim": "Isaac Gym (PhysX)",
      "origin": "Scanned objects + CAD / synthetic clutter",
      "assets": "1,319 objects, 8,270 synthetically assembled scenes, 427M grasp annotations. GraspNet objects plus ShapeNet; 7,600 training / 670 test scenes.",
      "reuse": "Clutter generation, large grasp annotations and held-out geometry evaluation.",
      "caveat": "The scene count means tabletop clutter arrangements, not rooms. Grasp labels are not policy rollout demonstrations.",
      "sources": [
        {
          "label": "Paper",
          "url": "https://arxiv.org/abs/2410.23004"
        },
        {
          "label": "Paper §3",
          "url": "https://raw.githubusercontent.com/mlresearch/v270/main/assets/zhang25j/zhang25j.pdf"
        },
        {
          "label": "Code",
          "url": "https://github.com/PKU-EPIC/DexGraspNet2"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses GraspNet scanned meshes and ShapeNet CAD; authors generate clutter arrangements and grasp annotations. No new mesh purchase reported.",
      "deformable": "No — 0; objects are simulated as rigid bodies.",
      "articulated": "No — 0 active articulated task objects in the rigid grasp protocol."
    },
    {
      "id": "dexsuite",
      "name": "DexSuite",
      "group": "dexterous",
      "status": "Reference · platform",
      "version": "2025 framework / 2026 package",
      "tasks": "15 data environments; reaching, pick/place, stacking, tools and single/bimanual setups.",
      "body": "Website reports Robotiq and dexterous-hand tables; supported hand/arm catalog is larger than the evaluated subset.",
      "models": "BC-G, BC-GMM, Transformer and Diffusion in the project tables.",
      "sim": "Genesis (package documentation)",
      "origin": "Authored task scenes",
      "assets": "150k multimodal frames across 15 environments. Unique mesh inventory and scan provenance not stated.",
      "reuse": "Modular robot combinations, teleoperation, retargeting and dataset-format converters.",
      "caveat": "Many tasks can be solved by parallel grippers, so the whole platform is not added to Scope’s strict dexterous category.",
      "sources": [
        {
          "label": "Project / results",
          "url": "https://dexsuiteorg.github.io/"
        },
        {
          "label": "Package / engine",
          "url": "https://pypi.org/project/dexsuite/"
        }
      ],
      "kind": "Platform reference",
      "assetSource": "Platform-provided task assets; upstream mesh suppliers, self-built versus purchased proportions not reported in the checked release.",
      "deformable": "Unverified — presence and count not established.",
      "articulated": "Unverified — presence and count not established."
    },
    {
      "id": "partnr",
      "name": "PARTNR",
      "group": "mobile",
      "status": "Reference · agent benchmark",
      "version": "2024 paper",
      "tasks": "Collaborative household rearrangement with temporal, spatial and heterogeneous-agent constraints.",
      "body": "Simulated human and robot collaboration; actions are exposed through a skill API.",
      "models": "LLM planning agents including Llama-3.1-70B and a fine-tuned 8B planner, over supplied skills.",
      "sim": "Habitat 3.0",
      "origin": "Authored synthetic homes",
      "assets": "100k natural-language tasks in 60 HSSD houses with 5,819 unique objects. Task count is not scene count.",
      "reuse": "Collaborative task generation, temporal success checks and HSSD scene interfaces.",
      "caveat": "Primarily measures high-level planning/reasoning. Kept as a related reference rather than a low-level policy benchmark.",
      "sources": [
        {
          "label": "Paper / protocol",
          "url": "https://arxiv.org/html/2411.00081v1"
        },
        {
          "label": "Code",
          "url": "https://github.com/facebookresearch/partnr-planner"
        }
      ],
      "kind": "Agent reference",
      "assetSource": "Reuses HSSD authored indoor scenes and object assets; PARTNR generates task specifications. Per-object procurement details not separately reported.",
      "deformable": "Not established — no deformable simulation inventory reported.",
      "articulated": "Not established for the evaluation subset; unique articulated count not reported."
    },
    {
      "id": "dexbench",
      "name": "DexBench (RLWRLD)",
      "group": "dexterous",
      "status": "Reference · task framework",
      "version": "2026 task specification",
      "tasks": "18 industrial manipulation tasks / 55 cases; insertion, fastening, tool use, deformables and precision handling.",
      "body": "Hardware-agnostic task definitions; no evaluated robot matrix verified.",
      "models": "No model comparison established on the checked site.",
      "sim": "Real-object specification; simulator not specified",
      "origin": "Real only",
      "assets": "Purchasable physical object specifications. No downloadable simulation mesh corpus verified.",
      "reuse": "Task design, difficulty dimensions, physical object shopping/specification lists.",
      "caveat": "The framework defines dexterity by task complexity, including grippers; it differs from Scope’s finger-hand criterion.",
      "sources": [
        {
          "label": "Task framework",
          "url": "https://dexbench.org/"
        }
      ],
      "kind": "Task reference",
      "assetSource": "Specifies purchasable real-world objects for physical tests; no verified simulation mesh release. Physical purchases do not imply licensed digital assets.",
      "deformable": "N/A for simulation — physical deformable-object count not verified.",
      "articulated": "N/A for simulation — physical articulated-object count not verified."
    },
    {
      "id": "momagen",
      "name": "MoMaGen",
      "group": "mobile",
      "status": "Added",
      "version": "ICLR 2026 / original evaluation",
      "tasks": "Four household tasks: Pick Cup, Tidy Table, Put Dishes Away, Clean Frying Pan; three randomization levels.",
      "body": "Galaxea R1 wheeled dual-arm robot; TIAGo cross-embodiment data-generation example.",
      "models": "WB-VIMA and π0; data-generation comparisons against SkillMimicGen and DexMimicGen. Main policy experiments use selected task/variation combinations.",
      "sim": "OmniGibson / Isaac Sim",
      "origin": "Authored task scenes",
      "assets": "BEHAVIOR-inspired interactive scenes; four task setups, one 1–3 minute source demo per task. 1,000 generated demos per selected training condition; 500/1,000/2,000 scaling study. Unique meshes not stated.",
      "reuse": "Base/arm planning constraints, camera visibility constraints, bimanual demonstrations and object layout variation.",
      "caveat": "Generation success differs from learned policy success. Reuses a simulator/asset ecosystem rather than releasing thousands of distinct houses.",
      "sources": [
        {
          "label": "Paper §§5 / appendix",
          "url": "https://arxiv.org/html/2510.18316v1"
        },
        {
          "label": "Project",
          "url": "https://momagen-iclr2026.github.io/"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Uses OmniGibson / BEHAVIOR-derived interactive scenes and authors task variations; generated demonstrations are not newly created meshes. Upstream licensed assets retain their restrictions.",
      "deformable": "Not established for these four tasks; OmniGibson support alone does not prove inclusion.",
      "articulated": "Yes — household articulated fixtures in task scenes; unique model total not reported."
    },
    {
      "id": "momani",
      "name": "MoMani / EchoVLA",
      "group": "mobile",
      "status": "Added",
      "version": "EchoVLA v2 evaluation",
      "tasks": "Four RoboCasa manipulation tasks with distant starts / follow-up navigation, plus navigation-only tests; real mobile tasks separately.",
      "body": "Simulated RoboCasa mobile manipulator (exact config unverified); real TidyBot++.",
      "models": "EchoVLA, BC-T, DP3, WB-VIMA and π0.5 on mobile tasks; Diffusion Policy also appears in manipulation/navigation table.",
      "sim": "RoboCasa / MuJoCo; real TidyBot++",
      "origin": "Procedural + mixed objects",
      "assets": "Reuses RoboCasa kitchens; separate MoMani scene/mesh/demo totals not established in the checked paper. Real evaluation uses a 7 m × 7 m arena.",
      "reuse": "Memory-dependent navigation–manipulation composition and base/arm action decomposition.",
      "caveat": "Do not inherit the whole RoboCasa asset count as the MoMani evaluated subset. Broad benchmark claims exceed the four-task published simulation table.",
      "sources": [
        {
          "label": "Paper §5 / Table 2",
          "url": "https://arxiv.org/html/2511.18112v2"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses RoboCasa kitchen assets for simulation; authors separately build the real TidyBot++ arena. No separate sim-asset purchase collection reported.",
      "deformable": "Not established for the evaluated RoboCasa subset.",
      "articulated": "Not established for the four-task subset; upstream RoboCasa supports articulated fixtures."
    },
    {
      "id": "humanoidarena",
      "name": "HumanoidArena",
      "group": "loco",
      "status": "Added",
      "version": "June 2026 / released toolkit",
      "tasks": "Seven leg-critical human–object / human–scene interaction tasks; balance, posture, foot placement and whole-body reorientation.",
      "body": "Unitree G1; intermediate whole-body actions executed by TWIST2 or SONIC trackers.",
      "models": "ACT, Diffusion Policy, Flow Matching and π0.5; in-tracker and cross-tracker tests using TWIST2 / SONIC (low-level trackers).",
      "sim": "Isaac Lab / Isaac Sim",
      "origin": "Authored task scenes",
      "assets": "Seven designed task families; downloadable simulation assets and LeRobot data. Exact unique scene/mesh totals not stated in the release overview.",
      "reuse": "Teleoperation, canonical 40D action interface, whole-body task environments and tracker transfer tests.",
      "caveat": "Some tasks are human–scene interaction rather than object manipulation. The same high-level policy can change performance when the low-level tracker changes.",
      "sources": [
        {
          "label": "Paper",
          "url": "https://arxiv.org/html/2606.17833v1"
        },
        {
          "label": "Released code / assets",
          "url": "https://github.com/William-wAng618/HumanoidArena"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Project-authored task layouts and released simulation assets; per-mesh external suppliers or purchase details not disclosed.",
      "deformable": "Not established — sofa/football appearance alone does not establish simulated deformation.",
      "articulated": "Yes — OpenDoor task includes an articulated door; exact unique model total not reported."
    },
    {
      "id": "fetchman",
      "name": "FetchMan-Bench",
      "group": "loco",
      "status": "Added",
      "version": "August 2026 v1",
      "tasks": "Reach-and-pick; separate terminal manipulation and full locomotion-to-grasp success. 100 held-out initializations.",
      "body": "Unitree G1 with Dex1-1 gripper and fixed SONIC lower-body controller.",
      "models": "FetchMan-BC versus FetchMan (BC + Flow-GRPO); DINOv3/SigLIP and delta/absolute action ablations.",
      "sim": "MolmoSpaces-based pipeline; engine configuration pending verification",
      "origin": "Procedural synthetic",
      "assets": "MolmoSpaces scene pools: ProcTHOR-10k, Holodeck and ProcTHOR-Objaverse. ~150k procedural training scenes / bowl-pick demos (~650 h); multi-object extension: 350k demos. Evaluation: 100 held-out initializations.",
      "reuse": "Synthetic whole-body demonstration pipeline, held-out evaluation and BC-to-RL refinement.",
      "caveat": "Narrow fetch task family, not a general household suite. Fixed low-level controller constrains balance adaptation.",
      "sources": [
        {
          "label": "Paper §§4–6",
          "url": "https://arxiv.org/html/2608.17027v1"
        }
      ],
      "kind": "Benchmark",
      "assetSource": "Reuses MolmoSpaces / ProcTHOR-10k, Holodeck and ProcTHOR-Objaverse scene pools; procedurally assembles training scenes. New demonstration generation is not new mesh creation.",
      "deformable": "Not established — no deformable-object count reported for reach-and-pick.",
      "articulated": "Not established in evaluated subset; scene asset availability does not prove articulated interaction."
    },
    {
      "id": "molmospaces",
      "name": "MolmoSpaces",
      "group": "mobile",
      "status": "Reference · platform",
      "version": "2026 ecosystem / v0.2.9 stable evaluation release",
      "tasks": "Eight benchmark task families across navigation and manipulation; each published board/subset has its own scope.",
      "body": "Multiple robot configurations; the DROID/Franka pick board is not evidence of continuous mobile-base evaluation.",
      "models": "Policy benchmarks and a policy zoo are provided; use the specific board protocol for evaluated model names.",
      "sim": "MuJoCo runtime; assets also target Isaac / ManiSkill",
      "origin": "Authored + procedural + mixed objects",
      "assets": "230k+ indoor environments, 130k object assets; 48k manipulable objects / 42M grasps. Includes authored and procedural scenes, not 230k real scans.",
      "reuse": "Large reusable environment/mesh ecosystem, grasp generation, teleoperation and benchmark generation.",
      "caveat": "Catalog asset counts do not describe a single evaluated task split. Treat as an asset/platform reference here; Scope may list subsets elsewhere.",
      "sources": [
        {
          "label": "Paper",
          "url": "https://arxiv.org/abs/2602.11337"
        },
        {
          "label": "Code / version",
          "url": "https://github.com/allenai/molmospaces"
        },
        {
          "label": "Board",
          "url": "https://molmospaces.allen.ai/leaderboard/ms"
        }
      ],
      "kind": "Platform reference",
      "assetSource": "Aggregates authored/procedural scenes and object assets, including ProcTHOR and Objaverse-related pools; converts assets for simulation. Procurement details vary upstream.",
      "deformable": "Unverified — no inventory of simulated deformable models established.",
      "articulated": "Unverified — 48k manipulable objects is not an articulated-object count."
    }
  ],
  "assets": [
    {
      "name": "Interactive homes",
      "ids": [
        "hab",
        "mshab",
        "ovmm"
      ],
      "text": "ReplicaCAD for rearrangement and articulated furniture; HSSD for varied homes. ReplicaCAD is scan-informed CAD; HSSD is authored synthetic housing. Start with the native Habitat or ManiSkill scene loader.",
      "access": "ReplicaCAD explicitly uses CC BY 4.0. HSSD and movable-object packs have separate terms."
    },
    {
      "name": "Household state changes",
      "ids": [
        "behavior",
        "momagen"
      ],
      "text": "BEHAVIOR / OmniGibson for task predicates, cleaning, articulation and material/state changes. MoMaGen adds whole-body demonstration generation in the same ecosystem.",
      "access": "Use the BEHAVIOR asset download workflow and terms; pin the challenge/version when reproducing results."
    },
    {
      "name": "Kitchen policy evaluation",
      "ids": [
        "robocasa365",
        "robocasa"
      ],
      "text": "RoboCasa for procedural kitchens, appliance interactions and imitation/VLA baselines. Choose the original or 365 protocol before collecting data.",
      "access": "Assets combine several sources; consult asset-specific terms. Existing MuJoCo loaders reduce integration work."
    },
    {
      "name": "Humanoid whole-body control",
      "ids": [
        "simple",
        "hmg",
        "humanoidarena",
        "fetchman"
      ],
      "text": "SIMPLE for varied visual scenes; HumanoidMimicGen for generated industrial demonstrations; HumanoidArena for tracker-dependent execution; FetchMan for navigation-to-grasp.",
      "access": "Retain the lower-body controller and action interface. “Supports G1” alone does not make policies interchangeable."
    },
    {
      "name": "Dexterous task objects",
      "ids": [
        "dexart",
        "dexjoco",
        "dexverse",
        "bench2dex"
      ],
      "text": "DexArt for held-out articulated geometry; DexJoCo for functional tools; DexVerse for diverse task templates; Bench2Dex for visuo-tactile and hand variation.",
      "access": "Verify source asset licenses, contact/joint parameters and hand retargeting. Bench2Dex background rooms are visual-only."
    },
    {
      "name": "Grasps and large scene pools",
      "ids": [
        "dexgraspbench",
        "dexgraspnet2",
        "molmospaces",
        "grbench"
      ],
      "text": "Use DexGraspBench / DexGraspNet for object-centric grasp evaluation; MolmoSpaces / released GRScenes for environment diversity. These collections solve different parts of the pipeline.",
      "access": "Distinguish released asset packs from the source collection. Grasp labels do not replace long-horizon robot demonstrations."
    }
  ],
  "audit": [
    {
      "title": "Was the original Scope complete?",
      "items": [
        "No. The starting categories had 7 Mobile, 4 Loco and 4 Dexterous entries. This audit retains all 15 and adds named evaluation suites with primary sources.",
        "Newer versions and narrow task suites matter: RoboCasa365, MoMaGen, MoMani, HumanoidArena, FetchMan-Bench, Shadow Hand, DexMimicGen hand tracks, DexJoCo, DexVerse, Bench2Dex, DexGraspBench and DexGraspNet 2.0.",
        "Coverage is a research snapshot, not proof of an exhaustive census. Method papers with private setups, every challenge season and all grasp-dataset derivatives are not treated as independent benchmarks."
      ]
    },
    {
      "title": "Corrections and version boundaries",
      "items": [
        "RoboCasa original 100-task suite is separated from RoboCasa365’s 365-task library and 50-task live board. Existing Ledger results retain their own protocols.",
        "GRBench manipulation uses AlienGo + Z1 in the original paper; H1 is the navigation embodiment. It also evaluates high-level model agents over control APIs.",
        "SIMPLE: 60 designed tasks but six in the published model table. ManiSkill-HAB: teleport navigation in a sequential protocol. Bench2Dex: background rooms are rendered without physics."
      ]
    },
    {
      "title": "Adjacent work and remaining coverage",
      "items": [
        "PARTNR (planning agents), DexSuite (general platform), DexBench (physical task definitions) and MolmoSpaces (asset ecosystem) are searchable references; they are excluded from the default benchmark count.",
        "Further named candidates for a later release audit: DexH2R (dynamic handover), DexHoldem (real poker), DClaw / ROBEL (real and simulated dexterous control), and BEHAVIOR-100 / iGibson (predecessors). They are not silently counted as covered.",
        "General simulators (Isaac Lab, MuJoCo, SAPIEN), object datasets (Objaverse, PartNet-Mobility) and data-generation methods are not interchangeable with a benchmark protocol."
      ]
    },
    {
      "title": "How to read the evidence",
      "items": [
        "Every row links primary sources and labels its release or paper. “Pending”, “not stated” and “unverified” preserve gaps rather than inventing asset counts or model identities.",
        "Supported robots, evaluated robots and a robot used for real transfer can be different. Model tables are not a guarantee of evaluation across every supported hand.",
        "Reuse guidance is an assessment from documentation, not a tested simulator installation. Pin versions and verify per-asset permissions and physics before importing."
      ]
    }
  ]
};
