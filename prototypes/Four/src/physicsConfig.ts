/**
 * Central physics tuning. All gameplay constants below were originally tuned at 120 Hz / 6 solver
 * iterations; anything that was written "per tick" is converted through these helpers so changing
 * the tick rate keeps behaviour (damping per second, stuck timeouts, replay rate) the same.
 */
export interface PhysicsConfig {
  /** Fixed simulation ticks per second. */
  hz: number;
  /** Rapier velocity-solver iterations per tick. */
  solverIterations: number;
  /** Rapier continuous-collision-detection sub-steps (guards against tunneling). */
  ccdSubsteps: number;
}

/** Rate the original per-tick constants were tuned for. */
export const REFERENCE_HZ = 120;

/**
 * 60 Hz / 6 iterations: measured 2.4x cheaper per simulated second than 120 Hz / 6 with no tunneling
 * (0 illegal room jumps, 0 out-of-bounds) and equivalent race outcomes. See scripts/compare-physics.ts.
 */
export const physicsConfig: PhysicsConfig = {
  hz: 60,
  solverIterations: 6,
  ccdSubsteps: 4,
};

export function setPhysicsConfig(patch: Partial<PhysicsConfig>) {
  Object.assign(physicsConfig, patch);
}

export const fixedTimestep = () => 1 / physicsConfig.hz;

/** Convert a tick count tuned at REFERENCE_HZ into ticks at the current rate. */
export const ticksAtCurrentRate = (referenceTicks: number) =>
  Math.max(1, Math.round((referenceTicks * physicsConfig.hz) / REFERENCE_HZ));

/** Per-tick multiplicative damping tuned at REFERENCE_HZ, re-expressed for an arbitrary dt. */
export const dampingForDt = (perReferenceTick: number, dt: number) =>
  Math.pow(perReferenceTick, dt * REFERENCE_HZ);
