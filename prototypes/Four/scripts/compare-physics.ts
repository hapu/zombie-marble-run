import { generateCourse } from '../src/courseGenerator';
import { SimulationEngine, initPhysicsEngine } from '../src/simulation';
import { setPhysicsConfig, physicsConfig, type PhysicsConfig } from '../src/physicsConfig';
import { buildMarbles } from './helpers';

const SEEDS = Number(process.env.SEEDS ?? 16);
const SECONDS = Number(process.env.SECONDS ?? 90);
const CONFIGS: Array<Partial<PhysicsConfig> & { label: string }> = [
  { label: '120Hz/6it (baseline)', hz: 120, solverIterations: 6, ccdSubsteps: 4 },
  { label: '120Hz/4it', hz: 120, solverIterations: 4, ccdSubsteps: 4 },
  { label: '60Hz/6it', hz: 60, solverIterations: 6, ccdSubsteps: 4 },
  { label: '60Hz/4it', hz: 60, solverIterations: 4, ccdSubsteps: 4 },
  { label: '90Hz/4it', hz: 90, solverIterations: 4, ccdSubsteps: 4 },
];

await initPhysicsEngine();
console.log(`${SEEDS} seeds x ${SECONDS}s race time per config\n`);
console.log('config'.padEnd(24), 'ms/sim-s', 'illegalJumps', 'outOfBounds', 'extracted', 'avgProgress', 'avgZombies');

const ONLY = process.env.ONLY?.split(',');
for (const cfg of CONFIGS.filter((c) => !ONLY || ONLY.some((o) => c.label.startsWith(o)))) {
  setPhysicsConfig(cfg);
  const ticks = SECONDS * physicsConfig.hz;
  let ms = 0, jumps = 0, oob = 0, extracted = 0, progress = 0, zombies = 0;
  for (let s = 0; s < SEEDS; s++) {
    const course = generateCourse(`cmp-${s}`);
    const marbles = buildMarbles(course);
    const eng = new SimulationEngine(course, marbles);
    const lastRoom = new Map<string, number>();
    const t0 = performance.now();
    for (let i = 0; i < ticks; i++) {
      eng.step();
      if (i % Math.round(physicsConfig.hz / 30) === 0) {
        for (const m of eng.getMarbles()) {
          if (m.gone || m.finished) continue;
          if (m.x < -20 || m.y < -20 || m.x > 2520 || m.y > 2520) oob++;
          const r = m.currentRoomId;
          const prev = lastRoom.get(m.id);
          if (r !== undefined && prev !== undefined && r !== prev) {
            const a = course.chunks[prev], b = course.chunks[r];
            const dc = b.col - a.col, dr = b.row - a.row;
            const legal =
              (dc === 1 && dr === 0 && a.doors!.e) || (dc === -1 && dr === 0 && a.doors!.w) ||
              (dr === 1 && dc === 0 && a.doors!.s) || (dr === -1 && dc === 0 && a.doors!.n);
            if (!legal) jumps++;
          }
          if (r !== undefined) lastRoom.set(m.id, r);
        }
      }
    }
    ms += performance.now() - t0;
    const ms2 = eng.getMarbles();
    extracted += ms2.filter((m) => m.isExtracted).length;
    progress += Math.max(...ms2.filter((m) => !m.id.startsWith('npc_')).map((m) => m.progressScore));
    zombies += ms2.filter((m) => m.isZombie && !m.gone).length;
    eng.dispose();
  }
  console.log(
    cfg.label.padEnd(24),
    (ms / (SEEDS * SECONDS)).toFixed(1).padStart(8),
    String(jumps).padStart(12), String(oob).padStart(11), String(extracted).padStart(9),
    (progress / SEEDS).toFixed(2).padStart(11), (zombies / SEEDS).toFixed(1).padStart(10),
  );
}
