# Prototype Seven: Zombie Marble Run (Rapier 0.14)

A single-file zombie marble survival race using Rapier2D 0.14 directly. It is the
leaner, earlier form of the same game as `prototypes/Two/`, with the polished
ability dock, mobile layout, replay, and results flow.

## Run

Open `ZombieMarbleRun.html` in a browser with internet access. Rapier is loaded from
unpkg, so there is no build step.

## Features

- 15 colored marbles race through a seeded 5x5 labyrinth of 25 chunks.
- Walkers, runners, tanks, and crypt bosses.
- Five auto-firing weapons with ammunition, range, cooldown, damage, and knockback.
- Crates for ammo, healing, or a weapon swap.
- Five HP per marble; zombie contact infects a marble at zero HP.
- Difficulty presets for 20, 30, or 40 zombies.
- Boost, Shield, and Heal abilities with cooldowns, keyboard shortcuts, and an
  on-screen ability dock.
- Follow a marble by tapping it or using the previous/next selector.
- Manual, random, UTC daily, and shareable hash seeds.
- 1x/2x/4x speed, sound, help, track map, debug overlay, and fullscreen fallback.
- Highlight replay and a results banner with escape order, infections, kills, and
  deadliest chunk.

## Structure

Everything lives in one HTML file with an embedded stylesheet and script.

| Section | Purpose |
| :--- | :--- |
| UI and CSS | Header, settings menu, start screen, marble indicator, ability dock, HUD, help, map, results. |
| Bootstrap | Loads Rapier 0.14 from unpkg, calls `RAPIER.init()`, then runs `initGame()`. |
| Constants and RNG | Physics values, difficulty, weapons, zombie types, teams, and seeded PRNG. |
| Track generation | `FAM` defines 25 chunk families with five variants; `makeWorld` builds the 5x5 route and rooms. |
| Simulation | `stepSim` updates movers, hazards, weapons, damage, infection, crates, abilities, progress, and finishing. |
| Recording and replay | Samples frames and highlight events, then replays selected moments and restores the final state. |
| Rendering and audio | Canvas rendering, procedural skyline, glass marbles, zones, effects, and WebAudio cues. |

## What Makes It Unique

- Direct use of the Rapier 0.14 API with an explicit async initialization step; there
  is no compatibility layer, profiler, or multi-CDN loader.
- The smallest complete example of the zombie game's loop, combat, chunk families,
  and replay logic, making it a clear reference for behavior rather than tooling.
- Strong mobile presentation: touch marble selection, responsive layout, safe-area
  aware controls, and a fullscreen/pseudo-fullscreen fallback.
- Uses the older Rapier API and scale conventions (`GRAV = 18`, `BELT = 12`) rather
  than the tiny-unit bridge used by `Two`.

## Notes

- Layout is seeded, but several event rolls use `Math.random`.
- Rapier must load from the network.
