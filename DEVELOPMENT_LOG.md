# Development Log

Newest first. Archive old entries once this passes 3,000 words.

## 2026-11-18
- Change or experiment: Verified and filled the provider table in `docs/PROVIDERS.md` from official pages (Google, Groq, Cerebras, Mistral, NVIDIA, Cloudflare, Hugging Face, OpenRouter).
- Result: `scripts/check-words.sh` passes. Recorded Mistral's docs conflict and NVIDIA's unstated limits rather than guessing.

## 2026-11-17
- Change or experiment: Swapped the scaffold from Matter.js to vendored Rapier2D 0.21.0 (Apache-2.0, `-compat` build with embedded WASM); rewrote `src/main.js` with a fixed-step loop and canvas renderer; updated smoke test and docs.
- Result: `scripts/check-words.sh` passes; smoke test passes; Rapier world initializes offline (verified in Node with the vendored file).

## 2026-11-17
- Change or experiment: Analysed the eight prototype drops in `prototypes/`; wrote `prototypes/ANALYSIS.md` with inventory, duplicates, feature/physics comparison, and three consolidation options.
- Result: Most prototypes use Rapier2D (not the scaffolded Matter.js); no prototype has multiplayer. Chose Rapier2D (Option A); removed duplicate Three, the duplicate zip, and empty Five.

## 2026-11-17
- Change or experiment: Scaffolded the repo for the 5 prototypes — `index.html` + `src/main.js` bootstrap, vendored Matter.js 0.20.0 (MIT) with license, `prototypes/` and `assets/` placeholders, `scripts/serve.sh`, `tests/smoke.sh`; documented layout and stack.
- Result: Smoke test passes (page, engine, bootstrap load); `scripts/check-words.sh` passes.

## 2026-11-17
- Change or experiment: Recorded initial project context and TODO (`57ff0fb`), and aligned `AGENTS.md`, `docs/WORKFLOW.md`, and `WORKSHOP.md` around inspect-first/clean-tree pulls, `scripts/check-words.sh`, and explicit commit/push approval (`dd26b89` and workflow doc sync).
- Result: `bash scripts/check-words.sh` passes; workflow rules and context docs are consistent across the repo.
