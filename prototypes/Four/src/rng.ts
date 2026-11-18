/** Shared deterministic PRNG utilities (FNV-1a hash + mulberry32). */
export const DEFAULT_SEED = 'zombierun808';

export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createMulberry32(seedVal: number): () => number {
  let a = seedVal >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Independent stream for gameplay rolls, derived from the course seed + a salt. */
export function createGameplayRng(seed: string | undefined, salt = 'gameplay'): () => number {
  const s = (seed ?? '').trim() || DEFAULT_SEED;
  return createMulberry32(hashSeed(`${s}::${salt}`));
}
