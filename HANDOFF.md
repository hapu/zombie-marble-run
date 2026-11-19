# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-18 / linux / opencode
- **Branch:** feature/repo-scaffold
- **Done this session:** Made the `Two` port playable.
  - Physics: fixed gravity direction/scale, stepped Rapier per fixed tick, sane belt speed, open row-transition shafts, corrected wall spans and mirroring.
  - Bodies: done/restart cleanup, remove gates when they open, remove killed zombies from Rapier.
  - Combat: mass-scaled chase/knockback, working contagion radius, weapon reload, ability timers on sim time.
  - Controls/UI: SPACE start, R restart, 1/2/3 and on-screen Boost/Shield/Heal buttons wired, HiDPI canvas transform.
  - Docs: `TODO.md` and this handoff updated.
- **Checks:** `node --check src/*.js`; `bash scripts/check-words.sh && bash tests/smoke.sh` pass. Headless full races finish in ~95–117 s with 8–10 finishers, zombie kills/infections, no NaN finish times. A fake-DOM integration run exercised start → race → abilities → restart with zero console errors.
- **Known problems:** Only flat belts are ported; chunk families, obstacles, wind/lift, crates/pickups, replay, audio, map, and leaderboard are missing (`up` layouts disabled until lifts exist). Zombie spawn uses `Math.random`, not the seed. Abilities target the first active human, and there is no player/marble selection.
- **Next:** Port chunk families/content and introduce a selected player marble, then balance difficulty and race length.
- **Repro:** `bash scripts/serve.sh` and open `http://localhost:8000/`. Temporary headless/integration harnesses lived in `/tmp` and are not committed.
