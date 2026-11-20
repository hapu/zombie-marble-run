# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-20 / linux / Copilot SDK
- **Branch:** feature/repo-scaffold
- **Done this session:** Reviewed the full active repo and added prioritized pre-port fixes and project recommendations to `TODO.md`.
- **Checks:** `bash scripts/check-words.sh && bash tests/smoke.sh` (to run).
- **Known problems:** Offline bundle omits `physicsUnits.js`; one full headless race finished with no combat; gameplay seed is ineffective; zombies may target infected/finished racers; dev server exposes the repository on all interfaces. No prototype implements networked multiplayer.
- **Next:** Fix and test the offline bundle, then establish a repeatable race with real combat before adding hazards or UI features.
- **Repro:** `bash scripts/serve.sh`; optional `python3 scripts/build-offline.py` then open `dist/zombie-marble-run.html`; `bash tests/smoke.sh [port]`.
