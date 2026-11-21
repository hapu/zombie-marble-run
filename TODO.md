# TODO

Keep small; one active task. Each item should be verifiable.

## Now
- [x] Verify the generated offline page starts; smoke checks bundle initialization and game-loop scheduling
- [x] Make a normal race produce combat; tune zombie release and assert repeatable shots, kills, hits, and infections

## Next
- [ ] Restrict zombie pursuit and infection collisions to living, unfinished humans
- [ ] Fix leading-marble camera selection so it consistently follows the highest-progress racer
- [ ] Limit the development server's network exposure or serve only a safe build directory; document trusted-LAN use
- [ ] Port remaining chunk families/content (obstacles, wind/lift, pickups)
- [ ] Balance difficulty and race length
- [ ] Physics audit follow-up
  - [ ] Reset ability state and target per race
  - [ ] Add no-progress rescue and teleport diagnostics
  - [ ] Render belts and weapon effects
  - [ ] Restore obstacles and row-drop geometry
  - [ ] Add headless physics assertions

## High priority prototype ports
- [ ] Make races reproducible and configurable: seed all gameplay rolls, add manual/random/daily/shareable seeds, participant and patient-zero counts, difficulty settings, and per-race resets
- [ ] Port a small, balanced set of hazards and pickups; validate each against the physics contract
- [ ] Add follow/cycle selection, standings, map, finish order/results, pause, and rematch
- [ ] Improve combat feedback with visible weapons, segmented HP, retained aim, and per-weapon effects; decide ammo policy
- [ ] Add mobile-safe touch controls and fullscreen fallback
- [ ] Add WebAudio cues and highlight replay

## Medium priority prototype ports
- [ ] Add 0.5x–4x simulation speed, responsive layout, adaptive rendering, and a debug/performance overlay
- [ ] Expand validated hazards and routes with portals, spinners, magnets, fans, lifts, drops, and wind
- [ ] Add seed/simulation verification tests and physics/render benchmarks

## Later
- [ ] Optional prediction scoring/streaks and hosted/local leaderboard
- [ ] Polish pass: feel and presentation

## Blocked / needs decision
- [ ] Decide the minimum multiplayer requirement (local/shared-device or networked) before architecture and polish work
- [ ] Document Node as a test prerequisite or make the physics test runnable without adding a Node requirement to the lightweight workflow
