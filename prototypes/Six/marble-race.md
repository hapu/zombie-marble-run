# Analysis: `prototypes/Six/marble-race.html`

## Summary

`marble-race.html` is a tuning of `Zombie Marble Run.html` in the same folder, not
a separate game. Both are 612-line, single-file Matter.js 0.19 builds loaded from
cdnjs. The variant started as a 58-line fork (42 additions, 16 deletions) that
removed ammo and reworked weapons and visuals; those changes were later folded
into `Zombie Marble Run.html`, so the two files now differ only in the weapon
cooldown line. Track generation, physics constants, chunk families, simulation,
replay, scoring, menus, and styling are unchanged.

Open either file directly in a browser with internet access; there is no build
step.

## Shared by both builds

- Same top-level constants: `R=9`, `GRAV=.3`, `VMAX=3.2`, `CS=360`, `COLS=5`,
  `HP=5`, `HITCD=.7`, `BELT=.0007`.
- Same 5x5 seeded route, 25 chunk families x 5 variants, start/drop/landing/
  lift/rooftop/finish cells, and climbing vs descending layouts.
- Same difficulty table (`DIFFS`) and zombie types (`ZT`).
- Same simulation loop: two `Engine.update(engine, 1000/120)` calls per
  `stepSim` tick, with `simT += 1/60` (effectively 120 Hz physics).
- Same Matter.js 0.19 from cdnjs, warm HUD/menu structure, replay recorder
  (every third tick, ~20 records/s), daily leaderboard hook (`window.claude`),
  and `localStorage` prediction stats.
- Same warm parchment/wood CSS theme, dashed borders, and offset shadows.
- Same infinite-ammo weapon model: no clips, `m.ammo`, empty-weapon gating, or
  ammo crates; auto-fire never blocks or decrements.
- Same weapon ranges, damage, and knockback (only cooldowns differ).
- Same marble presentation: segmented HP arc, weapon drawn on the marble, aim
  retained for 1.2 s after firing, team outline retained on infected marbles.
- Same per-weapon effects in `drawFx`: pistol tracer + spark, rifle flash +
  beam + spark, five-pellet shotgun spread, and bat/sword arcs.

## Difference: weapon cooldowns

The only source delta is the `WEAPONS` cooldown column. `marble-race.html` fires
everything faster.

| Weapon | `Zombie Marble Run.html` | `marble-race.html` |
| :--- | :--- | :--- |
| Pistol | 1.0 s | 0.8 s |
| Shotgun | 2.2 s | 1.7 s |
| Bat | 1.8 s | 1.4 s |
| Sword | 0.7 s | 0.5 s |
| Rifle | 1.9 s | 1.5 s |

## Code map

| Area | Lines |
| :--- | :--- |
| Constants, difficulties, weapons, teams, chunk families | 101-111 |
| World contexts, movers, belts, zones (`mkctx`, `climb`) | 113-132 |
| Chunk builders `F[0..24]` | 133-160 |
| `makeWorld`, route/grid, gates, spawns | 161-191 |
| Damage/infection, progress tracking | 192-199 |
| `stepSim` (zones, AI, auto-fire, rescue, finish) | 200-264 |
| Recording/replay | 409-443 |
| HUD, results | 392-407, 477-491 |
| Canvas helpers, weapon drawing, FX | 511-536 |
| Main `draw` | 537-578 |
| Main loop, input, menu wiring | 579-609 |

## Determinism caveats

The track layout is seeded (`rngOf`), but a run is not fully reproducible:

- `S.mk` sets marble restitution with `Math.random()` (line 165).
- Weapon-swap crates and crypt spawn types use `Math.random()` (lines 233-235).
- Fire-cooldown jitter uses `Math.random()` (line 242).
- Audio and visual-only randomness (`parts`, `grainP`) do not affect physics.

This mirrors the known root-port issue: the seed drives layout, not the whole
simulation.

## Reuse notes for the current `src/` port

Worth copying/adapting into the Rapier port:

- The weapon table as `src/gameConfig.js` data, including the rebalanced values.
- Segmented HP ring and `drawWeapon` presentation.
- Per-weapon FX shapes in `drawFx` (pistol/rifle/shotgun/melee).
- Shot records carrying the firing marble so aim can be reflected briefly.
- Infinite-ammo simplification, if ammo management stays out of scope.

Do not copy the Matter.js physics, chunk builders, or the `window.claude`
leaderboard hook as-is; the port uses Rapier2D and its own module layout.

## Known limitations

- Requires internet for the Matter.js CDN and Google Fonts; the files are not
  offline.
- Fixed light theme despite dark-mode media queries.
- No player-marble selection beyond following a color.
- Redundant identical branches when drawing normal vs zombie marbles (lines
  561-562), a leftover from removing ammo-ring code.
