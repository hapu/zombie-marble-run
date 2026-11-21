import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { spawnMarbles, spawnZombies, stepSim, checkCollisions } from "../src/entities.js";
import { combatStep, updateAbilityTarget, resetAbilityState } from "../src/combat.js";
import { GRAVITY_MPS2, PHYSICS_HZ } from "../src/physicsUnits.js";

await RAPIER.init();

const originalRandom = Math.random;
let randomState = 10;
Math.random = () => {
  randomState = (randomState * 16807) % 2147483647;
  return (randomState - 1) / 2147483646;
};

const world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
world.timestep = 1 / PHYSICS_HZ;
world.numSolverIterations = 6;
world.maxCcdSubsteps = 4;
resetAbilityState();

try {
  const race = makeWorld(world, 30, "balance-1", { diff: "normal" });
  spawnMarbles(world, race);
  spawnZombies(world, race);
  for (let i = 0; i < PHYSICS_HZ * 45; i++) {
    const dt = 1 / PHYSICS_HZ;
    stepSim(world, race, dt);
    world.step();
    combatStep(race, dt);
    checkCollisions(world, race);
    updateAbilityTarget(race);
  }

  const humans = race.marbles.filter(m => m.team >= 0 && !m.fin && !m.zombie && !m.gone);
  const d2Index = race.route.findIndex(cell => cell.type === "D2" && cell.oy === 1080);
  const d2 = race.route[d2Index];
  assert.ok(race.rescues.length > 0, "stalled D2 racers should be rescued and recorded");
  assert.ok(
    Math.max(...humans.map(m => m.prog || 0)) > 5580,
    "rescued racers should progress beyond the reproducible D2 stall",
  );
  assert.ok(
    new Set(race.rescues.map(event => event.to.x)).size > 1,
    "rescued racers should be staggered into distinct positions",
  );
  assert.ok(
    race.rescues.every(event =>
      event.ri === d2Index
      && event.to.x >= d2.ox + 9
      && event.to.x <= d2.ox + race.CS - 9
      && event.to.y === d2.oy + race.CS - 30
    ),
    "rescue diagnostics should identify D2 and a valid staggered landing position",
  );
} finally {
  world.free();
  Math.random = originalRandom;
}

console.log("ok    stalled D2 racers are staggered and recorded");
