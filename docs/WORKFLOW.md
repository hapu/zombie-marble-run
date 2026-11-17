# Workflow

## Start
1. `git pull --rebase`
2. Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `HANDOFF.md`.
3. Check branch and working tree.
4. Pick one task from `TODO.md`.

## During
1. One coherent change at a time, small enough to review.
2. Run relevant checks.
3. Update docs when behavior, setup, or decisions change.
4. Never overwrite another device's uncommitted work. Use separate branches or worktrees for simultaneous changes.

## End
1. Summarize changes and test results.
2. Update `HANDOFF.md` and `DEVELOPMENT_LOG.md`.
3. Commit and push.

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
