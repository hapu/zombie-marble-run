import { createCanvas, Path2D } from '@napi-rs/canvas';
(globalThis as any).Path2D = Path2D; // Path2D is a browser global; polyfill it for the headless benchmark
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { generateCourse } from '../src/courseGenerator';
import { SimulationEngine, initPhysicsEngine } from '../src/simulation';
import { renderCourse } from '../src/renderer';
import { buildMarbles } from './helpers';

const FRAMES = Number(process.env.FRAMES ?? 150);
const SAVE = process.env.SAVE; // directory to write PNGs into
const W = 1280, H = 720;

await initPhysicsEngine();
const course = generateCourse('render-bench');
const eng = new SimulationEngine(course, buildMarbles(course));
// Run ~25s of race so there are zombies, projectiles and particles on screen.
for (let i = 0; i < 25 * 60; i++) eng.step();
const marbles = eng.getMarbles();
const leader = eng.getLeader()!;

const ONLYSHOT = process.env.SHOT;
const shots0 = [
  { name: 'overview', x: 1250, y: 1250, zoom: Math.min(W, H) / 2600 },
  { name: 'half', x: leader.x, y: leader.y, zoom: 0.7 },
  { name: 'follow', x: leader.x, y: leader.y, zoom: 1.3 },
];
const shots = ONLYSHOT ? shots0.filter((x) => x.name === ONLYSHOT) : shots0;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
if (SAVE) mkdirSync(SAVE, { recursive: true });

console.log('shot'.padEnd(10), 'ms/frame', 'pixelHash');
for (const s of shots) {
  const draw = (t: number) =>
    renderCourse(ctx, course, marbles, W, H, s.x, s.y, s.zoom, t, eng.getProjectiles(), eng.getParticles(),
      eng.getFloatingTexts(), eng.getBarricades(), eng.getCombatFeed(), { followedMarbleId: leader.id, showSkyline: true, showParticles: true });
  for (let i = 0; i < 10; i++) draw(eng.getRaceTime()); // warm-up
  const t0 = performance.now();
  for (let i = 0; i < FRAMES; i++) draw(eng.getRaceTime() + i / 60);
  const ms = (performance.now() - t0) / FRAMES;
  draw(eng.getRaceTime()); // fixed time for a comparable frame
  const buf = canvas.toBuffer('image/png');
  if (SAVE) writeFileSync(`${SAVE}/${s.name}.png`, buf);
  const hash = createHash('md5').update(ctx.getImageData(0, 0, W, H).data as unknown as Uint8Array).digest('hex').slice(0, 10);
  console.log(s.name.padEnd(10), ms.toFixed(2).padStart(8), hash);
}
