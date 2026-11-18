# Architecture

Single-page browser game: one `index.html`, no build step, free/open-source libraries only.

## Components
- `index.html` — the page: canvas, status line, loads `src/main.js` as an ES module.
- `src/main.js` — bootstrap: initializes Rapier2D, creates the world, ground, and placeholder marble, runs a fixed 60 Hz step, draws with canvas, handles resize and pointer impulse.
- `vendor/rapier.mjs` — Rapier2D 0.21.0 (Apache-2.0), the `-compat` build with the WASM embedded; vendored and pinned for offline use. License in `vendor/LICENSE.rapier`.
- `prototypes/NN-<name>/` — the incoming games, kept self-contained until merged.
- `assets/` — shared sprites and audio.
- `scripts/serve.sh` — static dev server (`python3 -m http.server`), no Node needed.
- `tests/smoke.sh` — serves the repo and checks the page, engine, and bootstrap load.

## Data flow
Page loads `src/main.js` → `RAPIER.init()` starts the embedded physics module → the loop accumulates time and steps the world at 60 Hz → canvas draws bodies from Rapier transforms. Prototypes contribute bodies, rules, and assets that move into `src/` and `assets/`.

## Constraints
- No 3D, no non-free libraries; vanilla JS + canvas.
- Must run on a 4 GB Chromebook and an Android phone.
- Small modules so free-tier assistants stay within context limits.
