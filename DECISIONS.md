# Decisions

One entry per important decision, newest first.

## 2026-11-17: Repository layout and stack
- **Decision:** Keep incoming games in `prototypes/<NN-name>/` and build the merged single-page game in `src/`; use vanilla JS, canvas, and Matter.js 0.20.0 (MIT) vendored under `vendor/`. No build step; Python static server.
- **Why:** Runs on a 4 GB Chromebook and phone with only Python; vendoring keeps it offline and reproducible; MIT/free satisfies scope.
- **Alternatives rejected:** Flat `src/` (loses prototype provenance), branch-per-prototype (harder side-by-side review), Vite/TypeScript (Node build weight), Phaser or CDN loading (heavier bundle or network dependency).


## YYYY-MM-DD: Title
- **Decision:**
- **Why:**
- **Alternatives rejected:**
