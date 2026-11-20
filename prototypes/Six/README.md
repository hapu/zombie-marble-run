# Prototype Six: Zombie Marble Run (Matter.js)

The only Matter.js build in the repo. It contains two single-file versions: the
original game and the `marble-race.html` balance/visual variant.

## Run

Open either HTML file in a browser with internet access. Matter.js is loaded from
cdnjs, so there is no build step.

- `Zombie Marble Run.html` - original build.
- `marble-race.html` - tracked variant with rebalanced weapons and new visuals.

## Features

- 15 colored marbles race through a seeded 5x5 labyrinth of 25 chunks.
- 25 chunk families with five variants each, covering pegs, bumpers, spinners,
  crushers, gates, fans, magnets, portals, honey, crypts, lifts, launchers, and more.
- Walkers, runners, tanks, and crypt bosses.
- Five auto-firing weapons with range, damage, cooldown, knockback, and clips.
- Crates for ammo, healing, or a weapon swap.
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

This file was added outside the earlier committed work and is now tracked. It keeps
the same Matter.js structure but changes balance and presentation:

- Removes ammunition entirely: weapons never run out, clips are gone, and only
  medkit and weapon-swap crates remain.
- Rebalances all five weapons, including a faster pistol, stronger shotgun and bat,
  faster sword, and longer-range rifle.
- Draws the equipped weapon on each marble and shows a segmented HP ring instead of
  separate HP pips plus an ammo ring.
- Replaces simple shot lines with weapon-specific effects: pistol tracers, rifle
  beams, shotgun pellets, melee arcs, and impact sparks.
- Retains aim direction briefly after firing and updates the marble card, help text,
  and pickup descriptions for unlimited ammo.

## What Makes It Unique

- The only Matter.js implementation, and the only one with a full 25-by-5 chunk
  content matrix plus crypt bosses.
- The prediction/streak loop is unique to this prototype.
- Optional Claude-hosted daily leaderboard and browser-local prediction stats.
- Quality auto-degradation and low-FX toggles are built into the single file.
- The variant is a compact experiment in removing ammo management and replacing it
  with visible weapons and richer combat effects.

## Notes

- Track layout is seeded, but some event rolls use `Math.random`.
- The daily leaderboard depends on the Claude host API and is not available on a
  plain static server.
