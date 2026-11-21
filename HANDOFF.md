# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `05db231`
- **Working tree:** Uncommitted 90-second race cap and boundary test; prior changes are committed and pushed.
- **Done this session:** Measured difficulty outcomes; one normal race stalled at 62% for 150 seconds. Added a 90-second cap and test.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok race time limit boundary`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; difficulty tuning, broader hazard/pickup content, and multiplayer remain open.
- **Next step:** Tune difficulty outcomes across repeatable race samples.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
