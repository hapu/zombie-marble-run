# Workflow

## Start
1. Inspect the repo and working tree (`git status --short --branch`, `git log --oneline -5`).
2. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `HANDOFF.md`, `TODO.md`, and this file.
3. If the working tree is clean, `git pull --rebase`. If dirty, branch or stash first — never pull over uncommitted work.
4. Pick one task from `TODO.md`.

## During
1. One coherent change at a time, small enough to review.
2. Run `bash scripts/check-words.sh` after doc edits (add project-specific check commands here as they appear).
3. Update docs when behavior, setup, or decisions change.
4. Never overwrite another device's uncommitted work. Use separate branches or worktrees for simultaneous changes.

## End
1. Summarize changes and check results.
2. Update `HANDOFF.md` and `DEVELOPMENT_LOG.md`.
3. Review `git diff`; commit and push only when explicitly asked, and never force-push.

## Roles when using several assistants
| Role | Job |
| :--- | :--- |
| Architect | Propose structure and technical decisions |
| Developer | Implement a defined task |
| Debugger | Reproduce and diagnose defects |
| Reviewer | Check changes for correctness and risk |
| Tester | Run checks and report results |
| Documenter | Update docs, decisions, handoff |

Always verify the actual files rather than trusting another assistant's summary.
