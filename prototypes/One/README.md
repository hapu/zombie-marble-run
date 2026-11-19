# Prototype One: Blobs Marble Race

A single-page, dependency-free marble race through a seeded labyrinth. This is the
only prototype without zombies, weapons, or combat.

## Run

Open `index.html` in a browser. No server, build step, or network access is required.

## Features

- Seeded 10x15 recursive-backtracker maze; the same seed produces the same route.
- Choose 4, 6, or 8 racers.
- Random seed, UTC daily seed, and shareable `#seed` links.
- Three-second countdown, live order/finish HUD, timer, and results banner.
- Camera follows the marble with the greatest route progress.
- Track map overlay showing the route and each cell.
- Debug overlay with FPS, wall count, live marbles, race state, and seed.
- Toast messages and a fixed 900x660 canvas presentation.

## Structure

| File | Purpose |
| :--- | :--- |
| `index.html` | Page shell, controls, race HUD, map/debug panels, canvas. |
| `app.js` | All game logic: seed hashing and PRNG, maze and wall generation, marble creation, race state, simulation, rendering, and panels. |

The simulation does not use a physics library. Each marble is steered toward the
next point on the generated route, then resolved against maze wall segments with a
circle-versus-segment correction and restitution. Marble-versus-marble collisions
are handled separately, and progress is tracked along the route.

## What Makes It Unique

- Hand-written steering physics rather than an engine.
- Pure race: no health, weapons, infection, or pickups.
- The camera follows progress, not a selected or leading marble.
- Maze generation and race layout are deterministic, but there is no persistence,
  leaderboard, audio, or touch-specific input.
- Fixed-resolution canvas with no responsive resize beyond CSS scaling.
