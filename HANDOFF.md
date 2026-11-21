# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `84b9ac1`
- **Working tree:** Uncommitted offline startup smoke-test and documentation updates.
- **Done this session:** Added a runtime check that executes the generated offline bundle, verifies Rapier initializes, and confirms the game loop is scheduled.
- **Checks and exact results:** `bash scripts/check-words.sh`, `bash scripts/check-repo.sh`, and `bash tests/smoke.sh` pass; offline startup reports `rapier 0.21.0 ready`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`; optional `bash scripts/serve.sh`.
- **Known problems / decisions needed:** Repeatable race may not produce combat; gameplay seed is ineffective; zombies may target infected/finished racers; leading-marble camera can be wrong; dev server exposes the repo on all interfaces; no prototype has networked multiplayer.
- **Next step:** Make a normal race produce combat and assert its outcome in a repeatable test.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
