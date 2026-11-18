import { generateCourse } from '../src/courseGenerator';
import { createGameplayRng } from '../src/rng';

const N = Number(process.env.SEEDS ?? 300);
let failures = 0;

for (let i = 0; i < N; i++) {
  const seed = `test-${i}`;
  const a = generateCourse(seed);
  const b = generateCourse(seed);

  if (JSON.stringify(a.chunks.map((c) => [c.doors, c.nextDir, c.walls.length])) !==
      JSON.stringify(b.chunks.map((c) => [c.doors, c.nextDir, c.walls.length]))) {
    console.error(`FAIL ${seed}: generation not deterministic`);
    failures++;
  }
  // isPathVerified is a constant in the generator, so verify reachability independently:
  // flood-fill the door graph from room 0 and require every room (incl. extraction) to be reachable,
  // with doors symmetric between neighbours.
  const cols = 5, rows = 5;
  const at = (c: number, r: number) => a.chunks[r * cols + c];
  const seen = new Set<number>([0]);
  const stack = [0];
  let symmetric = true;
  while (stack.length) {
    const id = stack.pop()!;
    const ch = a.chunks[id];
    const d = ch.doors!;
    const nb: Array<[boolean, number, number, 'n' | 'e' | 's' | 'w']> = [
      [d.n, ch.col, ch.row - 1, 's'], [d.s, ch.col, ch.row + 1, 'n'],
      [d.e, ch.col + 1, ch.row, 'w'], [d.w, ch.col - 1, ch.row, 'e'],
    ];
    for (const [open, c, r, back] of nb) {
      if (!open) continue;
      if (c < 0 || r < 0 || c >= cols || r >= rows) { symmetric = false; continue; }
      const n = at(c, r);
      if (!n.doors![back]) symmetric = false;
      if (!seen.has(n.id)) { seen.add(n.id); stack.push(n.id); }
    }
  }
  if (!symmetric) { console.error(`FAIL ${seed}: asymmetric/out-of-bounds door`); failures++; }
  if (seen.size !== cols * rows || !seen.has(24)) {
    console.error(`FAIL ${seed}: only ${seen.size}/25 rooms reachable`);
    failures++;
  }
}

// Gameplay RNG: same seed => same stream, different seed => different stream.
const r1 = createGameplayRng('x'), r2 = createGameplayRng('x'), r3 = createGameplayRng('y');
const s1 = Array.from({ length: 8 }, r1), s2 = Array.from({ length: 8 }, r2), s3 = Array.from({ length: 8 }, r3);
if (s1.join() !== s2.join()) { console.error('FAIL: gameplay RNG not repeatable'); failures++; }
if (s1.join() === s3.join()) { console.error('FAIL: gameplay RNG ignores seed'); failures++; }

console.log(failures ? `${failures} failure(s) across ${N} seeds` : `OK: ${N} seeds deterministic + verified`);
process.exit(failures ? 1 : 0);
