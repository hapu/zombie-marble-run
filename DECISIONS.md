# Decisions

One entry per important decision, newest first.

## 2026-11-17: Base engine is Rapier2D (supersedes the Matter.js choice)
- **Decision:** Use vanilla JS + canvas with Rapier2D 0.21 (Apache-2.0), vendored, no build step. Keep the React prototypes (`Four`, `Eight`) as reference only.
- **Why:** Five of seven non-empty prototypes use Rapier2D, `Two`/`Three` are already a working single-file zombie game, and vendoring keeps it offline on a 4 GB Chromebook/phone. All licenses are free.
- **Alternatives rejected:** Matter.js (only `Six` uses it; smaller feature base), React + Vite + Rapier (richest code but adds a Node build and UI weight), keeping prototypes untracked (loses provenance).
