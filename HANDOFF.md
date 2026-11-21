# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `1806473`
- **Working tree:** Uncommitted wind/lift zones; ability reset and obstacle port are committed and pushed.
- **Done this session:** Added seeded horizontal wind and vertical lift zones, applying SI accelerations as Rapier forces; added a motion regression.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok seeded wind and lift SI motion`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; broader hazard/pickup content and multiplayer remain unimplemented.
- **Next step:** Balance difficulty and race length.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
