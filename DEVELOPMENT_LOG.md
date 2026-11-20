# Development Log

Newest first. Archive old entries once this passes 3,000 words.

## 2026-11-19
- Change or experiment: Audited docs against the tracked Six variant and current modules; added `src/input.js` to the architecture and corrected the stale placeholder-marble/pointer-impulse description, clarified README build wording, added the variant to the prototype inventory, and refreshed the handoff.
- Result: Documentation matches the current files; `bash scripts/check-words.sh` passes.

## 2026-11-19
- Change or experiment: Reconciled the handoff and Six docs with the now-tracked `marble-race.html`, merged the overlapping physics-scale and audit tasks in `TODO.md`, and hardened `tests/smoke.sh` to pick a free port and poll for readiness instead of using port 8123 and a fixed sleep.
- Result: `bash scripts/check-words.sh && bash tests/smoke.sh` pass; smoke tests no longer depend on a specific port or startup timing.

## 2026-11-19
- Change or experiment: Tracked the externally added `prototypes/Six/marble-race.html` balance/visual variant and documented it as part of the Six prototype.
- Result: The variant now has git provenance; working tree clean after commit.

## 2026-11-20
- Change or experiment: Separated shared game constants from physics and renderer dependencies, and added `scripts/build-offline.py` to inline the module graph and vendored Rapier engine into `dist/zombie-marble-run.html`.
- Result: Offline build succeeds at roughly 3.3 MB; the smoke test now verifies that the generated HTML contains the bundled Rapier object and no module imports.

## 2026-11-20
- Change or experiment: Reconciled project documentation with the current Rapier2D implementation and identified the source files intended for direct user editing.
- Result: README now distinguishes live-game files from vendor, tooling, and prototype-reference directories; stale Matter.js-era layout text was removed, and project context, handoff, and prototype analysis were aligned with the current Two-based port.

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
