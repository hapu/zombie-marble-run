# TODO

## Now
- [x] Prepare the repo to receive the code of 5 prototypes
  - [x] Single-page entry (`index.html`) and bootstrap (`src/main.js`)
  - [x] Vendor Matter.js 0.20.0 with license (`vendor/`)
  - [x] Add `prototypes/` and `assets/` placeholders
  - [x] Dev server and smoke test (`scripts/serve.sh`, `tests/smoke.sh`)
  - [x] Document structure, decisions, and run steps
- [x] Analyse the prototypes (`prototypes/ANALYSIS.md`)
  - [x] Decide the engine/base: Rapier2D (Option A), Matter.js (Option B), or React+Rapier (Option C) → Option A
  - [x] Decide whether to commit prototypes and remove duplicates (`Three`, zip) and empty `Five` → trim and commit

## Next
- [x] Swap the scaffold to vanilla + vendored Rapier2D 0.21 (replace Matter.js)
- [x] Review prototypes and choose the shared physics/gameplay core
- [ ] Set up the base game in `src/` from the `Two` gameplay
- [ ] Define the single-page game loop and scene structure

## Later
- [ ] Multiplayer design
- [ ] Polish pass: feel, sound, touch controls
