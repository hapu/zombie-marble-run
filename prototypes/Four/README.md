# Zombie Run Labyrinth

Deterministic, seeded 5×5 labyrinth marble survival race (Rapier2D physics, zombies, weapons).

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint    # type-check
npm test        # generator checks across many seeds
```

Share a race with `#seed=<text>` in the URL. The same seed gives the same maze **and** the same
gameplay rolls (zombie types, crate drops, weapon swaps).

## Layout

- `src/physics/` – Rapier engine split by stage: `engine.ts` (class + `update()` orchestrator), `worldBuilder.ts`, `hazards.ts`, `steering.ts`, `projectiles.ts`, `sync.ts`, `combat.ts`, `spatial.ts`.
- `src/physicsConfig.ts` – tick rate (60 Hz), solver iterations, replay rate. Timing-related constants derive from it.
- `src/App.tsx` – state + wiring; UI lives in `src/components/`, behaviour in `src/hooks/` (`useGameLoop`, `usePowers`, `useHighlightReplay`, `useKeyboardShortcuts`, `useStageViewport`).

## Scripts

`npm run bench` (sim ms/tick), `npm run bench:render`, `npm run bench:physics` (tick-rate/solver comparison), and `python3 scripts/ui-smoke.py <tag>` (Playwright UI walkthrough against `vite preview`).
