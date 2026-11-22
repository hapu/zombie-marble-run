import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { spawnMarbles, spawnZombies, stepSim } from "../src/entities.js";
import { resetAbilityState } from "../src/combat.js";
import { GRAVITY_MPS2, PHYSICS_HZ, pixelsToMeters } from "../src/physicsUnits.js";

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

  // Directly simulate racers stuck in a D2 landing with no recent progress.
  const d2Index = race.route.findIndex(cell => cell.type === "D2");
  assert.ok(d2Index >= 0, "the course should contain a D2 landing");
  const d2 = race.route[d2Index];
  const stuck = race.marbles.filter(m => m.team >= 0).slice(0, 3);
  assert.equal(stuck.length, 3, "three racers should be available to stall");

  for (const m of stuck) {
    m.rb.setTranslation({
      x: pixelsToMeters(d2.ox + race.CS / 2),
      y: pixelsToMeters(d2.oy + race.CS / 2),
    }, true);
    m.rb.setLinvel({ x: 0, y: 0 }, true);
    m.ri = undefined;
    m.safe = null;
    m.fin = 0;
    m.gone = false;
    m.zombie = false;
    m._bestProgress = 1e9;
    m._progressAt = race.simT - 30;
  }

  stepSim(world, race, 1 / PHYSICS_HZ);
  world.step();

  assert.equal(race.rescues.length, stuck.length, "stalled D2 racers should be rescued");
  assert.ok(
    race.rescues.every(event =>
      event.ri === d2Index
      && event.to.x >= d2.ox + 9
      && event.to.x <= d2.ox + race.CS - 9
      && event.to.y === d2.oy + race.CS - 30
    ),
    "rescue diagnostics should identify D2 and a valid landing position",
  );
  assert.equal(
    new Set(race.rescues.map(event => event.to.x)).size,
    stuck.length,
    "rescued racers should be staggered into distinct positions",
  );
} finally {
  world.free();
  Math.random = originalRandom;
}

console.log("ok    stalled D2 racers are staggered and recorded");
