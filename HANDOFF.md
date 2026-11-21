# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `5c26eef`
- **Working tree:** Uncommitted server bind hardening, regression test, and documentation updates.
- **Done this session:** Committed and pushed the camera fix. Made the development server loopback-only by default; `--lan` explicitly opts into unauthenticated all-interface serving.
- **Checks and exact results:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh` passes, including `ok development server bind modes`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; no prototype has networked multiplayer.
- **Next step:** Port remaining chunk families and content (obstacles, wind/lift, pickups).
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
