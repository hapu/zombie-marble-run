import { generateCourse } from '../src/courseGenerator';
import { SimulationEngine, initPhysicsEngine } from '../src/simulation';
import { buildMarbles, stateHash } from './helpers';

// End-to-end determinism: the same seed must produce a bit-identical race, run after run
// (covers zombie spawns, crate rolls, weapon swaps, Rapier stepping). Different seeds must differ.
const TICKS = Number(process.env.TICKS ?? 6000); // 50 s of race time
await initPhysicsEngine();

function run(seed: string): string {
  const course = generateCourse(seed);
  const eng = new SimulationEngine(course, buildMarbles(course));
  for (let i = 0; i < TICKS; i++) eng.step();
  const h = stateHash(eng.getMarbles());
  eng.dispose();
  return h;
}

let failures = 0;
for (const seed of ['sim-a', 'sim-b', 'sim-c']) {
  const h1 = run(seed), h2 = run(seed);
  if (h1 !== h2) { console.error(`FAIL ${seed}: runs diverged (${h1} vs ${h2})`); failures++; }
}
if (run('sim-a') === run('sim-b')) { console.error('FAIL: different seeds gave identical races'); failures++; }
console.log(failures ? `${failures} failure(s)` : `OK: ${TICKS}-tick races reproduce exactly`);
process.exit(failures ? 1 : 0);
