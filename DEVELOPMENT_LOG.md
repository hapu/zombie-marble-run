# Development Log

Newest first, with ISO dates. Archive entries older than the last ~20 once this passes 3,000 words into a separate archive file.

## 2026-11-21
- Change or experiment: Added an execution smoke test for the generated offline HTML using a minimal browser shim.
- Result: The bundle initializes Rapier 0.21.0 and schedules the game loop; `bash tests/smoke.sh` passes.

## 2026-11-20
- Change or experiment: Reviewed the active game, docs, tests, and build/serve workflow; added prioritized pre-port issues and recommendations to `TODO.md`.
- Result: The backlog now calls out the broken offline module graph, a headless race with no combat, target filtering, ineffective seeds, camera selection, development-server exposure, multiplayer scope, and test-doc drift.

## 2026-11-20
- Change or experiment: Resolved the Rapier unit mismatch by converting geometry, gameplay positions/distances, velocities, forces, impulses, and collider density through a 50 px/m SI boundary; set 9.81 m/s² gravity and strengthened solver/CCD settings.
- Result: Existing pixel tuning remains in gameplay/render code; Rapier tests verify scale, preserved marble mass, one-second gravity displacement, and a five-second race simulation. `node tests/physics-units.mjs` passes.

## 2026-11-20
- Change or experiment: Compared the live `src/` game with all six retained prototypes; expanded `prototypes/ANALYSIS.md` with each prototype's implemented features and a prioritized porting list.
- Result: The current race/combat/ability core and major missing candidates are documented; confirmed no retained prototype implements networked multiplayer. `bash scripts/check-words.sh && bash tests/smoke.sh` (to run).
- Change or experiment: Converted the analysis's high- and medium-priority prototype recommendations into actionable `TODO.md` items.
- Result: Recommended ports are ordered by priority, including determinism/configuration, course content, race feedback, combat presentation, mobile/audio, and testing.

## 2026-11-19
- Change or experiment: Pulled the SI physics and prioritized-port commits, merged the workshop-template workflow/context sync, added `scripts/check-repo.sh`, and fixed the offline bundle to include `src/physicsUnits.js`.
- Checks / result: `bash scripts/check-words.sh`, `bash scripts/check-repo.sh`, `node tests/physics-units.mjs`, and `bash tests/smoke.sh` pass; `scripts/build-offline.py` wrote a 3359 KB build containing `PX_PER_METER`.
- Follow-up: Verify the offline page starts, then establish a repeatable race with real combat before adding hazards or UI.

## 2026-11-19
- Change or experiment: Synced the variant's ammo removal, rebalanced weapons, HP/weapon rendering, and per-weapon FX into `Zombie Marble Run.html`, leaving weapon cooldowns as the only difference, and updated the Six README, variant analysis, prototype inventory, and handoff to match.
- Result: Both Six files are 612 lines and differ by one line; `bash scripts/check-words.sh` passes.

## 2026-11-19
- Change or experiment: Audited docs against the tracked Six variant and current modules; added `src/input.js` to the architecture and corrected the stale placeholder-marble/pointer-impulse description, clarified README build wording, added the variant to the prototype inventory, and refreshed the handoff.
- Result: Documentation matches the current files; `bash scripts/check-words.sh` passes.

## 2026-11-19
- Change or experiment: Reconciled the handoff and Six docs with the now-tracked `marble-race.html`, merged the overlapping physics-scale and audit tasks in `TODO.md`, and hardened `tests/smoke.sh` to pick a free port and poll for readiness instead of using port 8123 and a fixed sleep.
- Result: `bash scripts/check-words.sh && bash tests/smoke.sh` pass; smoke tests no longer depend on a specific port or startup timing.

## 2026-11-19
- Change or experiment: Tracked the externally added `prototypes/Six/marble-race.html` balance/visual variant and documented it as part of the Six prototype (weapon rebalance, infinite ammo, HP/weapon visuals, per-weapon FX).
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
