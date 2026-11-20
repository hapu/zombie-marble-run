# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-19 / linux / opencode
- **Branch:** feature/repo-scaffold
- **Done this session:** Tracked the externally added Six variant, hardened the smoke test, consolidated the physics tasks, and documented the variant.
  - `prototypes/Six/marble-race.html` is now tracked; `prototypes/Six/marble-race.md` analyzes it (~58 changed lines: infinite ammo, rebalanced weapons, HP/weapon visuals, per-weapon FX, warm theme).
  - `tests/smoke.sh` picks a free port and polls readiness instead of using 8123 and `sleep 1`.
  - `TODO.md` merged the scale/fixed-step duplicates into one "Establish the physics contract" task.
  - Corrected stale docs (Six README, architecture components, prototype inventory) and logged the changes.
- **Checks:** `node --check src/*.js`; `bash scripts/check-words.sh && bash tests/smoke.sh` pass.
- **Known problems:** Physics scale/tick contract unresolved (50 px/m vs current units; 60 vs 120 Hz); only flat belts ported; obstacles, wind/lift, pickups, replay, audio, map, leaderboard missing; `Math.random` zombie spawn; no player-marble selection. Do not delete `prototypes/Six/marble-race.html` without approval.
- **Next:** Establish the scale/tick contract, then fix determinism/difficulty/ability reset/converted-target handling, then restore visible belts, obstacles, row-drop geometry, and physics assertions.
- **Repro:** `bash scripts/serve.sh`; optional `python3 scripts/build-offline.py` then open `dist/zombie-marble-run.html`; `bash tests/smoke.sh [port]`.
