# Prototype Two: Zombie Marble Run (Live Profiler Build)

A single-file zombie marble survival race built on Rapier2D 0.18.2. It is the
instrumented, compatibility-hardened version of the game also found in
`prototypes/Seven/`, and it is the direct source for the playable `src/` port.

## Run

Open `ZombieMarbleRun_Rapier2D_LiveProfiler (1).html` in a browser with internet
access. Rapier is loaded from a CDN, so there is no build step.

## Features

- 15 colored marbles race through a seeded 5x5 labyrinth of 25 chunks.
- Zombie outbreak with walkers, runners, tanks, and crypt bosses.
- Five auto-firing weapons with range, damage, cooldown, and knockback.
- Five HP per marble; zombie contact damages, and zero HP turns the marble into a zombie.
- Crates provide ammo, healing, or a weapon swap.
- Difficulty presets for 20, 30, or 40 zombies.
- Targeted abilities: Boost, Shield, and Heal with cooldowns and keyboard shortcuts.
- Follow/select a marble by tapping it or using the previous/next selector.
- Seed controls: manual seed, random, UTC daily, copy link, and URL hash.
- 1x/2x/4x simulation speed, sound mute, help, track map, and results banner.
- Highlight replay after the race.
- Fullscreen with a pseudo-fullscreen fallback for browsers that block the API.
- Live performance profiler with frame timing, simulation/draw breakdown, Rapier
  update cost, game-loop sections, body counts, and render toggles.

## Structure

The HTML file contains the UI, CSS, and one module script.

| Section | Purpose |
| :--- | :--- |
| Rapier loader | Tries jsDelivr, unpkg, then esm.sh; shows loading and load-failure screens. |
| `makeRapierMatterBridge` | Adapts Rapier rigid bodies, colliders, events, and stepping to the Matter.js-style API used by the gameplay code. |
| Constants and RNG | Physics tuning, difficulties, weapons, teams, zombie types, seeded PRNG. |
| Track generation | `FAM` defines 25 chunk families with five variants each; `makeWorld` assembles the route and chunks. |
| Simulation | `stepSim` handles zones, gates, weapon fire, damage, infection, pickups, abilities, and finishing. |
| Rendering | Procedural skyline, marble/glass textures, zones, combat effects, HUD, map, and replay framing. |
| Audio and UI | WebAudio tones, seed/menu controls, help, results, replay, profiler. |

## What Makes It Unique

- A Rapier-to-Matter compatibility bridge lets the game keep a Matter-shaped codebase
  while running on Rapier, including kinematic movers and collision callbacks.
- Three CDN fallbacks plus explicit loading/error states make it more robust than the
  other single-file builds.
- The live profiler exposes per-stage costs instead of only FPS and body counts.
- Supports touch selection, marble cycling, keyboard abilities, fullscreen, and
  pseudo-fullscreen on mobile browsers.

## Notes

- Seeded layout is deterministic, but some gameplay rolls still use `Math.random`.
- Rapier must load from the network; the file is not self-contained offline.
