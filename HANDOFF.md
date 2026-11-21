# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `2ec403f`
- **Working tree:** Uncommitted combat tuning, regression test, and handoff updates.
- **Done this session:** Committed and pushed the offline-startup smoke test. Reduced normal zombie release delay to 0.75 seconds and added a repeatable 20-second race test for shots, kills, hits, and infections.
- **Checks and exact results:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh` passes, including `ok normal race produces combat` and offline startup (`rapier 0.21.0 ready`).
- **Repro / verify command:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; zombies may target infected/finished racers; leading-marble camera can be wrong; dev server exposes the repo on all interfaces; no prototype has networked multiplayer.
- **Next step:** Restrict zombie pursuit and infection collisions to living, unfinished humans.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
