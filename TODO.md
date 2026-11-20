# TODO

## Now
- [x] Prepare the repo to receive the code of 6 prototypes
  - [x] Single-page entry (`index.html`) and bootstrap (`src/main.js`)
  - [x] Vendor Rapier2D 0.21.0 with license (`vendor/`)
  - [x] Add `prototypes/` and `assets/` placeholders
  - [x] Dev server and smoke test (`scripts/serve.sh`, `tests/smoke.sh`)
  - [x] Document structure, decisions, and run steps
- [x] Analyse the prototypes (`prototypes/ANALYSIS.md`)
  - [x] Decide the engine/base: Rapier2D (Option A), Matter.js (Option B), or React+Rapier (Option C) → Option A
  - [x] Decide whether to commit prototypes and remove duplicates (`Three`, zip) and empty `Five` → trim and commit

## Next
- [x] Swap the scaffold to vanilla + vendored Rapier2D 0.21 (replace Matter.js)
- [x] Review prototypes and choose the shared physics/gameplay core
- [x] Set up the base game in `src/` from the `Two` gameplay
- [x] Define the single-page game loop and scene structure
- [ ] Refine physics dimensions, weight, and distances to reflect real-life marbles
  - [ ] Establish a real-world scale, such as standard marble dimensions and mass
  - [ ] Convert chunk, obstacle, weapon, zombie, and race distances consistently
  - [ ] Rebalance velocity, gravity, forces, friction, and restitution at that scale
- [ ] Port remaining chunk families/content (obstacles, wind/lift, pickups)
- [ ] Balance difficulty and race length
- [ ] Physics audit follow-up (decisions pending)
  - [ ] Decide scale contract: pixels at 50 px/m with gravity 490.5, or keep current floaty units
  - [ ] Decide fixed step: 60 Hz or 120 Hz
  - [ ] Make RNG seeded and difficulty effective
  - [ ] Reset ability state and target per race
  - [ ] Exclude infected/finished marbles from human targets
  - [ ] Add no-progress rescue and teleport diagnostics
  - [ ] Render belts and weapon effects
  - [ ] Restore obstacles and row-drop geometry
  - [ ] Add headless physics assertions

## Later
- [ ] Multiplayer design
- [ ] Polish pass: feel, sound, full touch controls, replay/map/leaderboard
