/** Shared physics types. */
import type { Marble, CourseData } from '../types';

export interface FocusTrigger {
  x: number;
  y: number;
  color: string;
  text: string;
  durationSec: number;
}

export type ColliderMeta =
  | { kind: 'marble'; marbleId: string }
  | { kind: 'bumper'; x: number; y: number; bounce: number }
  | { kind: 'wall' }
  | { kind: 'spinner' }
  | { kind: 'piston' }
  | { kind: 'pendulum' }
  | { kind: 'barricade' };

/** Per-tick values shared by the update stages (one reusable object per engine; mutated each tick). */
export interface TickCtx {
  course: CourseData;
  marbles: Marble[];
  raceTime: number;
  effectiveDt: number;
  stepScale: number;
  onFinishFirst: (winner: Marble) => void;
  finishedCount: number;
}
