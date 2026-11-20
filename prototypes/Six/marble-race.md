# Analysis: `prototypes/Six/marble-race.html`

## Summary

`marble-race.html` is a balance-and-presentation fork of `Zombie Marble Run.html`
in the same folder, not a separate game. Both are single-file Matter.js 0.19
builds loaded from cdnjs. The fork is 612 lines versus 586; a diff shows roughly
58 changed lines (42 additions, 16 deletions), most of them the weapon table,
the removed ammo system, and new drawing code. Track generation, physics
constants, chunk families, simulation, replay, scoring, and menus are unchanged.

Open the file directly in a browser with internet access; there is no build step.

## Shared with the original

- Same top-level constants: `R=9`, `GRAV=.3`, `VMAX=3.2`, `CS=360`, `COLS=5`,
  `HP=5`, `HITCD=.7`, `BELT=.0007`.
- Same 5x5 seeded route, 25 chunk families x 5 variants, start/drop/landing/
  lift/rooftop/finish cells, and climbing vs descending layouts.
- Same difficulty table (`DIFFS` at line 103) and zombie types (`ZT`, line 106).
- Same simulation loop: two `Engine.update(engine, 1000/120)` calls per
  `stepSim` tick, with `simT += 1/60` (effectively 120 Hz physics).
- Same Matter.js 0.19 from cdnjs, same warm HUD/menu structure, replay
  recorder (every third tick, ~20 records/s), daily leaderboard hook
  (`window.claude`), and `localStorage` prediction stats.

## What the fork changes

### Weapon balance and infinite ammo

The original defined five weapons plus a `clip` array and tracked `m.ammo`
(ammo crates, empty-weapon gating, ammo ring). The fork deletes all of that:

- Ammo, clips, `m.ammo`, and ammo crates are removed; weapons never run out.
- Crate drops are only `med` or `swap` (line 177).
- Auto-fire no longer checks or decrements ammo (line 239).

| Weapon | Range (old -> new) | Cooldown | Damage | Knockback |
| :--- | :--- | :--- | :--- | :--- |
| Pistol | 150 -> 150 | 1.1 -> 0.8 | 1 -> 1 | 0.8 -> 0.8 |
| Shotgun | 90 -> 95 | 2.0 -> 1.7 | 2 -> 3 | 2.0 -> 2.2 |
| Bat | 34 -> 46 | 0.8 -> 1.4 | 1 -> 3 | 2.2 -> 3.0 |
| Sword | 40 -> 52 | 0.6 -> 0.5 | 1.5 -> 1 | 0.6 -> 0.5 |
| Rifle | 220 -> 240 | 1.6 -> 1.5 | 2 -> 2 | 0.4 -> 0.7 |

Net effect: faster pistol, much stronger shotgun and bat, faster sword, longer
rifle, and no resource management.

### Marble visuals

- HP is now a five-segment arc ring instead of five pips (`draw`, line 567).
- The equipped weapon is drawn on the marble (`drawWeapon`, line 511). Aim
  direction persists for 1.2 s after firing via `m.aim` / `m.shotT`, set when a
  shot is recorded (line 590).
- Zombie marbles keep a team-colored outline; finished marbles hide ring and
  weapon (line 569).

### Weapon-specific effects

`drawFx` (line 523) replaces the single fading line with per-weapon animation:
pistol tracer + spark, rifle muzzle flash + beam + spark, five-pellet shotgun
spread, and bat/sword arcs. Shot records now carry the firing marble (`h`) so
aim can be stored; `lowfx` no longer suppresses shot effects by itself.

### Warm theme override

Lines 53-79 add a CSS override that replaces the cool palette with parchment/
wood tones, dashed borders, and offset shadows. It hardcodes light colors even
for dark-mode selectors, so the fork stays light-only regardless of OS theme.

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

- Requires internet for the Matter.js CDN and Google Fonts; it is not offline.
- Fixed light theme despite dark-mode media queries.
- No player-marble selection beyond following a color (shared with the original).
- Redundant identical branches when drawing normal vs zombie marbles (lines
  561-562), a leftover from removing ammo-ring code.
