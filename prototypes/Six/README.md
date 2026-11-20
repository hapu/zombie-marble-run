# Prototype Six: Zombie Marble Run (Matter.js)

The only Matter.js build in the repo. It contains two single-file versions that
are now nearly identical: the original game and `marble-race.html`, a faster
cooldown tuning. See `marble-race.md` for the detailed comparison.

## Run

Open either HTML file in a browser with internet access. Matter.js is loaded from
cdnjs, so there is no build step.

- `Zombie Marble Run.html` - original build, now with the rebalanced weapons,
  infinite ammo, and richer visuals.
- `marble-race.html` - the same build with faster weapon cooldowns.

## Features

- 15 colored marbles race through a seeded 5x5 labyrinth of 25 chunks.
- 25 chunk families with five variants each, covering pegs, bumpers, spinners,
  crushers, gates, fans, magnets, portals, honey, crypts, lifts, launchers, and more.
- Walkers, runners, tanks, and crypt bosses.
- Five auto-firing weapons with range, damage, cooldown, and knockback; ammo is
  unlimited.
- Crates for healing or a weapon swap.
- Five HP per marble; zombie contact damages, and zero HP turns the marble into a zombie.
- Difficulty presets for 20, 30, or 40 zombies.
- Manual seed, random seed, UTC daily seed, copy link, and URL hash seeds.
- Track map, help, pause menu, rematch, speed (1x/2x/4x), sound, and debug overlay.
- Quality modes: auto, high, and low. Auto mode lowers DPR and then enables low-FX
  rendering when frame time stays high.
- Follow a marble or HUD dot to make a prediction. Escapes score +1, first place +4,
  and consecutive escapes build a streak saved in `localStorage`.
- Highlight replay and a results banner with escape order, infections, kills, and
  the deadliest chunk.
- Daily scores can be submitted to an optional `window.claude` database when the game
  is hosted in that environment; outside it, the board reports unavailable.

## Structure

| Section | Purpose |
| :--- | :--- |
| HTML and CSS | Header, HUD, timer, banner, preview/map, pause menu, help, debug, result card, hint. |
| Matter bootstrap | Loads `matter.min.js` 0.19 and aliases `Engine`, `Bodies`, `Body`, `Composite`, and `Events`. |
| Constants and RNG | Physics scale, difficulties, weapons, teams, chunk families, seeded PRNG. |
| Generation | `makeWorld`, `mkctx`, and the `F` family builders assemble the route and hazards. |
| Simulation | `stepSim` updates movers, zones, weapons, damage, infection, pickups, and progress. |
| Recording and replay | Captures frames and highlight events, replays moments, and restores final state. |
| Rendering | Procedural skyline, glass marbles, hazard visuals, particles, HUD, and map. |
| Audio and UI | WebAudio cues/ambience, menu actions, quality switching, help, results, daily board. |

## The `marble-race.html` Variant

The variant was added outside the earlier committed work and is now tracked. Its
balance and presentation changes were folded into the original build, so the two
files are identical except for weapon cooldowns (variant values in parentheses):

| Weapon | Cooldown |
| :--- | :--- |
| Pistol | 1.0 s (0.8 s) |
| Shotgun | 2.2 s (1.7 s) |
| Bat | 1.8 s (1.4 s) |
| Sword | 0.7 s (0.5 s) |
| Rifle | 1.9 s (1.5 s) |

Both builds remove ammo, draw the equipped weapon on each marble, show a
segmented HP ring, use per-weapon shot effects, and retain aim briefly after
firing.

## What Makes It Unique

- The only Matter.js implementation, and the only one with a full 25-by-5 chunk
  content matrix plus crypt bosses.
- The prediction/streak loop is unique to this prototype.
- Optional Claude-hosted daily leaderboard and browser-local prediction stats.
- Quality auto-degradation and low-FX toggles are built into the single file.
- The two files are a compact experiment in removing ammo management and replacing
  it with visible weapons and richer combat effects; only cooldown tuning differs.

## Notes

- Track layout is seeded, but some event rolls use `Math.random`.
- The daily leaderboard depends on the Claude host API and is not available on a
  plain static server.
