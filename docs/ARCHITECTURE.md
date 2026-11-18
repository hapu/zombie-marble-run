# Architecture

Single-page browser game: one `index.html`, no build step, free/MIT libraries only.

## Components
- `index.html` — the page: canvas, status line, loads `vendor/matter.min.js` (classic script) then `src/main.js` (ES module).
- `src/main.js` — bootstrap: creates the Matter engine and renderer, adds the ground and a placeholder marble, wires mouse dragging and resize.
- `vendor/matter.min.js` — Matter.js 0.20.0 (MIT), vendored and pinned for offline use; license in `vendor/LICENSE.matter`.
- `prototypes/NN-<name>/` — the five incoming games, kept self-contained until merged.
- `assets/` — shared sprites and audio.
- `scripts/serve.sh` — static dev server (`python3 -m http.server`), no Node needed.
- `tests/smoke.sh` — serves the repo and checks the page, engine, and bootstrap load.

## Data flow
Page loads Matter → `src/main.js` builds the world → `Runner` steps the engine → `Render` draws to the canvas. Prototypes contribute bodies, rules, and assets that move into `src/` and `assets/`.

## Constraints
- No 3D, no non-free libraries; vanilla JS + canvas.
- Must run on a 4 GB Chromebook and an Android phone.
- Small modules so free-tier assistants stay within context limits.
