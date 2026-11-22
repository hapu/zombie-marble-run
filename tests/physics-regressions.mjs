import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { circ, makeWorld } from "../src/world.js";
import { spawnMarbles, spawnZombies, stepSim, checkCollisions } from "../src/entities.js";
import { combatStep, updateAbilityTarget, resetAbilityState } from "../src/combat.js";
import {
  GRAVITY_MPS2,
  PHYSICS_HZ,
  metersToPixels,
  pixelsToMeters,
} from "../src/physicsUnits.js";

await RAPIER.init();

function makeState(zones, marble) {
  return {
    simT: 0,
    tick: 0,
    zrel: true,
    zones,
    marbles: [marble],
    route: [],
    grid: [],
    pickups: [],
  };
}

// Rapier forces persist across steps; leaving a zone must clear them.
{
  const world = new RAPIER.World({ x: 0, y: 0 });
  world.timestep = 1 / PHYSICS_HZ;
  const marble = circ(world, 0, 0, 9, null, { density: 0.002, frictionAir: 0 });
  Object.assign(marble, { team: 0, zombie: false, gone: false, fin: 0 });
  const zone = { t: "wind", x: 0, y: 0, w: 200, h: 200, ax: 2, ay: 0, dir: 1 };
  const state = makeState([zone], marble);

  for (let i = 0; i < PHYSICS_HZ; i++) {
    stepSim(world, state, 1 / PHYSICS_HZ);
    world.step();
  }
  const inZone = metersToPixels(marble.rb.linvel().x);
  assert.ok(inZone > 90, "wind should accelerate the marble while inside the zone");

  marble.rb.setTranslation({ x: pixelsToMeters(1000), y: 0 }, true);
  marble.rb.setLinvel({ x: 0, y: 0 }, true);
  for (let i = 0; i < PHYSICS_HZ; i++) {
    stepSim(world, state, 1 / PHYSICS_HZ);
    world.step();
  }
  const after = metersToPixels(marble.rb.linvel().x);
  const residual = marble.rb.userForce();
  assert.ok(Math.abs(after) < 1, "wind force must not keep pushing after leaving the zone");
  assert.ok(Math.hypot(residual.x, residual.y) < 1e-6, "user force should be cleared");
  world.free();
}

// Belts move marbles at their configured speed and bleed momentum on exit.
for (const dir of [1, -1]) {
  const world = new RAPIER.World({ x: 0, y: 0 });
  world.timestep = 1 / PHYSICS_HZ;
  const marble = circ(world, 0, 0, 9, null, { density: 0.002, frictionAir: 0 });
  Object.assign(marble, { team: 0, zombie: false, gone: false, fin: 0 });
  const belt = { t: "belt", x: 0, y: 0, w: 4000, h: 1000, f: 1, dir };
  const state = makeState([belt], marble);

  for (let i = 0; i < PHYSICS_HZ * 2; i++) {
    stepSim(world, state, 1 / PHYSICS_HZ);
    world.step();
  }
  const beltSpeed = metersToPixels(marble.rb.linvel().x);
  assert.ok(
    Math.abs(beltSpeed - dir * 140) < 1,
    `belt should reach its target speed in direction ${dir}, got ${beltSpeed}`,
  );

  state.zones = [];
  for (let i = 0; i < PHYSICS_HZ; i++) {
    stepSim(world, state, 1 / PHYSICS_HZ);
    world.step();
  }
  const afterBelt = metersToPixels(marble.rb.linvel().x);
  assert.ok(
    Math.abs(afterBelt) < Math.abs(beltSpeed) * 0.25,
    "conveyor momentum should bleed off after leaving a belt",
  );
  world.free();
}

// Bodies must stay inside the course while a full race runs.
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
    const race = makeWorld(world, 30, "physics-regression", { diff: "normal" });
    spawnMarbles(world, race);
    spawnZombies(world, race);
    const maxX = race.COLS * race.CS;
    const maxY = race.ROWS * race.CS;
    const margin = 24;

    for (let i = 0; i < PHYSICS_HZ * 30; i++) {
      const dt = 1 / PHYSICS_HZ;
      stepSim(world, race, dt);
      world.step();
      combatStep(race, dt);
      checkCollisions(world, race);
      updateAbilityTarget(race);

      for (const entity of race.marbles) {
        if (entity.gone) continue;
        const position = entity.rb.translation();
        const px = metersToPixels(position.x);
        const py = metersToPixels(position.y);
        assert.ok(Number.isFinite(px) && Number.isFinite(py), "body position must remain finite");
        assert.ok(
          px >= -margin && px <= maxX + margin,
          `body escaped course horizontally at x=${px.toFixed(0)}`,
        );
        assert.ok(
          py >= -margin && py <= maxY + margin,
          `body escaped course vertically at y=${py.toFixed(0)}`,
        );
      }
    }
  } finally {
    world.free();
    Math.random = originalRandom;
  }
}

console.log("ok    zone forces clear, belts bleed off, race stays contained");
