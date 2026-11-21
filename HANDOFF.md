# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `0ae65fe`
- **Working tree:** Uncommitted medkit pickup implementation, regression test, and documentation updates.
- **Done this session:** Committed and pushed server bind hardening. Added seeded medkit pickups to selected track chunks, with healing, collection, and rendering.
- **Checks and exact results:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh` passes, including `ok seeded medkit pickup and healing`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; obstacle families, wind/lift, other pickup types, and multiplayer remain unimplemented.
- **Next step:** Port a small static peg/bumper obstacle set and validate collision behavior.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
