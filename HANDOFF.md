# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `0d7e352`
- **Working tree:** Uncommitted static peg/bumper port; ability reset is committed and pushed.
- **Done this session:** Added sparse static pegs and lone/pair bumpers to seeded track chunks; added a Rapier collision/scale regression.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok seeded static pegs and bumper physics`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; wind/lift, other pickup types, and multiplayer remain unimplemented.
- **Next step:** Add wind and lift zones with tested SI force/motion tuning.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
