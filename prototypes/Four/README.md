# Prototype Four: Zombie Run Labyrinth

Deterministic, seeded 5x5 labyrinth marble survival race with Rapier2D physics,
zombies, weapons, and tactical powers. This is the most engineered prototype and
the main reference for module layout, testing, and physics tuning.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint    # type-check
npm test        # generator and simulation checks across many seeds
```

Share a race with `#seed=<text>` in the URL. The same seed gives the same maze and
the same gameplay rolls (zombie types, crate drops, weapon swaps).

## Features

- 5x5 room labyrinth assembled by a seeded course generator.
- 14 marble colors with distinct mass, restitution, and material profiles.
- Choose participating marbles, rename them, and set the patient-zero count.
- Manual seed, hash seed, daily seed, and copy-link controls.
- Humans must reach extraction while zombies spread; the HUD tracks humans, horde,
  leader, time (up to 5:00), and active rooms.
- Seven weapons with auto-fire, range, cooldown, damage, knockback, pellets, and melee.
- Four zombie types: walker, runner, tank, and boss.
- Crates, healing, infection, damage, kills, and combat events.
- Targeted powers on the followed marble: Boost, Shield, Heal.
- Commander map powers: EMP shockwave, barricade, and airdrop.
- Four camera modes: follow, half-pack, race leader, and full overview.
- Simulation speeds of 0.5x, 1x, 2x, and 4x.
- Pause, restart, track map, debug telemetry, highlight replay, and results summary.
- In-race standings panel with follow controls.
- Adaptive 16:9 / 9:16 viewport, fullscreen, and Spanish-language UI.
- WebAudio sound effects for combat, pickups, hazards, and results.

## Structure

| Path | Purpose |
| :--- | :--- |
| `src/App.tsx` | Race state, wiring, UI orchestration, simulation refs, and render loop callbacks. |
| `src/components/` | HUD, sidebar, marble selector, power dock, map modal, results, replay banner, debug overlay, standings. |
| `src/hooks/` | `useGameLoop`, `usePowers`, `useHighlightReplay`, `useKeyboardShortcuts`, `useStageViewport`. |
| `src/physics/` | Rapier engine split into engine, world builder, hazards, steering, projectiles, sync, combat, spatial helpers, and types. |
| `src/physicsConfig.ts` | Tick rate, solver iterations, CCD substeps, and conversions from reference-rate tuning. |
| `src/simulation.ts` | Fixed-timestep facade over the Rapier engine with replay and highlight capture. |
| `src/courseGenerator.ts` | Seeded labyrinth and chunk generation. |
| `src/rng.ts`, `src/seedUtils.ts` | Deterministic gameplay RNG, hash seeds, and daily seeds. |
| `src/renderer.ts` | Canvas rendering for the course, entities, effects, HUD overlays, and skyline. |
| `src/constants.ts` | Marble colors, weapons, zombies, camera modes, and speeds. |
| `src/types.ts`, `src/appTypes.ts` | Shared gameplay, UI, replay, and power types. |
| `scripts/` | Seed/simulation verification, physics and render benchmarks, Playwright UI smoke test. |

## Unique Aspects

- Fixed timestep at 60 Hz with 6 solver iterations and 4 CCD substeps, derived from
  constants originally tuned at 120 Hz. The conversion helpers keep damping and
  timeouts stable when the tick rate changes.
- Deterministic gameplay RNG extends beyond the maze to zombie types, weapon swaps,
  and crate contents.
- Dual power system: targeted marble abilities plus map-click commander powers.
- Dedicated tests and benchmarks rather than only manual play:
  `npm test`, `npm run bench`, `npm run bench:render`, `npm run bench:physics`, and
  `python3 scripts/ui-smoke.py <tag>`.
- The module split and adaptive viewport make it the best donor for a larger codebase,
  at the cost of a Node build and heavier setup than the single-file prototypes.

`matterRaceEngine` in `src/simulation.ts` is a legacy name for the Rapier-backed
engine; it does not use Matter.js.
