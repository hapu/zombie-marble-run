# Prototypes

Source games kept here until their parts are merged into `src/`.

## Adding a prototype
1. Create a folder `prototypes/<Name>/` (existing: `One/`, `Two/`, `Four/`, `Six/`, `Seven/`, `Eight/`).
2. Keep it self-contained: its own HTML/JS/assets, its own README if useful.
3. Do not import files from another prototype; copy what you need.
4. Never commit keys, tokens, or `.env` files (see `docs/SECURITY.md`).
5. Record what is worth reusing and what to drop in the folder's README.

## Merging into the game
1. Read the prototype and note its reusable parts.
2. Move only the needed code into `src/` (or `assets/`).
3. Verify the single-page game still works with `bash tests/smoke.sh`.
4. Delete the prototype folder only with explicit approval.
