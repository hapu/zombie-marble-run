# AI Development Workshop

A portable, provider-agnostic setup for building software with AI assistants from an Android phone and a low-power Chromebook. This repo is a **GitHub template**: for each new idea, click "Use this template" and you get a clean copy with every context file ready.

This is the master spec. Keep it under 2,000 words (`scripts/check-words.sh` checks).

## 1. Principles

1. **Provider agnostic:** no single provider or model is required.
2. **Free-first, honestly labeled:** separate permanent free quotas from trials and promo credits.
3. **Git is the source of truth:** code, decisions, and handoff notes live in the repo, not in chats.
4. **Short, current context:** every assistant gets concise instructions (see section 6).
5. **Cloud inference, light local tools.**
6. **Human control:** you approve spending, credentials, and destructive actions.
7. **Reproducible:** record setup steps, versions, and tests.

## 2. Devices

**Chromebook** (Celeron N4500, 4 GB RAM, ~15 GB Linux storage): editing, Git, terminal, scripts, tests.
- Use: `vim`, `nano`, `micro`, `Geany`, `git`, `uv`.
- Avoid: VS Code or other Electron IDEs, Docker, local LLMs.
- Keep browser tabs few; ChromeOS kills the Linux container when memory runs out.

**Android phone:** read and edit docs, review diffs, Termux + SSH, cloud coding agents.

## 3. Providers and gateways

Providers, limits, and model names change. Track them in `docs/PROVIDERS.md` with a last-verified date and an official link. Never assume a free tier is permanent.

- **OpenRouter** (optional): one endpoint for many models; check each model's free-tier conditions.
- **LiteLLM** (optional): routing and fallbacks. It is software, not extra free quota.
- Start with one provider and no gateway. Add a gateway only to solve a concrete problem.

## 4. Coding agent

**OpenCode** (opencode.ai) is the primary candidate because it supports many providers. Verify install steps and provider support first, and test on both Chromebook and phone. Evaluate Aider, Cline, and others only after the basic workflow is stable.

## 5. Repository layout

```text
ai-workshop-template/
├── README.md             how to use the template
├── WORKSHOP.md           this spec
├── AGENTS.md             rules for AI agents
├── PROJECT_CONTEXT.md    goal, scope, constraints, status
├── HANDOFF.md            state for the next session or assistant
├── TODO.md               prioritized tasks
├── DEVELOPMENT_LOG.md    changes and experiments
├── DECISIONS.md          decisions and rationale
├── docs/
│   ├── PROVIDERS.md      providers, quotas, last-verified dates
│   ├── WORKFLOW.md       multi-device and multi-agent process
│   ├── SECURITY.md       credentials and safety rules
│   ├── ARCHITECTURE.md   components of the current project
│   └── ROADMAP.md        workshop build-out phases
├── scripts/              helper scripts (check-words.sh)
├── config/examples/      sample config, never real secrets
└── .gitignore
```

Branches: `main` is stable. Use short-lived `feature/<name>` branches and review diffs before merging. Keep unfinished work on branches or tags until inspected.

## 6. Context budget

Free-tier APIs have tight input limits, so context files stay small. Use bullets, not narratives.

| File | Max words |
| :--- | :--- |
| AGENTS.md | 500 |
| PROJECT_CONTEXT.md | 800 |
| HANDOFF.md | 300 |
| DEVELOPMENT_LOG.md | Archive entries older than the last ~20 once it passes 3,000 |

## 7. Workflow (details in `docs/WORKFLOW.md`)

- **Start:** pull, read `AGENTS.md`, `PROJECT_CONTEXT.md`, `HANDOFF.md`, check branch and working tree, pick one task.
- **During:** one small change at a time, run checks, update docs when behavior or decisions change.
- **End:** summarize, record test results, update `HANDOFF.md`, commit, push.

## 8. Security (details in `docs/SECURITY.md`)

- Never commit keys, tokens, passwords, or `.env` files.
- Use a separate SSH key or fine-grained token per device, scoped to needed repos only.
- Never expose an unauthenticated gateway to the internet.
- No paid usage without your explicit approval.
- Follow provider terms; don't evade quotas with extra accounts.

## 9. Starting a new idea

1. Click **Use this template** on GitHub and name the new repo.
2. Fill in `PROJECT_CONTEXT.md` (goal, constraints, definition of done).
3. Add first tasks to `TODO.md`; delete docs you don't need.
4. Prompt your assistant: *"Read AGENTS.md, PROJECT_CONTEXT.md and HANDOFF.md, then start on the first item in TODO.md."*
5. Commit.

## 10. Roadmap (details in `docs/ROADMAP.md`)

1. **Foundation:** repo, branch workflow, Chromebook setup, phone access.
2. **Providers:** inventory with verified dates.
3. **Coding agent:** one provider working end to end, then add more.
4. **Context:** test handoffs between different assistants.
5. **Automation:** routing and monitoring only if measurably useful.

## 11. Current mission

Stabilize the workshop first. No single game or app is the organizing principle; projects come later through the template.
