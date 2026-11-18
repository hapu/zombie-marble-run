# Development Log

Newest first. Archive old entries once this passes 3,000 words.

## 2026-11-17
- Change or experiment: Analysed the eight prototype drops in `prototypes/`; wrote `prototypes/ANALYSIS.md` with inventory, duplicates, feature/physics comparison, and three consolidation options.
- Result: Most prototypes use Rapier2D (not the scaffolded Matter.js); no prototype has multiplayer. Chose Rapier2D (Option A); removed duplicate Three, the duplicate zip, and empty Five.

## 2026-11-17
- Change or experiment: Scaffolded the repo for the 5 prototypes — `index.html` + `src/main.js` bootstrap, vendored Matter.js 0.20.0 (MIT) with license, `prototypes/` and `assets/` placeholders, `scripts/serve.sh`, `tests/smoke.sh`; documented layout and stack.
- Result: Smoke test passes (page, engine, bootstrap load); `scripts/check-words.sh` passes.

## 2026-11-17
- Change or experiment: Recorded initial project context and TODO (`57ff0fb`), and aligned `AGENTS.md`, `docs/WORKFLOW.md`, and `WORKSHOP.md` around inspect-first/clean-tree pulls, `scripts/check-words.sh`, and explicit commit/push approval (`dd26b89` and workflow doc sync).
- Result: `bash scripts/check-words.sh` passes; workflow rules and context docs are consistent across the repo.
