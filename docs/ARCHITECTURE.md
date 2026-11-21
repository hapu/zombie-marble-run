# Architecture

Keep under 600 words. Update when the structure changes.

## Overview
Single-page browser game: one `index.html`, no build step, free/open-source libraries only.

## Components
- `RACE_TIME_LIMIT` in `src/gameConfig.js` caps stalled races at 90 seconds; `tests/race-time-limit.mjs` checks the boundary.
- Static rectangles in `src/world.js` apply configured friction/restitution; mirrored rooftop wind zones follow their chunk. Wind/lift zones store SI `ax`/`ay` accelerations, applied as mass-scaled forces in `src/entities.js`; `tests/zones.mjs` verifies placement and motion.
- `src/entities.js` detects stalled racers in D2 landings, staggers them toward the exit, and records rescue positions in `S.rescues`; `tests/d2-stall.mjs` exercises the deterministic pile-up.
- `index.html` — the page: canvas, status line, loads `src/main.js` as an ES module.
- `src/main.js` — bootstrap: initializes Rapier2D, owns session lifecycle and the fixed 60 Hz accumulator loop, delegates world building and spawning to modules, and wires input, combat, and rendering.
- `src/gameConfig.js` — shared non-Rapier constants for dimensions, teams, zombies, and weapons.
- `src/physicsUnits.js` — SI physics contract: Rapier uses meters and seconds; 50 px = 1 m. Game and renderer values stay in pixels and are converted at Rapier reads/writes.
- `src/world.js` / `src/entities.js` / `src/combat.js` — physics and simulation modules; they may import Rapier and create or mutate bodies. The world creates seeded medkit pickups and static peg/bumper obstacles; entities collect and apply pickups.
- `src/render.js` — canvas-only presentation; it reads simulation state, including pickup markers and static circle obstacles, but must not import Rapier or mutate physics bodies.
- `src/input.js` — keyboard and pointer controls for start/reset, abilities, and restart; no physics dependency.
- `scripts/build-offline.py` — dependency-free bundler that inlines the HTML, source modules, assets, and vendored Rapier engine into `dist/zombie-marble-run.html`.
- `scripts/check-repo.sh` — checks required context files, tracked secrets, shell syntax, and local Markdown links.
- `vendor/rapier.mjs` — Rapier2D 0.21.0 (Apache-2.0), the `-compat` build with the WASM embedded; vendored and pinned for offline use. License in `vendor/LICENSE.rapier`.
- `prototypes/<Name>/` — the incoming games (`One`, `Two`, `Four`, `Six`, `Seven`, `Eight`), kept self-contained until merged.
- `assets/` — shared sprites and audio.
- `scripts/serve.sh` — static dev server (`python3 -m http.server`), loopback-only by default; `--lan` opts into all interfaces.
- `tests/physics-units.mjs` — Node assertions for the SI contract, marble mass, gravity, and a five-second race simulation.
- `tests/d2-stall.mjs` — verifies the repeatable D2 landing stall is rescued and recorded.
- `tests/med-pickup.mjs` — verifies deterministic medkit placement, healing, and single collection.
- `tests/obstacles.mjs` — verifies seeded peg/bumper placement, pixel-to-meter positions, and bumper collision.
- `tests/smoke.sh` — serves the repo, runs repo checks and SI assertions, and checks the page, engine, bootstrap, and offline build.

## Data flow
Page loads `src/main.js` → `RAPIER.init()` starts the embedded physics module → the loop accumulates time and steps the world at 60 Hz with 9.81 m/s² gravity → game measurements convert from pixels to meters at the Rapier boundary, and Rapier transforms convert back to pixels for game logic and canvas drawing. Prototypes contribute bodies, rules, and assets that move into `src/` and `assets/`.

## External dependencies
- Rapier2D 0.21.0 (Apache-2.0), vendored as `vendor/rapier.mjs`; license in `vendor/LICENSE.rapier`.

## Constraints
- No 3D, no non-free libraries; vanilla JS + canvas.
- Must run on a 4 GB Chromebook and an Android phone.
- Small modules so free-tier assistants stay within context limits.

## Edit boundaries
- Files intended for routine editing: `index.html`, `src/`, `assets/`, and context docs.
- Files to leave alone: `vendor/`, generated `dist/`, and the reference-only `prototypes/` unless the task requires it.
- Update `scripts/` and `tests/` only when intentionally changing setup or validation.

## Open questions
- None currently; see `TODO.md` for pending decisions.
