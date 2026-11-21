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
  lift = race.zones.find(zone => zone.t === "lift");
  assert.ok(wind, "seeded course should include a wind zone");
  assert.ok(lift, "course should include a landing lift zone");
} finally {
  routeWorld.free();
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

const liftResult = runZone(lift, GRAVITY_MPS2);
assert.ok(liftResult.velocity.y < -2.4, "lift should overcome SI gravity and accelerate upward");
assert.ok(
  liftResult.position.y < liftResult.start.y - 1,
  "lift should raise the marble by more than one meter in one second",
);

console.log("ok    seeded wind and lift SI motion");
