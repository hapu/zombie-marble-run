# Decisions

One entry per important decision, newest first. Supersede decisions instead of deleting them.

## 2026-11-20: Rapier uses SI units behind a pixel-scale boundary
- **Status:** accepted
- **Decision:** Keep game, course, and rendering measurements in pixels, but convert all Rapier positions, collider dimensions, velocities, forces, impulses, and density at the physics boundary using 50 px/m. Use 9.81 m/s² gravity at 60 Hz with 6 solver iterations and 4 CCD substeps.
- **Why:** The former implementation passed pixel-sized geometry directly to Rapier while treating 9.81 as m/s². Converting at the boundary fixes that mismatch without rewriting gameplay and renderer measurements. Density is scaled to preserve existing marble masses.
- **Baseline:** A human marble is 9 px (0.18 m) radius and approximately 0.51 kg at the existing density. Gameplay speed and distance tuning remain expressed in px/s and px.
- **Alternatives rejected:** Pixel-native Rapier units require non-SI gravity and force/density conventions; converting the whole game to meter-valued gameplay state would expand the change beyond the physics boundary.
- **Consequences / follow-up:** `src/physicsUnits.js` must be included in the offline bundle, and `tests/physics-units.mjs` must run in the validation workflow.

## 2026-11-17: Base engine is Rapier2D (supersedes the Matter.js choice)
- **Status:** accepted
- **Decision:** Use vanilla JS + canvas with Rapier2D 0.21 (Apache-2.0), vendored, no build step. Keep the React prototypes (`Four`, `Eight`) as reference only.
- **Why:** Five of seven non-empty prototypes use Rapier2D, `Two`/`Three` are already a working single-file zombie game, and vendoring keeps it offline on a 4 GB Chromebook/phone. All licenses are free.
- **Alternatives rejected:** Matter.js (only `Six` uses it; smaller feature base), React + Vite + Rapier (richest code but adds a Node build and UI weight), keeping prototypes untracked (loses provenance).
- **Consequences / follow-up:** Rapier stays pinned and vendored; revisit if the physics contract changes or a lighter engine becomes necessary.
