# AGENTS.md

Instructions for AI coding agents. Keep under 500 words.

## Environment & Commands
- **Host:** 4GB RAM Linux CLI. Keep builds, tests, and terminal outputs minimal.
- **Stack:** Vanilla JS (ES modules), HTML5 Canvas, vendored Rapier2D 0.21.0 (Apache-2.0), Python 3 static server; no build step.
- **Test / Lint:** `bash scripts/check-words.sh && bash tests/smoke.sh`

## Before changing anything
1. Inspect the repo (`git status`, `git branch`) and working tree.
2. Read `PROJECT_CONTEXT.md`, `HANDOFF.md`, `TODO.md`, `docs/WORKFLOW.md`, and `WORKSHOP.md` if present.
3. Verify existing work and never assume a prior assistant's output is correct—check the actual files.
4. Verify provider/tool facts from official docs if APIs or versions may have changed.
5. Explain the plan briefly before any multi-file or structural change.

## Rules
- **Branching:** Never commit directly to `main`. Use feature branches (`feature/<topic>`, `fix/<topic>`) with small, atomic commits; commit or push only when explicitly asked.
- **Output Discipline:** Pipe verbose logs to `/tmp/` or tail the last 20 lines (`| tail -n 20`) to prevent context and RAM bloat.
- **Safety:** Never delete existing work, install new dependencies, use paid APIs, or expose/commit credentials without explicit approval.
- **Scope:** Stay provider-agnostic. Do not invent quotas, capabilities, or compatibility claims.

## When you finish, report
- Files changed (what and why).
- Checks/tests run and exact results.
- Known limitations or open questions.
- Branch and commit hash (or uncommitted state).
- Next recommended task.

Then update `HANDOFF.md` with the current state and reproduction command.
