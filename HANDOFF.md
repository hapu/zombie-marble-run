# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / opencode
- **Branch / base commit:** feature/repo-scaffold / `50cd1d1` (difficulty balance, pushed)
- **Working tree:** clean after committing this batch; `dist/zombie-marble-run.html` regenerated.
- **Done this session:** Balanced difficulty outcomes across repeatable race samples. Fixed normal `zd` bug (0.75 → 1, matching prototype intent). Tuned `DIFFS` in `src/gameConfig.js` via deterministic 3-seed sampling (easy/normal/hard, 90 s cap) to hit targets:
  - Easy: ~95% human finish (14.3/15 avg)
  - Normal: ~44% finish, ~56% loss (6.7/15 finish, 1/15 infected, rest timeout) — roughly 50/50
  - Hard: ~2% finish, ~98% loss (0.3/15 finish, 3/15 infected) — zombies usually win
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes all tests.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`; `node /tmp/opencode/balance-sample.mjs`.
- **Known problems / decisions needed:** Infection mechanic underutilized (most losses are no-progress timeouts, not infections); gameplay seed still ineffective; remaining chunk families (spinners, portals, magnets, fans) unported.
- **Next step:** Port remaining chunk families/content (obstacles, wind/lift, pickups) — next unchecked TODO section.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and reference prototypes. Do not edit generated `dist/` or vendor files by hand.