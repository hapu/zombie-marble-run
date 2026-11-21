import assert from "node:assert/strict";
import RAPIER from "../vendor/rapier.mjs";
import { makeWorld } from "../src/world.js";
import { spawnMarbles, spawnZombies, stepSim, checkCollisions } from "../src/entities.js";
import { GRAVITY_MPS2, PHYSICS_HZ, pixelsToMeters } from "../src/physicsUnits.js";

await RAPIER.init();

let world;
try {
  world = new RAPIER.World({ x: 0, y: GRAVITY_MPS2 });
  world.timestep = 1 / PHYSICS_HZ;
  const race = makeWorld(world, 1, "target-filtering", { diff: "normal" });
  spawnMarbles(world, race);
  spawnZombies(world, race, 1);

  const [living, infected, finished, gone] = race.marbles;
  const zombie = race.zombies[0];
  const retained = new Set([living, infected, finished, gone, zombie]);
  for (const marble of race.marbles) {
    if (!retained.has(marble)) world.removeRigidBody(marble.rb);
  }
  race.marbles = [living, infected, finished, gone, zombie];
  race.bodies = race.bodies.filter(marble => retained.has(marble));
  race.zombies = [zombie];

  infected.zombie = true;
  finished.fin = 1;
  gone.gone = true;
  race.zrel = true;

  function place(marble, x, y) {
    marble.rb.setTranslation({ x: pixelsToMeters(x), y: pixelsToMeters(y) }, true);
    marble.rb.setLinvel({ x: 0, y: 0 }, true);
  }

  place(zombie, 100, 100);
  place(infected, 65, 100);
  place(finished, 75, 100);
  place(gone, 77, 100);
  place(living, 220, 100);
  stepSim(world, race, 1 / PHYSICS_HZ);
  world.step();
  assert.ok(zombie.rb.linvel().x > 0, "zombie should pursue the living human, not the closer inactive racers");

  place(zombie, 100, 100);
  place(infected, 90, 100);
  place(finished, 95, 100);
  place(gone, 93, 100);
  place(living, 115, 100);
  const infectedHp = infected.hp;
  const finishedHp = finished.hp;
  const goneHp = gone.hp;
  checkCollisions(world, race);

  assert.equal(infected.hp, infectedHp, "infected racers must not be infected again");
  assert.equal(finished.hp, finishedHp, "finished racers must not be infected");
  assert.equal(gone.hp, goneHp, "gone racers must not be infected");
  assert.deepEqual(race.hits, [living], "only the living, unfinished human should be hit");
} finally {
  world?.free();
}

console.log("ok    zombie pursuit and infection target filtering");
