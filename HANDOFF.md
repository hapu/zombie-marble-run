# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-21 / linux / opencode
- **Branch / base commit:** feature/repo-scaffold / `3ab5ad2` (physics regressions + AGENTS guide, pushed)
- **Working tree:** Uncommitted belt/weapon rendering in `src/render.js` and `src/combat.js`, `tests/render-effects.mjs`, `tests/smoke.sh`, `TODO.md`, `docs/ARCHITECTURE.md`, `DEVELOPMENT_LOG.md`, and this handoff; regenerated `dist/`.
- **Done this session:** Fixed Rapier forces accumulating across steps (`7020242`); added headless physics regressions and tightened `AGENTS.md` (`3ab5ad2`). Then completed the next TODO item: belts render as animated dashed conveyor lines above each chunk floor, and recent `S.shots` fade over 0.14 s with melee/ranged styling. Added `tests/render-effects.mjs` with a mock 2D context and wired it into `tests/smoke.sh`.
- **Checks and exact results:** `bash scripts/check-words.sh && bash tests/smoke.sh` passes, including `ok belts and weapon effects render`, `ok zone forces clear, belts bleed off, race stays contained`, and `ok offline startup (rapier 0.21.0 ready)`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`; `node tests/render-effects.mjs`.
- **Known problems / decisions needed:** Gameplay seed still ineffective; difficulty/race-outcome tuning remains open.
- **Next step:** Restore obstacles and row-drop geometry (next unchecked TODO item).
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files by hand.
