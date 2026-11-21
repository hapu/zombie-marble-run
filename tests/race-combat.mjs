import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import {
  spawnMarbles,
  spawnZombies,
  stepSim,
  checkCollisions,
} from "../src/entities.js";
import { combatStep, updateAbilityTarget } from "../src/combat.js";
import { GRAVITY_MPS2, PHYSICS_HZ } from "../src/physicsUnits.js";

await RAPIER.init();

const originalRandom = Math.random;
let randomState = 9;
Math.random = () => {
  randomState = (randomState * 16807) % 2147483647;
  return (randomState - 1) / 2147483646;
};

let world;
try {
  world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
  world.timestep = 1 / PHYSICS_HZ;
  world.numSolverIterations = 6;
  world.maxCcdSubsteps = 4;
  const race = makeWorld(world, 30, "combat-regression", { diff: "normal" });
  spawnMarbles(world, race);
  spawnZombies(world, race);

  for (let i = 0; i < PHYSICS_HZ * 20; i++) {
    const dt = 1 / PHYSICS_HZ;
    stepSim(world, race, dt);
    world.step();
    combatStep(race, dt);
    checkCollisions(world, race);
    updateAbilityTarget(race);
  }

  assert.ok(race.zrel, "normal-difficulty zombies should be released");
  assert.ok(race.shots.length > 0, "a normal race should produce weapon fire");
  assert.ok(race.kills.length > 0, "weapons should kill zombies during the race");
  assert.ok(race.hits.length > 0, "released zombies should threaten racers");
  assert.ok(race.infected.length > 0, "zombie contact should produce infections");
} finally {
  Math.random = originalRandom;
  world?.free();
}

console.log("ok    normal race produces combat");
