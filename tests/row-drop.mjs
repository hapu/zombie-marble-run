import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { spawnMarbles, spawnZombies, stepSim, checkCollisions } from "../src/entities.js";
import { combatStep, updateAbilityTarget, resetAbilityState } from "../src/combat.js";
import { GRAVITY_MPS2, PHYSICS_HZ } from "../src/physicsUnits.js";

await RAPIER.init();

function beltsIn(race, cell) {
  const beltY = cell.oy + race.CS - 45;
  return race.zones.filter(
    zone =>
      zone.t === "belt" &&
      zone.y === beltY &&
      zone.x >= cell.ox &&
      zone.x <= cell.ox + race.CS,
  );
}

function towardCenter(race, cell, zone) {
  return Math.sign(cell.ox + race.CS / 2 - zone.x);
}

const downWorld = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
try {
  const race = makeWorld(downWorld, 30, "row-drop-down", { diff: "normal" });
  const d1 = race.route.find(cell => cell.type === "D1");
  const d2 = race.route.find(cell => cell.type === "D2");
  assert.ok(d1, "downward route should include a drop chunk");
  assert.ok(d2, "downward route should include a landing chunk");

  const d1Belts = beltsIn(race, d1);
  assert.equal(d1Belts.length, 2, "drop chunk should have two converging belts");
  for (const belt of d1Belts) {
    assert.ok(belt.w < race.CS, "drop belts should be split, not full width");
    assert.equal(
      Math.sign(belt.f * belt.dir),
      towardCenter(race, d1, belt),
      "drop belts should push toward the central slot",
    );
  }
  assert.ok(
    d1Belts.some(belt => belt.f > 0) && d1Belts.some(belt => belt.f < 0),
    "drop belts should push in opposite directions",
  );

  const d1Obstacle = race.statics.find(
    obstacle =>
      (obstacle.kind === "bumper" || obstacle.kind === "peg") &&
      Math.abs(obstacle.x - (d1.ox + 180)) < 1 &&
      obstacle.y > d1.oy + 150 &&
      obstacle.y < d1.oy + 260,
  );
  assert.ok(d1Obstacle, "drop chunk should have a central obstacle");

  const d2Belts = beltsIn(race, d2);
  assert.equal(d2Belts.length, 1, "landing chunk should have one full-width belt");
  assert.equal(d2Belts[0].w, race.CS, "landing belt should span the chunk");
  assert.ok(
    !race.zones.some(
      zone =>
        zone.t === "lift" &&
        zone.x >= d2.ox &&
        zone.x <= d2.ox + race.CS &&
        zone.y >= d2.oy &&
        zone.y <= d2.oy + race.CS,
    ),
    "landing chunk should not lift marbles",
  );

  for (const localX of [150, 210]) {
    const x = d2.ox + (d2.mir ? race.CS - localX : localX);
    assert.ok(
      race.statics.some(
        peg =>
          peg.kind === "peg" &&
          Math.abs(peg.x - x) < 1 &&
          Math.abs(peg.y - (d2.oy + 170)) < 1,
      ),
      "landing chunk should have a peg at the top",
    );
  }
} finally {
  downWorld.free();
}

const upWorld = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
try {
  const race = makeWorld(upWorld, 30, "row-drop-up", { diff: "normal", up: true });
  const u1 = race.route.find(cell => cell.type === "U1");
  const u2 = race.route.find(cell => cell.type === "U2");
  assert.ok(u1 && u2, "upward route should include lift and rooftop chunks");

  const u1Belts = beltsIn(race, u1);
  assert.equal(u1Belts.length, 2, "lift chunk should have two converging belts");
  for (const belt of u1Belts) {
    assert.equal(
      Math.sign(belt.f * belt.dir),
      towardCenter(race, u1, belt),
      "lift belts should push toward the central lift",
    );
  }

  const u1Lift = race.zones.find(
    zone =>
      zone.t === "lift" &&
      Math.abs(zone.x - (u1.ox + 180)) < 1 &&
      Math.abs(zone.y - (u1.oy + 180)) < 1,
  );
  assert.ok(u1Lift, "lift chunk should have an upward zone");

  const u2Lift = race.zones.find(
    zone =>
      zone.t === "lift" &&
      Math.abs(zone.x - (u2.ox + 180)) < 1 &&
      Math.abs(zone.y - (u2.oy + 300)) < 1,
  );
  assert.ok(u2Lift, "rooftop chunk should have an upward zone");

  const u2Wind = race.zones.find(
    zone =>
      zone.t === "wind" &&
      zone.w === 220 &&
      zone.x === u2.ox + (u2.mir ? race.CS - 255 : 255),
  );
  assert.ok(u2Wind, "rooftop chunk should have its mirrored wind zone");
} finally {
  upWorld.free();
}

{
  const originalRandom = Math.random;
  let randomState = 12345;
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
    const race = makeWorld(world, 30, "row-drop-progress", { diff: "normal" });
    spawnMarbles(world, race);
    spawnZombies(world, race);

    for (let i = 0; i < PHYSICS_HZ * 15; i++) {
      const dt = 1 / PHYSICS_HZ;
      stepSim(world, race, dt);
      world.step();
      combatStep(race, dt);
      checkCollisions(world, race);
      updateAbilityTarget(race);
    }

    const humans = race.marbles.filter(marble => !marble.gone && !marble.zombie);
    const maxProgress = Math.max(...humans.map(marble => marble.prog || 0));
    assert.ok(
      maxProgress > 1000,
      `restored row drops should not stall the race, got ${maxProgress.toFixed(0)}`,
    );
    assert.equal(race.rescues.length, 0, "restored drop slots should not trigger D2 rescues");
  } finally {
    world.free();
    Math.random = originalRandom;
  }
}

console.log("ok    row drops, landing pegs, and lifts match the prototype");
