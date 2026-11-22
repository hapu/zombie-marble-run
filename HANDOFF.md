# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / opencode
- **Branch / base commit:** feature/repo-scaffold / `7020242` (force-accumulation fix, pushed)
- **Working tree:** Uncommitted `tests/physics-regressions.mjs`, `tests/smoke.sh`, `TODO.md`, `DEVELOPMENT_LOG.md`, and this handoff.
- **Done this session:** Fixed Rapier forces accumulating across steps (wind/lift/zombie) by resetting each body's forces per step; matched prototype Two's zombie speed cap. Committed and pushed as `7020242`. Then completed the next TODO item by adding `tests/physics-regressions.mjs`: zone forces clear on exit, belts reach `f*dir*BELT_SPEED` and bleed momentum, and all bodies stay inside the 5x5 course through a seeded 30-second race. Wired it into `tests/smoke.sh` and marked the TODO done.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok zone forces clear, belts bleed off, race stays contained`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`; `node tests/physics-regressions.mjs`.
- **Known problems / decisions needed:** Gameplay seed still ineffective; difficulty/race-outcome tuning remains open.
- **Next step:** Render belts and weapon effects (next unchecked TODO item).
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files by hand.
