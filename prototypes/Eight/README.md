# Prototype Eight: Zombie Run Labyrinth (AI Studio Export)

A React 19 + TypeScript + Vite export of the zombie labyrinth race, with Rapier2D
0.21, a split renderer, TV casting, and a 240 Hz physics tick. It follows the same
game direction as `prototypes/Four/` but adds presentation and casting features.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run preview
npm run lint    # tsc --noEmit
```

Seeds work through the URL hash and the in-game seed controls. A `?tv=1` query
parameter or `#tv=1` hash starts the receiver/TV layout.

## Features

- 5x5 seeded labyrinth with 14 marble colors and selectable participants.
- Custom marble names and configurable patient-zero count.
- Manual, random, UTC daily, hash, and copy-link seeds.
- Humans race to extraction while a zombie horde spreads.
- Seven weapons and four zombie types, including a boss.
- Five HP, infection, crates, auto-fire, kills, and combat events.
- Targeted powers: Boost, Shield, Heal.
- Commander map powers: EMP, barricade, and airdrop.
- Five camera modes: smart, follow, half-pack, leader, and 5x5 overview.
- Simulation speeds of 0.5x, 0.75x, 1x, and 2x.
- Pause menu, minimal HUD, health disks, survivor list, track map, debug telemetry,
  highlight replay, and results modal.
- Adaptive 16:9 / 9:16 viewport and fullscreen.
- Chromecast/TV mode using the Presentation API, including seed synchronization from
  the sender to the receiver.
- Spanish-language interface and expanded WebAudio cues.

## Structure

| Path | Purpose |
| :--- | :--- |
| `src/App.tsx` | Race state, simulation loop, camera, powers, replay, results, and UI wiring. |
| `src/components/` | Minimal HUD, pause menu, tactical dock, cast theater bar, health disk, map modal, results, debug overlay. |
| `src/hooks/useCastSession.ts` | Presentation API sender/receiver, TV mode, and `SYNC_SEED` messages. |
| `src/hooks/useViewportAspect.ts` | Fullscreen state and 16:9 / 9:16 canvas sizing. |
| `src/physics/` | Rapier engine, world factory, zones, combat, and shared types. |
| `src/renderer/` | Split arena, entities, and skyline renderers behind `index.ts`. |
| `src/utils/raceHelpers.ts` | Marble creation, seeds, smart camera, replay sampling, highlight clips. |
| `src/simulation.ts` | Fixed-timestep facade at 1/240 s with a 250 ms accumulator cap. |
| `src/audio.ts` | Weapon, hazard, pickup, infection, power, and victory sounds. |
| `metadata.json` | AI Studio app metadata; declares server-side Gemini capability. |
| `public/assets/aistudio/` | Standalone Matter.js AI Studio UX export, not used by the React app. |

## What Makes It Unique

- TV/cast support through the Presentation API, with the sender syncing its seed to
  the receiver. The UI switches to a dedicated TV layout and theater bar.
- 240 Hz fixed physics (versus 60 Hz in `Four`) for collision reliability.
- Renderer split into arena, entities, and skyline modules, plus a smart camera mode.
- Pause-only settings surface, health disks, and a compact tactical dock replace
  `Four`'s always-visible sidebar.
- Ships a self-contained Matter.js AI Studio HTML artifact in `public/assets`, which
  is independent of the Rapier React game.

## Notes

- `package.json` declares `@google/genai` and `express`, and `metadata.json` lists a
  server-side Gemini capability, but no checked-in source uses Gemini or starts an
  Express server. Treat Gemini as an unverified/exported capability, not an
  implemented feature.
- There are no test or benchmark scripts, unlike `prototypes/Four/`.
- The project is heavier to install and run than any single-file prototype.
