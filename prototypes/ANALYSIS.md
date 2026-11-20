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

## Implemented feature inventory

| Prototype | Implemented features |
| :--- | :--- |
| `One` | Seeded 10x15 maze race; 4/6/8 racers; manual/random/daily/share seeds; countdown, progress/finish HUD and results; leader-follow camera; route map; debug overlay and toasts. Pure race with custom steering/collision physics; no combat. |
| `Two` | 15 marbles and a 5x5, 25-family/five-variant course; walkers, runners, tanks and bosses; five auto-fire weapons, HP, damage/infection, ammo/reload and crates; Boost/Shield/Heal; difficulty, seed/share/daily controls, touch selection, speed, mute, help, map, results, highlight replay, fullscreen fallback, and live timing/physics profiler with CDN fallbacks and load errors. |
| `Four` | Seeded 5x5 race with deterministic gameplay RNG; 14 selectable/renameable marble types and patient-zero setting; seven weapons, four zombie types, combat and crates; targeted and commander-map powers; four camera modes, speed controls, standings/follow, map, debug, highlight replay, pause/restart/results, responsive portrait/landscape and fullscreen, Spanish UI, WebAudio, plus tests and performance benchmarks. |
| `Six` | 5x5 course with 25 chunk families and five variants, including obstacle/hazard families, climb/drop/lift routes and bosses; five weapons with unlimited ammo, visible weapons, segmented HP rings and weapon-specific effects; combat, infection, pickups, prediction points/streaks, local stats and optional host leaderboard; seed/daily controls, map, help, pause/rematch, replay/results, sound, debug and adaptive quality. The two files differ only in cooldown tuning. |
| `Seven` | Single-file Rapier version of the zombie race: 15 marbles, seeded 5x5 course, four zombie types, five weapons, HP/infection/crates, difficulty presets, three abilities, follow/cycle selection, seed controls, speed, sound, help, map, debug, fullscreen fallback, highlight replay and results. Its distinguishing strength is compact, self-contained gameplay reference; it is not a separate feature family from `Two`. |
| `Eight` | Four's broader race feature set plus five camera modes (including smart camera), four speed settings, pause-first settings/minimal HUD, health disks, survivor list, 240 Hz simulation, and Presentation API sender/TV receiver mode with seed sync/theater bar. Expanded audio and Spanish UI. Gemini/Express declarations are not implemented runtime features. |

Across the zombie prototypes, seeds generally determine course layout but not every gameplay roll; `Four` is the strongest deterministic implementation. None implements networked multiplayer. Six's optional hosted leaderboard requires its host API and is not multiplayer.

## What the live game has, and what to bring over

The current vanilla/Rapier `src/` implements the basic loop: 15 colored marbles, a fixed 5x5 snake route with belts, 30 zombies, five weapons with ammo/reload, HP and infection, Boost/Shield/Heal, a fixed 60 Hz step, a leading-human camera, basic HP bars, and a minimal start/HUD/restart interface. Rapier uses SI meters behind a 50 px/m boundary; gameplay and rendering remain pixel-based. The human marble radius is 9 px (0.18 m) and its mass is about 0.51 kg. It does **not** yet expose most controls in a full settings flow, nor does it have playable chunk obstacles. `world.js` explicitly notes that lift/wind content is unported. The current seed and zombie/event randomness are also not fully reproducible.

Recommended port order:

1. **Make races configurable and reproducible.** Bring over Four's shared seeded RNG and seed/hash/daily/share controls, participant selection, patient-zero/difficulty settings, and per-race reset discipline. Keep the current lightweight vanilla UI and Rapier 0.21 engine; do not transplant React or a prototype's Rapier/Matter bridge.
2. **Restore course variety and route content.** Port selected Six/Four obstacle and hazard families, then pickups/crates and climb/drop/lift/wind routes. Start with a small balanced set and test physics at the chosen scale/tick rate before bringing over the full 125 chunk variants.
3. **Finish useful in-race feedback.** Add follow/cycle marble selection, map, standings, finish order/results, pause/rematch, and mobile-safe controls. The map and results are substantial, directly reusable gameplay affordances; prediction scoring/streaks are optional rather than core.
4. **Improve combat presentation and tuning.** Consider Six's unlimited-ammo balance, visible equipped weapons, segmented HP rings, per-weapon effects, and retained aim. Decide ammo policy deliberately; current source uses finite clips and reloads.
5. **Add quality-of-life systems.** Bring over WebAudio, replay/highlights, responsive portrait/landscape and fullscreen, then a lightweight debug/performance overlay. Prefer Four's reproducible tests/benchmarks over Two's broader in-game profiler for regression checking.
6. **Defer high-cost/optional features.** Eight's Chromecast/Presentation API mode is specialized; Six's host-dependent leaderboard is not portable; multiplayer is a separate design task because no prototype supplies networking.

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
