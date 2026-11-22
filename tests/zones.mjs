import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { circ, makeWorld } from "../src/world.js";
import { stepSim } from "../src/entities.js";
import { GRAVITY_MPS2, PHYSICS_HZ, metersToPixels } from "../src/physicsUnits.js";

await RAPIER.init();

const routeWorld = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
let wind;
let lift;
try {
  const race = makeWorld(routeWorld, 0, "wind-lift-regression", { diff: "normal" });
  wind = race.zones.find(zone => zone.t === "wind");
  assert.ok(wind, "seeded course should include a wind zone");
} finally {
  routeWorld.free();
}

const mirroredWorld = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
try {
  const race = makeWorld(mirroredWorld, 0, "mirrored-wind-regression", {
    diff: "normal",
    up: true,
  });
  const cell = race.route.find(routeCell => routeCell.type === "U2" && routeCell.mir);
  assert.ok(cell, "upward route should include a mirrored rooftop chunk");
  const zone = race.zones.find(
    candidate => candidate.t === "wind" && candidate.y === cell.oy + 170 && candidate.w === 220,
  );
  assert.ok(zone, "mirrored rooftop should include a wind zone");
  assert.equal(zone.x, cell.ox + race.CS - 255, "wind zone center should mirror with the chunk");

  lift = race.zones.find(candidate => candidate.t === "lift");
  assert.ok(lift, "upward route should include a lift zone");
} finally {
  mirroredWorld.free();
}

function runZone(zone, gravity) {
  const world = new RAPIER.World({ x: 0, y: gravity });
  world.timestep = 1 / PHYSICS_HZ;
  const marble = circ(world, zone.x, zone.y, 9, null, {
    density: 0.002,
    frictionAir: 0,
    restitution: 0,
  });
  Object.assign(marble, { team: 0, zombie: false, gone: false, fin: 0 });
  const state = {
    simT: 0,
    tick: 0,
    zrel: true,
    zones: [zone],
    marbles: [marble],
    route: [],
    grid: [],
    pickups: [],
  };
  const start = marble.rb.translation();

  for (let i = 0; i < PHYSICS_HZ; i++) {
    stepSim(world, state, 1 / PHYSICS_HZ);
    world.step();
  }

  const result = {
    position: marble.rb.translation(),
    velocity: marble.rb.linvel(),
    userForce: marble.rb.userForce(),
    mass: marble.rb.mass(),
    start,
  };
  world.free();
  return result;
}

const windResult = runZone(wind, 0);
assert.ok(windResult.velocity.x > 1.8, "wind should accelerate marbles horizontally in m/s");
assert.ok(
  metersToPixels(windResult.position.x - windResult.start.x) > 45,
  "wind should move the marble more than 45 px in one second",
);
assert.ok(
  Math.abs(Math.abs(windResult.userForce.x) - windResult.mass * Math.abs(wind.ax)) < 0.2,
  "wind force should be reapplied each step, not accumulated",
);

const liftResult = runZone(lift, GRAVITY_MPS2);
assert.ok(liftResult.velocity.y < -2.4, "lift should overcome SI gravity and accelerate upward");
assert.ok(
  liftResult.position.y < liftResult.start.y - 1,
  "lift should raise the marble by more than one meter in one second",
);
assert.ok(
  Math.abs(Math.abs(liftResult.userForce.y) - liftResult.mass * Math.abs(lift.ay)) < 0.2,
  "lift force should be reapplied each step, not accumulated",
);

console.log("ok    seeded wind and lift SI motion");
