# Handoff

Keep under 300 words. Overwrite each session.

- **Date / device / assistant:** 2026-11-17 / linux / opencode
- **Branch:** feature/repo-scaffold
- **Done this session:**
  - Scaffolded the repo for the prototypes: `index.html`, `src/main.js`, vendored Matter.js 0.20.0, `scripts/serve.sh`, `tests/smoke.sh`, docs (`154e46e`).
  - Analysed the eight prototypes now in `prototypes/`; wrote `prototypes/ANALYSIS.md`.
- **Tests / checks and results:** `bash scripts/check-words.sh` passed; `bash tests/smoke.sh` passed. Prototypes are untracked and were not executed.
- **Known problems:** Most prototypes use Rapier2D, conflicting with the scaffolded Matter.js choice. Duplicates: `Three`=`Two`, zip=`Eight`; `Five` is empty. No prototype has multiplayer.
- **Next step:** Choose the engine/base (A: Rapier single-page, B: Matter, C: React+Rapier), then commit/trim prototypes per that decision.
