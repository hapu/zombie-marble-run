import { generateCourse } from '../src/courseGenerator';
import { SimulationEngine, initPhysicsEngine } from '../src/simulation';
import { buildMarbles } from './helpers';

const TICKS = Number(process.env.TICKS ?? 20000);
const SEEDS = (process.env.BENCH_SEEDS ?? 'bench-a,bench-b,bench-c').split(',');

await initPhysicsEngine();
let totalMs = 0, totalTicks = 0;
const hashes: string[] = [];
for (const seed of SEEDS) {
  const course = generateCourse(seed);
  const marbles = buildMarbles(course);
  const eng = new SimulationEngine(course, marbles);
  for (let i = 0; i < 600; i++) eng.step(); // warm-up JIT
  const t0 = performance.now();
  for (let i = 0; i < TICKS; i++) eng.step();
  const ms = performance.now() - t0;
  totalMs += ms; totalTicks += TICKS;
  const ms2 = eng.getMarbles();
  const h = ms2.slice().sort((a, b) => a.id.localeCompare(b.id))
    .map((m) => `${m.id}:${m.x.toFixed(2)},${m.y.toFixed(2)},${m.hp.toFixed(1)}`).join('|');
  hashes.push(`${seed} n=${ms2.length} t=${eng.getRaceTime().toFixed(1)} ${h.length}:${[...h].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)}`);
  eng.dispose();
}
console.log(`ms/tick: ${(totalMs / totalTicks).toFixed(4)}  (${(totalMs).toFixed(0)}ms for ${totalTicks} ticks)`);
if (process.env.HASH) console.log(hashes.join('\n'));
