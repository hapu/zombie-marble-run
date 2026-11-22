# AGENTS.md

Instructions for AI coding agents. Keep under 500 words (`scripts/check-words.sh` enforces).

## Environment
- 4 GB RAM Linux CLI. Keep commands, logs, and context small; pipe verbose output to `/tmp/` and tail it.
- Vanilla JS ES modules + HTML5 Canvas, vendored Rapier2D 0.21.0 (`vendor/rapier.mjs`, Apache-2.0), Python 3 server. No package manager or dev build step.
- Node runs the headless tests; there is no `npm install`. `dist/zombie-marble-run.html` is generated but tracked in git (despite `.gitignore`).

## Commands
- Full check: `bash scripts/check-words.sh && bash tests/smoke.sh`
- Single test: `node tests/<name>.mjs` (prefer this while iterating; the smoke suite runs long simulations)
- Dev server: `bash scripts/serve.sh` (loopback only). `--lan` exposes the whole repo unauthenticated on all interfaces.
- Offline build: `python3 scripts/build-offline.py` -> self-contained `dist/zombie-marble-run.html`.
- `tests/smoke.sh` rebuilds `dist/` as a side effect, so the tree can change after a check.

## Read first
`PROJECT_CONTEXT.md`, `HANDOFF.md`, `TODO.md`; then `docs/ARCHITECTURE.md` and `docs/WORKFLOW.md` when touching structure or process. Verify the actual files; never trust a prior assistant's summary.

## Repo-specific gotchas
- Physics uses SI at the Rapier boundary: 50 px = 1 m, 9.81 m/s², fixed 60 Hz, 6 solver iterations, 4 CCD substeps. Keep gameplay/render values in pixels and convert via `src/physicsUnits.js`.
- Rapier `addForce` persists across steps until `resetForces`. `src/entities.js` resets every active body each step; apply zone/chase forces per step, not once and forget.
- `src/render.js` must not import Rapier or mutate physics; it only reads simulation state.
- New files need explicit wiring: `scripts/build-offline.py` has a hardcoded `src/` module list, `tests/smoke.sh` a fixed test list, and `scripts/check-repo.sh` a required-file list. Update the relevant one or the file is silently ignored.
- `prototypes/` are reference sources; copy needed code into `src/` instead of editing them. Do not edit `vendor/`.
- Context docs have enforced word budgets (`AGENTS.md` 500, `HANDOFF.md` 300, `TODO.md` 500, etc.); run `check-words.sh` after editing them.

## Rules
- Never commit to `main`; use short-lived `feature/<topic>` or `fix/<topic>` branches. Commit/push only when explicitly asked; never force-push.
- Do not add dependencies, use paid APIs, delete existing work, or commit secrets without approval.
- Explain the plan before multi-file or structural changes.
- Update `HANDOFF.md` (and `DEVELOPMENT_LOG.md` for notable work) when behavior or decisions change.

## Finish report
Files changed and why; checks run with exact results; limitations/blockers; branch, commit, working-tree state; next recommended task.
