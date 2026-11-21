# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `2c6d7ca`
- **Working tree:** Uncommitted zombie target-filtering code, regression test, and handoff updates.
- **Done this session:** Committed and pushed normal-race combat tuning. Restricted zombie pursuit and infection checks to living, unfinished humans; added a regression for infected, finished, and gone racers.
- **Checks and exact results:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh` passes, including `ok zombie pursuit and infection target filtering`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; leading-marble camera can be wrong; dev server exposes the repo on all interfaces; no prototype has networked multiplayer.
- **Next step:** Fix leading-marble camera selection so it consistently follows the highest-progress racer.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
