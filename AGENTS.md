# AGENTS.md

Instructions for AI coding agents. Keep under 500 words.

## Environment & Commands
- **Host:** 4GB RAM Linux CLI. Keep builds, tests, and terminal outputs minimal.
- **Stack:** Vanilla JS (ES modules), HTML5 Canvas, vendored Rapier2D 0.21.0 (Apache-2.0), Python 3 static server; no build step.
- **Test / Lint:** `bash scripts/check-words.sh && bash tests/smoke.sh`
- **Build:** `python3 scripts/build-offline.py`

## Before changing anything
1. Inspect the repo and working tree (`git status --short --branch`, `git log --oneline -5`).
2. Read `PROJECT_CONTEXT.md`, `HANDOFF.md`, `TODO.md`, `docs/WORKFLOW.md`, and `WORKSHOP.md`.
3. Verify existing work; never assume a prior assistant's summary is correct.
4. Verify provider, tool, and API facts from official docs if they may have changed.
5. Explain the plan briefly before any multi-file or structural change.

## Rules
- **Branching:** Never commit directly to `main`. Use feature branches (`feature/<topic>`, `fix/<topic>`) with small, atomic commits; commit or push only when explicitly asked.
- **Output Discipline:** Pipe verbose logs to `/tmp/` or tail the last 20 lines (`| tail -n 20`) to prevent context and RAM bloat.
- **Safety:** Never delete existing work, install new dependencies, use paid APIs, or expose/commit credentials without explicit approval.
- **Scope:** Stay provider-agnostic. Do not invent quotas, capabilities, or compatibility claims.
- **Editing boundaries:** Do not modify `vendor/`, `prototypes/`, or generated `dist/` output unless the task requires it.
- **Docs:** Update docs when behavior or decisions change; do not leave stale paths or commands.

## When you finish, report
- Files changed (what and why).
- Checks/tests run and exact results.
- Known limitations, blockers, or decisions needed.
- Branch, commit hash, and working-tree state.
- Next recommended task.

Then update `HANDOFF.md` with the current state and reproduction command.
