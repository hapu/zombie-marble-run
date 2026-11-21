import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { circ, makeWorld, rect } from "../src/world.js";
import {
  spawnMarbles,
  spawnZombies,
  stepSim,
  checkCollisions,
} from "../src/entities.js";
import { combatStep, updateAbilityTarget } from "../src/combat.js";
import {
  GRAVITY_MPS2,
  PHYSICS_HZ,
  PX_PER_METER,
  metersToPixels,
  pixelsToMeters,
} from "../src/physicsUnits.js";

await RAPIER.init();

assert.equal(PX_PER_METER, 50);
assert.equal(PHYSICS_HZ, 60);
assert.equal(pixelsToMeters(50), 1);
assert.equal(metersToPixels(1), 50);

const world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
world.timestep = 1 / PHYSICS_HZ;
const marble = circ(world, 100, 200, 9, null, {
  density: 0.002,
  frictionAir: 0,
});
assert.ok(Math.abs(marble.rb.translation().x - 2) < 1e-6);
assert.ok(Math.abs(marble.rb.translation().y - 4) < 1e-6);
assert.ok(Math.abs(marble.rb.mass() - Math.PI * 9 * 9 * 0.002) < 1e-4);

const wall = rect(world, 20, 20, 30, 30);
const wallMaterial = wall.rb.collider(0);
assert.ok(Math.abs(wallMaterial.friction() - 0.02) < 1e-6);
assert.ok(Math.abs(wallMaterial.restitution() - 0.25) < 1e-6);

for (let i = 0; i < PHYSICS_HZ; i++) world.step();
const fallPx = metersToPixels(marble.rb.translation().y - 4);
assert.ok(fallPx > 240 && fallPx < 260, `expected about 250 px fall, got ${fallPx}`);

world.free();

const raceWorld = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
raceWorld.timestep = 1 / PHYSICS_HZ;
raceWorld.numSolverIterations = 6;
raceWorld.maxCcdSubsteps = 4;
const race = makeWorld(raceWorld, 30, "unit-integration", { diff: "normal" });
spawnMarbles(raceWorld, race);
spawnZombies(raceWorld, race);
for (let i = 0; i < PHYSICS_HZ * 5; i++) {
  stepSim(raceWorld, race, 1 / PHYSICS_HZ);
  raceWorld.step();
  combatStep(race, 1 / PHYSICS_HZ);
  checkCollisions(raceWorld, race);
  updateAbilityTarget(race);

  for (const entity of race.marbles) {
    const position = entity.rb.translation();
    const velocity = entity.rb.linvel();
    assert.ok(
      [position.x, position.y, velocity.x, velocity.y].every(Number.isFinite),
      "race body state must remain finite",
    );
  }
}
assert.ok(race.zrel, "zombies should release after the configured delay");
raceWorld.free();

console.log("ok    SI physics units and pixel conversions");
console.log("ok    5-second SI race integration");
