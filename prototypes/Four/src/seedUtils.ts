import { DEFAULT_SEED } from './rng';

/** Seed from the URL hash (`#seed=abc` or `#abc`), falling back to the default seed. */
export function getInitialSeedFromHash(): string {
  if (typeof window === 'undefined') return DEFAULT_SEED;
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return DEFAULT_SEED;
  if (raw.startsWith('seed=')) {
    const val = decodeURIComponent(raw.slice(5)).trim();
    return val || DEFAULT_SEED;
  }
  return decodeURIComponent(raw).trim() || DEFAULT_SEED;
}

/** Seed string shared by everyone on a given calendar day (local time). */
export function getDailySeedString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `d${y}${m}${day}`;
}
