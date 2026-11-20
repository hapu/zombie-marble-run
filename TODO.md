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
- [x] Establish the physics contract
  - [x] Use SI meters in Rapier with a 50 px/m conversion boundary
  - [x] Keep the fixed step at 60 Hz; use 9.81 m/s² gravity, 6 solver iterations, and 4 CCD substeps
  - [x] Define the standard human marble as radius 9 px (0.18 m), approximately 0.51 kg
  - [x] Convert world geometry, gameplay positions/distances, velocities, forces, impulses, and collider density consistently
  - [x] Preserve gameplay tuning in pixel units while converting physics inputs and outputs
- [ ] Resolve baseline issues before porting more features
  - [ ] Include `src/physicsUnits.js` in the offline bundle and verify the generated page starts; current smoke checks do not execute the bundle
  - [ ] Make a normal race produce combat; tune zombie release/pursuit and weapon engagement, then assert outcomes in a repeatable race test
  - [ ] Restrict zombie pursuit and infection collisions to living, unfinished humans
  - [ ] Fix leading-marble camera selection so it consistently follows the highest-progress racer
  - [ ] Decide the minimum multiplayer requirement (local/shared-device or networked) before architecture and polish work
  - [ ] Limit the development server's network exposure or serve only a safe build directory; document trusted-LAN use
- [ ] Port remaining chunk families/content (obstacles, wind/lift, pickups)
- [ ] Balance difficulty and race length
- [ ] Physics audit follow-up
  - [ ] Reset ability state and target per race
  - [ ] Add no-progress rescue and teleport diagnostics
  - [ ] Render belts and weapon effects
  - [ ] Restore obstacles and row-drop geometry
  - [ ] Add headless physics assertions

## High priority prototype ports
- [ ] Make races reproducible and configurable
  - [ ] Use the seed for course variation and all gameplay-affecting random rolls; add manual, random, daily, and shareable seed controls
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
- [ ] Document Node as a test prerequisite or make the physics test runnable without adding a Node requirement to the lightweight workflow
- [ ] Align README check instructions and development-log status with the current smoke/build checks

## Later
- [ ] Optional prediction scoring/streaks and hosted/local leaderboard
- [ ] Polish pass: feel and presentation
