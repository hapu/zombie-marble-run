import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { GRAVITY_MPS2, PHYSICS_HZ, metersToPixels, pixelsToMeters } from "../src/physicsUnits.js";

await RAPIER.init();

const world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
world.timestep = 1 / PHYSICS_HZ;
world.numSolverIterations = 6;
world.maxCcdSubsteps = 4;

try {
  const race = makeWorld(world, 0, "obstacle-physics-0", { diff: "normal" });
  const pegs = race.statics.filter(obstacle => obstacle.kind === "peg");
  const bumpers = race.statics.filter(obstacle => obstacle.kind === "bumper");
  const pegRows = new Map();
  for (const peg of pegs) pegRows.set(peg.y, (pegRows.get(peg.y) || 0) + 1);
  assert.ok(
    [...pegRows.values()].some(count => count >= 6),
    "seeded track should include a six-peg sparse layout",
  );
  assert.ok(bumpers.length >= 1, "seeded track should include a bumper");

  const bumper = bumpers.find(candidate => candidate.rad >= 20) || bumpers[0];
  const position = bumper.rb.translation();
  assert.ok(Math.abs(metersToPixels(position.x) - bumper.x) < 1e-3);
  assert.ok(Math.abs(metersToPixels(position.y) - bumper.y) < 1e-3);

  const marble = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(
      pixelsToMeters(bumper.x - bumper.rad - 19),
      pixelsToMeters(bumper.y),
    ),
  );
  world.createCollider(
    RAPIER.ColliderDesc.ball(pixelsToMeters(9)).setRestitution(0.5).setDensity(5),
    marble,
  );
  marble.setLinvel({ x: pixelsToMeters(220), y: 0 }, true);

  for (let i = 0; i < 20; i++) world.step();
  assert.ok(
    metersToPixels(marble.translation().x) < bumper.x - bumper.rad,
    "marble should bounce clear of the static bumper",
  );
  assert.ok(marble.linvel().x < 0, "bumper collision should reverse horizontal velocity");
} finally {
  world.free();
}

console.log("ok    seeded static pegs and bumper physics");
