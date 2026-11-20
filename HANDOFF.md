# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-19 / linux / opencode
- **Branch / commit:** feature/repo-scaffold / `f4227f4` plus uncommitted changes
- **Working tree:** dirty (template sync, repo checks, offline bundle fix)
- **Done this session:** Pulled the SI physics and prioritized-port commits, merged the workshop-template workflow/context sync, added `scripts/check-repo.sh`, and fixed the offline bundle to include `src/physicsUnits.js`.
- **Checks and exact results:** `bash scripts/check-words.sh` passes; `bash scripts/check-repo.sh` passes; `node tests/physics-units.mjs` passes; `bash tests/smoke.sh` passes; `python3 scripts/build-offline.py` wrote a 3359 KB bundle containing `PX_PER_METER`.
- **Repro / verify command:** `bash scripts/check-words.sh && bash tests/smoke.sh`; optional `bash scripts/serve.sh`; optional `python3 scripts/build-offline.py`.
- **Known problems / decisions needed:** Repeatable race may not produce combat; gameplay seed is ineffective; zombies may target infected/finished racers; leading-marble camera can be wrong; dev server exposes the repo on all interfaces; no prototype has networked multiplayer. The generated offline page still needs an execution check.
- **Next step:** Verify the offline page starts, then establish a repeatable race with real combat before adding hazards or UI features.
- **Do not delete / assumptions:** Keep `prototypes/Six/marble-race.html`, `vendor/`, and the reference prototypes. Do not edit generated `dist/` or vendor files.
