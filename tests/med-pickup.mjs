import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { spawnMarbles, stepSim } from "../src/entities.js";
import { GRAVITY_MPS2, PHYSICS_HZ, pixelsToMeters } from "../src/physicsUnits.js";

await RAPIER.init();

let world;
try {
  world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
  world.timestep = 1 / PHYSICS_HZ;
  const race = makeWorld(world, 0, "med-pickup-regression", { diff: "normal" });
  spawnMarbles(world, race);

  assert.ok(race.pickups.length > 0, "seeded course should place medkit pickups");
  const marble = race.marbles[0];
  for (const other of race.marbles.slice(1)) other.gone = true;

  const pickup = race.pickups[0];
  marble.hp = 3;
  marble.rb.setTranslation({
    x: pixelsToMeters(pickup.x),
    y: pixelsToMeters(pickup.y),
  }, true);

  stepSim(world, race, 1 / PHYSICS_HZ);

  assert.equal(marble.hp, 5, "medkit should restore up to two missing HP");
  assert.equal(pickup.taken, true, "collected medkit should be consumed");
  assert.deepEqual(race.picks, [{ m: marble, kind: "med" }]);

  stepSim(world, race, 1 / PHYSICS_HZ);
  assert.equal(race.picks.length, 1, "a consumed medkit should not trigger again");
} finally {
  world?.free();
}

console.log("ok    seeded medkit pickup and healing");
