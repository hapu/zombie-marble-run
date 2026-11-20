# Prototype analysis

Reviewed in place on 2026-11-17; duplicates (`Three/`, zip) and empty `Five/` were removed, and the remaining six prototypes were committed (`2f620bf`).

## Inventory

| Folder | Form | Size | Engine / stack | Build step | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `One/` | `app.js` + `index.html` | 40K | Vanilla JS + canvas, custom circle/segment physics | none | Seeded procedural maze marble race; daily/share seed, map, debug HUD; no zombies or weapons |
| `Two/` | single HTML | 80K | Rapier2D 0.18.2 (jsDelivr ESM) | none | Zombie marble run: weapons, boss, shields, boosts, replay, touch |
| `Four/` | Vite project | 964K | React 19 + TS + Vite 8 + Tailwind 4 + Rapier2D 0.21 (npm) | `npm install` + `npm run dev/build` | Most engineered: split physics modules, seeded determinism, tests and benchmarks, powers, replay, leaderboard, adaptive viewport |
| `Six/` | single HTML ×2 | 72K + 76K | Matter.js 0.19 (cdnjs) | none | Same zombie feature set; HUD, map, help, pause, mute, local leaderboard, daily seed. Second file, `marble-race.html`, is near-identical and differs only in weapon cooldowns (see `Six/marble-race.md`) |
| `Seven/` | single HTML | 72K | Rapier2D 0.14 (unpkg) | none | Older Rapier variant of the zombie game; same feature set as Two/Three |
| `Eight/` | Vite project | 1.4M | React 19 + TS + Vite + Tailwind + Rapier2D 0.21 + Gemini/express | `npm`/`bun` | AI Studio export: Four's features plus cast session, renderer split, pause/results, expanded audio |

License check (npm registry): Rapier2D Apache-2.0, Matter.js MIT, React/Vite MIT — all free.

## Findings

1. **Two clusters.** Single-file HTML games (`One`, `Two`, `Three`, `Six`, `Seven`) with no build, and React + TypeScript + Vite projects (`Four`, `Eight`).
2. **Physics split.** Rapier2D in `Two`/`Three`, `Seven`, `Four`, `Eight`; Matter.js only in `Six`; `One` has a hand-written physics loop. The current shared implementation uses vendored Rapier2D 0.21.0.
3. **Feature overlap.** The zombie-run cluster (weapons, bosses, shields, boosts, replay, local leaderboard) appears in Two/Three, Six, Seven, Four, Eight. `One` is a pure marble-maze race with no combat.
4. **Determinism.** `One` and `Four` use seeds; `Four` ships end-to-end reproducibility tests and benchmarks.
5. **No multiplayer anywhere.** Networking appears in none of the prototypes, yet `PROJECT_CONTEXT.md` lists multiplayer in the definition of done.
6. **Duplicates resolved.** `Three` duplicated `Two`, the zip duplicated `Eight`, and `Five` was empty; all three were removed on 2026-11-17 with approval.
7. **Offline/weight trade-offs.** Single-file prototypes load physics from CDNs (offline risk); React projects need npm/bun and Vite (Node weight on a 4 GB Chromebook), though their built output is static.

## Fit with project constraints

- 4 GB Chromebook / phone: single-file games run directly; React builds are heavier at dev time.
- Free libraries only: all candidates are MIT or Apache-2.0.
- No 3D: all prototypes are 2D.
- Single page: single-file prototypes already are; React builds produce an SPA.

## Decision

- **Option A — Vanilla + Rapier2D single page (base: Two/Three, upgrade Rapier to 0.21):** matches most prototypes, no build step, and can vendor the engine for offline use.
- **Option B — Vanilla + Matter.js (base: Six):** matches the former scaffold with the least change, but diverges from most prototypes.
- **Option C — React + TS + Vite + Rapier (Four/Eight):** richest code and tests, but adds a Node build and larger maintenance surface on low-power devices.

Recommended and **chosen on 2026-11-17: Option A** for engine parity and no build step, keeping `Four`/`Eight` as reference donors (determinism tests, power system, split renderer).

## Open questions

- How will multiplayer work? No prototype implements it.
