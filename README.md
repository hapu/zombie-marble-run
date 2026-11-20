# Zombie Marble Run

A single-page browser game built by consolidating six prototype games. Vanilla JS, canvas, [Rapier2D](https://rapier.rs/) (Apache-2.0, vendored). No build step.

Read `PROJECT_CONTEXT.md` for the goal and `docs/ARCHITECTURE.md` for the structure.

## Run
```bash
bash scripts/serve.sh        # http://localhost:8000/
```
On a phone or another device, open this machine's LAN IP on the same port.

## Build one-file offline HTML
```bash
python3 scripts/build-offline.py
```

This inlines the HTML, JavaScript modules, and vendored Rapier2D engine into
`dist/zombie-marble-run.html`. Open that file directly in a browser; no local server or
network connection is required.

## Check
```bash
bash scripts/check-words.sh   # context-file word budgets
bash tests/smoke.sh           # page, engine, and bootstrap load
```

## Working with AI assistants
Start by having the assistant read `AGENTS.md`, `PROJECT_CONTEXT.md`, and `HANDOFF.md`; follow `docs/WORKFLOW.md`.

## Files intended for user editing

For normal game or content work, start with these files:

- `index.html` - page title, canvas/UI shell, start overlay, HUD, and status text.
- `src/main.js` - game loop, session lifecycle, fixed-step timing, and module wiring.
- `src/gameConfig.js` - shared dimensions, teams, weapons, zombies, and other presentation-neutral values.
- `src/world.js` - race layout, terrain, gates, and world construction.
- `src/entities.js` - marbles, zombies, movement, and simulation state.
- `src/combat.js` - weapons, damage, infection, and abilities.
- `src/render.js` - canvas drawing and visual presentation.
- `src/input.js` - keyboard and pointer/touch controls.
- `assets/` - shared sprites, audio, and other runtime assets.
- `PROJECT_CONTEXT.md` - project goal, scope, constraints, and definition of done.
- `TODO.md` - prioritized implementation tasks.
- `HANDOFF.md` - current state and next-session handoff.
- `docs/` - architecture, roadmap, workflow, security, and provider documentation.

Do not normally edit `vendor/`; it contains the pinned Rapier2D engine and license. Do not
edit `scripts/` or `tests/` unless intentionally changing setup or validation. Prototype
folders under `prototypes/` are reference sources, not the live game; copy needed code into
`src/` instead of editing prototypes in place.

## Prototypes
Incoming games live in `prototypes/<Name>/`; see `prototypes/README.md` for the rules.

## Keys
Copy names from `config/examples/env.example` into your shell profile. Never commit real keys.
