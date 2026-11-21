# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `e625cf3`
- **Working tree:** Uncommitted ability-reset change; no other pre-existing edits.
- **Done this session:** Reset ability target, timers, and cooldowns when starting a new race; added a regression test.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok ability state resets between races`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; obstacle families, wind/lift, other pickup types, and multiplayer remain unimplemented.
- **Next step:** Port selected obstacle families and validate collision behavior against the physics scale.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
