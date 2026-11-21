# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / Copilot SDK
- **Branch / base commit:** feature/repo-scaffold / `c82bcc5`
- **Working tree:** Uncommitted camera fix, regression test, and handoff updates.
- **Done this session:** Committed and pushed zombie target filtering. Fixed camera leader selection and added a regression for a lower-progress racer following the leader in iteration order.
- **Checks and exact results:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh` passes, including `ok camera follows highest-progress racer`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash scripts/check-repo.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed is ineffective; dev server exposes the repo on all interfaces; no prototype has networked multiplayer.
- **Next step:** Limit the development server's network exposure or serve only a safe build directory; document trusted-LAN use.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
