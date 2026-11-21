import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { spawnMarbles, stepSim } from "../src/entities.js";
import { RACE_TIME_LIMIT } from "../src/gameConfig.js";
import { GRAVITY_MPS2 } from "../src/physicsUnits.js";

await RAPIER.init();

const world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
try {
  const race = makeWorld(world, 0, "race-time-limit", { diff: "normal" });
  spawnMarbles(world, race);

  stepSim(world, race, RACE_TIME_LIMIT - 1);
  assert.notEqual(race.gameOver, true, "race should continue before the time limit");

  stepSim(world, race, 1);
  assert.equal(race.gameOver, true, "race should end at the time limit");
} finally {
  world.free();
}

console.log("ok    race time limit boundary");
