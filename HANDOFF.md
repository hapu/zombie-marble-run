# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-19 / linux / opencode
- **Branch:** feature/repo-scaffold
- **Done this session:** Separated shared config from physics/rendering, added an offline build, and completed a read-only physics audit.
  - Added `src/gameConfig.js`; removed rendering's dependency on the world/physics module.
  - Added `scripts/build-offline.py` to bundle HTML, modules, assets, and vendored Rapier2D; smoke tests cover the bundle.
  - Audit of root `index.html` + `src/`: stable run (~98.5 s, 9 finishers, 4 infections, 338 hits); inconsistent physics scale, invisible belt propulsion, inert seed, hardcoded normal difficulty, abilities reset only per race, converted/finished marbles remain valid targets, weak hitscan knockback, weak no-progress rescue.
- **Checks:** `node --check src/*.js`; `bash scripts/check-words.sh && bash tests/smoke.sh` pass.
- **Known problems:** Scale/tick contract unresolved (50 px/m vs current units; 60 vs 120 Hz); only flat belts ported; obstacles, wind/lift, pickups, replay, audio, map, leaderboard missing; `Math.random` zombie spawn; no player-marble selection. `prototypes/Six/marble-race.html` was added externally and is now tracked; do not delete without approval.
- **Next:** Decide scale/tick contract, then fix determinism/difficulty/ability reset/converted-target handling, then restore visible belts, obstacles, row-drop geometry, and physics assertions.
- **Repro:** `bash scripts/serve.sh` for the module build, or `python3 scripts/build-offline.py` and open `dist/zombie-marble-run.html`.
