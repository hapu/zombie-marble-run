# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-18 / linux / opencode
- **Branch:** feature/repo-scaffold
- **Done this session:** Documented every prototype and updated `Four`'s README.
  - Added `prototypes/One/README.md`, `Two/README.md`, `Six/README.md`, `Seven/README.md`, `Eight/README.md`.
  - Reworked `prototypes/Four/README.md` with features, structure, tests, and unique traits.
  - `Six/README.md` covers both the original Matter.js build and the untracked `marble-race.html` variant (unlimited ammo, rebalanced weapons, weapon/HP visuals, new effects).
  - Docs only; source and game state unchanged. Playable port remains at commit `4da1169`.
- **Checks:** `bash scripts/check-words.sh && bash tests/smoke.sh` pass. Docs are not code-tested.
- **Known problems:** Only flat belts are ported in `src/`; chunk families, obstacles, wind/lift, pickups, replay, audio, map, and leaderboard are missing (`up` layouts disabled). Zombie spawn uses `Math.random`. No player-marble selection. `prototypes/Six/marble-race.html` is untracked and externally added; do not delete it without approval.
- **Next:** Review the new READMEs for accuracy, then continue the port with chunk families/content, seeded zombie spawns, and selected-marble controls.
- **Repro:** `bash scripts/serve.sh` and open `http://localhost:8000/`. Browse prototypes by opening their HTML files directly, or run `npm install && npm run dev` in `prototypes/Four` or `prototypes/Eight`.
