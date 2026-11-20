# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-20 / linux / Copilot SDK
- **Branch:** feature/repo-scaffold
- **Done this session:** Compared the live `src/` game against all six retained prototypes; documented feature inventory in `prototypes/ANALYSIS.md` and added prioritized high/medium ports to `TODO.md`.
  - `prototypes/Six/marble-race.html` is tracked; its ammo removal, rebalanced weapons, HP/weapon visuals, and per-weapon FX were folded into `Zombie Marble Run.html`, so the two now differ only in cooldowns. `prototypes/Six/marble-race.md` documents both.
  - `tests/smoke.sh` picks a free port and polls readiness instead of using 8123 and `sleep 1`.
  - `TODO.md` merged the scale/fixed-step duplicates into one "Establish the physics contract" task.
  - Corrected stale docs (Six README, architecture components, prototype inventory) and logged the changes.
- **Checks:** `bash scripts/check-words.sh && bash tests/smoke.sh` pass.
- **Known problems:** Physics scale/tick contract unresolved (50 px/m vs current units; 60 vs 120 Hz); only belts ported; obstacles, wind/lift, pickups, replay, audio, map, and leaderboard missing; `Math.random` affects gameplay; no player-marble selection. No prototype implements networked multiplayer. Do not delete `prototypes/Six/marble-race.html` without approval.
- **Next:** Establish the physics contract, then start with the high-priority TODO items: deterministic race configuration and a small tested set of hazards.
- **Repro:** `bash scripts/serve.sh`; optional `python3 scripts/build-offline.py` then open `dist/zombie-marble-run.html`; `bash tests/smoke.sh [port]`.
