# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / opencode
- **Branch / base commit:** feature/repo-scaffold / `969212a` (belts and weapon effects, pushed)
- **Working tree:** clean after committing this batch; `dist/zombie-marble-run.html` regenerated.
- **Done this session:** Fixed Rapier force accumulation (`7020242`), added physics regressions and tightened `AGENTS.md` (`3ab5ad2`), and rendered belts/weapon effects (`969212a`). Then restored prototype Two's row-drop geometry in `src/world.js`: D1/U1 split converging belts, D1 central bumper/peg, D2 landing pegs with the incorrect D2 lift removed, central 104 px transition drop slots, and a diagonal H peg layout. Added `tests/row-drop.mjs` (geometry, landing/lift checks, 15 s progress) and wired it into `tests/smoke.sh`; updated `tests/zones.mjs` to source the lift from an upward race and `tests/obstacles.mjs` to accept mixed peg layouts.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok row drops, landing pegs, and lifts match the prototype`, `ok seeded static pegs and bumper physics`, `ok seeded wind and lift SI motion`, and `ok offline startup (rapier 0.21.0 ready)`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`; `node tests/row-drop.mjs`.
- **Known problems / decisions needed:** Gameplay seed still ineffective; difficulty/race-outcome tuning remains open.
- **Next step:** Balance difficulty and race length (next unchecked TODO item).
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files by hand.
