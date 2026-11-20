# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-20 / linux / Copilot SDK in VS Code
- **Branch:** feature/repo-scaffold
- **Done this session:** Separated shared configuration from physics and rendering, and added an offline one-file build.
  - Added `src/gameConfig.js` for shared, presentation-neutral constants.
  - Removed rendering's dependency on the world/physics module.
  - Added `scripts/build-offline.py` to bundle the HTML, modules, assets, and vendored Rapier2D.
  - Added the real-life marble scale task and subtasks to `TODO.md`.
  - Updated smoke tests to validate the offline bundle.
- **Checks:** `bash scripts/check-words.sh && bash tests/smoke.sh` pass.
- **Known problems:** Only flat belts are ported in `src/`; chunk families, obstacles, wind/lift, pickups, replay, audio, map, and leaderboard are missing (`up` layouts disabled). Zombie spawn uses `Math.random`. No player-marble selection. `prototypes/Six/marble-race.html` is untracked and externally added; do not delete it without approval.
- **Next:** Continue the port with chunk families/content, seeded zombie spawns, and selected-marble controls.
- **Repro:** Run `bash scripts/serve.sh` for the module build, or `python3 scripts/build-offline.py` and open `dist/zombie-marble-run.html` directly. Browse prototypes by opening their HTML files directly, or run `npm install && npm run dev` in `prototypes/Four` or `prototypes/Eight`.
