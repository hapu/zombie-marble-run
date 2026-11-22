# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / opencode
- **Branch / base commit:** feature/repo-scaffold / `7513f1f`
- **Working tree:** Uncommitted physics fix and test updates in `src/entities.js`, `tests/zones.mjs`, `tests/d2-stall.mjs`, plus regenerated `dist/zombie-marble-run.html`.
- **Done this session:** Diagnosed marbles pinning to the right wall. Rapier `addForce` persists across steps, and wind/lift/zombie forces were never cleared, so the force grew every step and overwhelmed the velocity cap. Now reset forces per step before reapplying them. Also corrected the zombie speed cap to `VMAX * zv` (matching prototype Two) and made the D2 rescue test synthesize a stall instead of relying on the old force-induced pile-up.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok seeded wind and lift SI motion`, `ok normal race produces combat`, and `ok stalled D2 racers are staggered and recorded`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`.
- **Known problems / decisions needed:** Gameplay seed still ineffective; difficulty/race-outcome tuning remains open. The D2 rescue is now a dormant safety net covered by a synthetic test.
- **Next step:** Tune difficulty outcomes across repeatable race samples and verify feel in the browser.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files by hand.
