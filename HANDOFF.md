# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-18 / linux / opencode
- **Branch:** feature/repo-scaffold (uncommitted doc edits; HEAD `55d40c0`)
- **Done this session:**
  - Filled `Stack` and `Test / Lint` in `AGENTS.md`, aligned branch naming (`feature/<topic>`) and `docs/WORKFLOW.md` references.
  - Reconciled prototype counts/naming (`6` prototypes: `One`, `Two`, `Four`, `Six`, `Seven`, `Eight`) across `README.md`, `PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `prototypes/README.md`, and `prototypes/ANALYSIS.md`.
  - Updated `TODO.md`, `DECISIONS.md` (removed blank stub), and `docs/ROADMAP.md`; verified `f955308` already committed the Rapier swap.
- **Tests / checks and results:** `bash scripts/check-words.sh && bash tests/smoke.sh` — all passed (`WORKSHOP.md`, `AGENTS.md`, `PROJECT_CONTEXT.md`, `HANDOFF.md`, `index.html`, `vendor/rapier.mjs`, `src/main.js`).
- **Known problems / open questions:** Multiplayer design is still undecided; `WORKSHOP.md` / `docs/ROADMAP.md` retain upstream template items.
- **Next step:** Review and commit doc cleanup (when ready), then port the `prototypes/Two/` zombie-run gameplay into `src/`.
