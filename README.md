# Zombie Marble Run

A single-page browser game built by consolidating five prototype games. Vanilla JS, canvas, [Rapier2D](https://rapier.rs/) (Apache-2.0, vendored). No build step.

Read `PROJECT_CONTEXT.md` for the goal and `docs/ARCHITECTURE.md` for the structure.

## Run
```bash
bash scripts/serve.sh        # http://localhost:8000/
```
On a phone or another device, open this machine's LAN IP on the same port.

## Check
```bash
bash scripts/check-words.sh   # context-file word budgets
bash tests/smoke.sh           # page, engine, and bootstrap load
```

## Working with AI assistants
Start by having the assistant read `AGENTS.md`, `PROJECT_CONTEXT.md`, and `HANDOFF.md`; follow `docs/WORKFLOW.md`.

## Prototypes
Incoming games live in `prototypes/<NN-name>/`; see `prototypes/README.md` for the rules.

## Keys
Copy names from `config/examples/env.example` into your shell profile. Never commit real keys.
