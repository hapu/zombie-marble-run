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
- [ ] Establish the physics contract (decisions pending)
  - [ ] Decide scale: pixels at 50 px/m with gravity 490.5, or keep current floaty units
  - [ ] Decide fixed step: 60 Hz or 120 Hz
  - [ ] Define standard marble dimensions and mass for the chosen scale
  - [ ] Convert chunk, obstacle, weapon, zombie, and race distances consistently
  - [ ] Rebalance velocity, gravity, forces, friction, and restitution at that scale
- [ ] Port remaining chunk families/content (obstacles, wind/lift, pickups)
- [ ] Balance difficulty and race length
- [ ] Physics audit follow-up
  - [ ] Make RNG seeded and difficulty effective
  - [ ] Reset ability state and target per race
  - [ ] Exclude infected/finished marbles from human targets
  - [ ] Add no-progress rescue and teleport diagnostics
  - [ ] Render belts and weapon effects
  - [ ] Restore obstacles and row-drop geometry
  - [ ] Add headless physics assertions

## High priority prototype ports
- [ ] Make races reproducible and configurable
  - [ ] Seed gameplay randomness and add manual, random, daily, and shareable seed controls
  - [ ] Add participant selection, patient-zero count, and difficulty settings
  - [ ] Reset per-race ability and target state
- [ ] Port a small, balanced set of course hazards and pickups; validate each against the physics contract before expanding
- [ ] Add marble follow/cycle selection, standings, map, finish order/results, pause, and rematch
- [ ] Improve combat feedback with visible weapons, segmented HP, retained aim, and per-weapon effects; decide ammo policy
- [ ] Add mobile-safe touch controls and fullscreen fallback
- [ ] Add WebAudio cues for combat, pickups, hazards, and race results
- [ ] Add highlight replay for race moments

## Medium priority prototype ports
- [ ] Add simulation speed controls (0.5x–4x)
- [ ] Add responsive portrait/landscape layout and adaptive rendering quality
- [ ] Add a lightweight debug/performance overlay
- [ ] Expand validated hazards and routes with portals, spinners, magnets, fans, lifts, drops, and wind
- [ ] Add seed/simulation verification tests and physics/render benchmarks

## Later
- [ ] Multiplayer design
- [ ] Optional prediction scoring/streaks and hosted/local leaderboard
- [ ] Polish pass: feel and presentation
