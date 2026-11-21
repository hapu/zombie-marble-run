# Project Context

Keep under 800 words.

## Goal
Consolidate six prototype webpage games into a single-page browser game.

## Scope
- In: 2D Physics
- Out: 3D Graphics, non-free libraries

## Constraints
- Devices: Android phone + 4 GB Chromebook
- Budget: free tiers only unless approved
- Stack / versions: Vanilla JS ES modules, HTML5 Canvas, Rapier2D 0.21.0, Python 3; no build step
- Licensing: Apache-2.0; Rapier2D Apache-2.0 (vendored)
- Other:

## Definition of done
- Testable outcome: Six prototype feature sets consolidated into one playable race loop without known game-breaking bugs.
- User-visible behavior: Polished feel, full touch controls, and some form of multiplayer.
- Checks that must pass: `bash scripts/check-words.sh && bash tests/smoke.sh`; `python3 scripts/build-offline.py`.

## Current state
- What exists: Six analyzed prototypes (`One`, `Two`, `Four`, `Six`, `Seven`, `Eight`) plus a vanilla JS + canvas, vendored Rapier2D 0.21.0 (Apache-2.0) single-page implementation.
- What runs: The shared game has the Two-based race loop, belts, seeded medkits and peg/bumper layouts, plus seeded wind and landing lifts. Rapier uses SI units behind a 50 px/m conversion boundary; gameplay and rendering remain pixel-based. Physics and rendering are separated into modules, and `scripts/build-offline.py` creates a one-file offline build.
- What is missing: Effective gameplay seeds, more obstacle/wind/lift variations, additional pickup types, audio, replay, map, leaderboard, and multiplayer. See `TODO.md`.
